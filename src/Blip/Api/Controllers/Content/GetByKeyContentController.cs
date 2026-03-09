using System.Reflection.Emit;
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
using Umbraco.Extensions;

namespace Blip.Api.Controllers.Content;

[ApiVersion(1.0)]
public class GetByKeyContentController(
    IContentService contentService,
    IBackOfficeSecurityAccessor backOfficeSecurityAccessor,
    IUserGroupService userGroupService,
    IIdKeyMap idKeyMap,
    IDataTypeService dataTypeService,
    IUmbracoMapper umbracoMapper)
    : BlipControllerBase
{
    private readonly IContentService _contentService = contentService;
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
    private readonly IUserGroupService _userGroupService = userGroupService;
    private readonly IIdKeyMap _idKeyMap = idKeyMap;
    private readonly IDataTypeService _dataTypeService = dataTypeService;
    private readonly IUmbracoMapper _umbracoMapper = umbracoMapper;

    [HttpGet]
    [ProducesResponseType(typeof(ContentSlim), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetById(Guid key, string propertyAlias)
    {
        IUser? currentUser = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser;
        if (currentUser is null)
        {
            return BadRequest();
        }

        (bool flowControl, IActionResult? value) = GetSourceData(
            key,
            propertyAlias,
            out IContent? foundContent,
            out DocumentValueResponseModel? sourceValue,
            out IProperty? sourceProperty);

        if (!flowControl)
        {
            return value!;
        }

        (flowControl, object? blockConfig) = await GetBlockConfig(sourceProperty);
        if (!flowControl)
        {
            return NotFound();
        }

        ContentSlim slim = new()
        {
            Variants = MapVariantsToDisplay(foundContent),
            SourceValue = sourceValue?.Value,
            BlockConfiguration = blockConfig,
            CanEdit = await CurrentUserCanEditSourceDocument(currentUser, foundContent),
        };

        return Ok(slim);
    }

    private async Task<(bool flowControl, object? blockConfig)> GetBlockConfig(IProperty? sourceProperty)
    {
        Guid? dataTypeKey = sourceProperty?
            .PropertyType
            .DataTypeKey;

        if (dataTypeKey is null)
        {
            return (flowControl: false, blockConfig: null);
        }

        IDataType? dataType = await _dataTypeService.GetAsync(dataTypeKey.Value);
        if (dataType is null)
        {
            return (flowControl: false, blockConfig: null);
        }

        DataTypeResponseModel? sourceDataType = _umbracoMapper.Map<DataTypeResponseModel>(dataType);
        object? blockConfig = sourceDataType?.Values.FirstOrDefault(x => x.Alias.Equals("blocks", StringComparison.OrdinalIgnoreCase))?.Value;

        return (flowControl: true, blockConfig);
    }

    private (bool flowControl, IActionResult? value) GetSourceData(
        Guid key,
        string propertyAlias,
        out IContent? foundContent,
        out DocumentValueResponseModel? sourceValue,
        out IProperty? sourceProperty)
    {
        sourceValue = null;
        sourceProperty = null;

        foundContent = _contentService.GetById(key);
        if (foundContent is null)
        {
            return (flowControl: false, value: NotFound());
        }

        DocumentResponseModel? sourceDocument = _umbracoMapper.Map<DocumentResponseModel>(foundContent);
        sourceValue = sourceDocument?.Values.FirstOrDefault(x => x.Alias.Equals(propertyAlias, StringComparison.OrdinalIgnoreCase));
        if (sourceValue is null)
        {
            return (flowControl: false, value: NotFound());
        }

        sourceProperty = foundContent
            .Properties
            .FirstOrDefault(x => x.Alias.Equals(propertyAlias, StringComparison.OrdinalIgnoreCase));
        if (sourceProperty is null)
        {
            return (flowControl: false, value: BadRequest());
        }

        return (flowControl: true, value: null);
    }

    private async Task<bool> CurrentUserCanEditSourceDocument(IUser currentUser, IContent? foundContent)
    {
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
}
