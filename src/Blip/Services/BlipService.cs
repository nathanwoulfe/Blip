using Blip.Models;
using Umbraco.Cms.Api.Management.ViewModels.DataType;
using Umbraco.Cms.Api.Management.ViewModels.Document;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Actions;
using Umbraco.Cms.Core.Mapping;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Models.Membership.Permissions;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;

namespace Blip.Services;

public class BlipService : IBlipService
{
    private readonly IUmbracoMapper _umbracoMapper;
    private readonly IDataTypeService _dataTypeService;
    private readonly IContentService _contentService;
    private readonly IIdKeyMap _idKeyMap;
    private readonly IUserGroupService _userGroupService;
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;

    public BlipService(
        IUmbracoMapper umbracoMapper,
        IDataTypeService dataTypeService,
        IContentService contentService,
        IIdKeyMap idKeyMap,
        IUserGroupService userGroupService,
        IBackOfficeSecurityAccessor backOfficeSecurityAccessor)
    {
        _umbracoMapper = umbracoMapper;
        _dataTypeService = dataTypeService;
        _contentService = contentService;
        _idKeyMap = idKeyMap;
        _userGroupService = userGroupService;
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
    }

    public async Task<Attempt<ContentSlim?, BlipOperationStatus>> GetContentByKey(Guid key, string propertyAlias, string? culture = null)
    {
        IContent? foundContent = _contentService.GetById(key);
        if (foundContent is null)
        {
            return Attempt.FailWithStatus(BlipOperationStatus.ContentNotFound, (ContentSlim?)null);
        }

        DocumentResponseModel? sourceDocument = _umbracoMapper.Map<DocumentResponseModel>(foundContent);
        IEnumerable<DocumentValueResponseModel>? matchingValues = sourceDocument?.Values
            .Where(x => x.Alias.Equals(propertyAlias, StringComparison.OrdinalIgnoreCase));

        DocumentValueResponseModel? sourceValue;
        if (!string.IsNullOrEmpty(culture))
        {
            sourceValue = matchingValues?
                .FirstOrDefault(x => culture.Equals(x.Culture, StringComparison.OrdinalIgnoreCase))
                ?? matchingValues?.FirstOrDefault(x => x.Culture is null);
        }
        else
        {
            sourceValue = matchingValues?.FirstOrDefault(x => x.Culture is null)
                ?? matchingValues?.FirstOrDefault();
        }

        if (sourceValue is null)
        {
            return Attempt.FailWithStatus(BlipOperationStatus.PropertyValueNotFound, (ContentSlim?)null);
        }

        IProperty? sourceProperty = foundContent
            .Properties
            .FirstOrDefault(x => x.Alias.Equals(propertyAlias, StringComparison.OrdinalIgnoreCase));

        if (sourceProperty is null)
        {
            return Attempt.FailWithStatus(BlipOperationStatus.PropertyNotFound, (ContentSlim?)null);
        }

        object? blockConfig = await GetBlockConfig(sourceProperty);
        if (blockConfig is null)
        {
            return Attempt.FailWithStatus(BlipOperationStatus.BlockConfigNotFound, (ContentSlim?)null);
        }

        ContentSlim slim = new()
        {
            Variants = MapVariantsToDisplay(foundContent),
            SourceValue = sourceValue.Value,
            BlockConfiguration = blockConfig,
            CanEdit = await CurrentUserCanEditSourceDocument(foundContent),
        };

        return Attempt.SucceedWithStatus(BlipOperationStatus.Success, (ContentSlim?)slim);
    }

    private async Task<object?> GetBlockConfig(IProperty sourceProperty)
    {
        Guid? dataTypeKey = sourceProperty.PropertyType.DataTypeKey;
        if (dataTypeKey is null)
        {
            return null;
        }

        IDataType? dataType = await _dataTypeService.GetAsync(dataTypeKey.Value);
        if (dataType is null)
        {
            return null;
        }

        DataTypeResponseModel? sourceDataType = _umbracoMapper.Map<DataTypeResponseModel>(dataType);
        return sourceDataType?.Values
            .FirstOrDefault(x => x.Alias.Equals("blocks", StringComparison.OrdinalIgnoreCase))?.Value;
    }

    private async Task<bool> CurrentUserCanEditSourceDocument(IContent? foundContent)
    {
        // should never be true - API layer also checks
        if (_backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser is not IUser currentUser)
        {
            return false;
        }

        if (foundContent is null)
        {
            return false;
        }

        // Check if the current user can edit the source node.
        // Walk the ancestor path from node to root; the first group
        // with a granular document permission on any path node wins,
        // otherwise fall back to the group's default permissions.
        List<Guid> pathKeys = [foundContent.Key];
        IEnumerable<int> ancestorIds = foundContent.Path.Split(',')
            .Select(int.Parse)
            .Where(id => id > 0 && id != foundContent.Id)
            .Reverse();

        foreach (var id in ancestorIds)
        {
            Attempt<Guid> attempt = _idKeyMap.GetKeyForId(id, UmbracoObjectTypes.Document);
            if (attempt.Success)
            {
                pathKeys.Add(attempt.Result);
            }
        }

        IEnumerable<IUserGroup> userGroups = await _userGroupService.GetAsync(currentUser.Groups.Select(x => x.Id).ToArray());

        bool canEdit = userGroups.Any(group =>
        {
            // Find all permissions for documents
            IEnumerable<IGranularPermission> docPerms = group.GranularPermissions
                .Where(gp => gp.Context == "Document" && gp.Key.HasValue);

            foreach (Guid pathKey in pathKeys)
            {
                // find all document permissions for this path node
                IEnumerable<IGranularPermission> nodePerms = docPerms.Where(gp => gp.Key!.Value == pathKey);
                if (nodePerms.Any())
                {
                    // return if any permissions for this doc are update
                    return nodePerms.Any(gp => gp.Permission == ActionUpdate.ActionLetter);
                }
            }

            // fallback to fallback
            return group.Permissions.Contains(ActionUpdate.ActionLetter);
        });

        return canEdit;
    }

    /// <summary>
    /// Maps an <see cref="IContent"/> instance to a <see cref="BlipContentDisplay"/>.
    /// </summary>
    private IEnumerable<BlipVariantDisplay> MapVariantsToDisplay(IContent? content)
    {
        List<BlipVariantDisplay> variants = [];

        if (content is null)
        {
            return variants;
        }

        if (content.ContentType.Variations.HasFlag(ContentVariation.Culture))
        {
            foreach (ContentCultureInfos culture in content.CultureInfos ?? [])
            {
                variants.Add(new()
                {
                    Culture = culture.Culture,
                    Name = culture.Name,
                });
            }
        }
        else
        {
            variants.Add(new()
            {
                Name = content.Name,
            });
        }

        return variants;
    }
}
