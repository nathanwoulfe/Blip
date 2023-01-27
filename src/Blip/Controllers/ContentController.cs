using Blip.Models;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Actions;
using Umbraco.Cms.Core.Dictionary;
using Umbraco.Cms.Core.Mapping;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.ContentEditing;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Extensions;

namespace Blip.Controllers;


[PluginController("Blip")]
public class ContentController : UmbracoAuthorizedApiController
{
    private readonly IScopeProvider _scopeProvider;
    private readonly IContentTypeService _contentTypeService;
    private readonly ILocalizedTextService _localizedTextService;
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;
    private readonly IContentService _contentService;
    private readonly IUmbracoMapper _umbracoMapper;
    private readonly ICultureDictionary _cultureDictionary;

    public ContentController(
        IScopeProvider scopeProvider,
        IContentTypeService contentTypeService,
        ILocalizedTextService localizedTextService,
        IBackOfficeSecurityAccessor backOfficeSecurityAccessor,
        IContentService contentService,
        IUmbracoMapper umbracoMapper,
        ICultureDictionary cultureDictionary)

    {
        _scopeProvider = scopeProvider;
        _contentTypeService = contentTypeService;
        _localizedTextService = localizedTextService;
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
        _contentService = contentService;
        _umbracoMapper = umbracoMapper;
        _cultureDictionary = cultureDictionary;
    }


    public ContentSlim? GetById(Udi? id)
    {
        if (id is not GuidUdi guidUdi)
        {
            return null;
        }

        IContent? foundContent = GetObjectFromRequest(() => _contentService.GetById(guidUdi.Guid));
        if (foundContent is null)
        {
            return null;
        }

        IUser? currentUser = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser;

        ContentItemDisplay? content = MapToDisplay(foundContent, context => context.Items["CurrentUser"] = currentUser);

        if (content is null)
        {
            return null;
        }

        ContentSlim slim = new()
        {
            Id = content.Id,
            Variants = content.Variants,
            AllowedActions = content.AllowedActions,
        };

        // if the user has a start Id, and the node is outside any of those ids,
        // remove the browse permission
        if (currentUser?.StartContentIds?.Any() ?? false)
        {
            IEnumerable<int> pathIds = foundContent.Path.Split(',').Select(int.Parse);
            if (!pathIds.Intersect(currentUser.StartContentIds).Any())
            {
                slim.AllowedActions = content.AllowedActions?.Except(new string[]
                    {
                        ActionBrowse.ActionLetter.ToString(),
                        ActionUpdate.ActionLetter.ToString(),
                    });
            }
        }

        return slim;
    }

    /// <summary>
    /// Gets a collection of empty content items for all document types.
    /// </summary>
    /// <param name="model"></param>
    [HttpPost]
    public ActionResult<IDictionary<Guid, ContentItemDisplay>> GetEmptyByKeys(ScaffoldModel model)
    {
        using IScope scope = _scopeProvider.CreateScope(autoComplete: true);
        var contentTypes = _contentTypeService.GetAll(model.ContentTypeKeys).ToList();
        return GetEmpties(contentTypes, model.ParentId).ToDictionary(x => x.ContentTypeKey);
    }

    /// <summary>
    /// Gets an empty <see cref="ContentItemDisplay"/> for each content type in the IEnumerable, all with the same parent ID
    /// </summary>
    /// <remarks>Will attempt to re-use the same permissions for every content as long as the path and user are the same</remarks>
    /// <param name="contentTypes"></param>
    /// <param name="parentId"></param>
    /// <returns></returns>
    private IEnumerable<ContentItemDisplay> GetEmpties(IEnumerable<IContentType> contentTypes, int parentId)
    {
        List<ContentItemDisplay> result = new();

        IBackOfficeSecurity? backOfficeSecurity = _backOfficeSecurityAccessor.BackOfficeSecurity;
        int userId = backOfficeSecurity?.GetUserId().Result ?? Constants.Security.SuperUserId;
        IUser? currentUser = backOfficeSecurity?.CurrentUser;

        foreach (IContentType contentType in contentTypes)
        {
            IContent emptyContent = _contentService.Create(string.Empty, parentId, contentType, userId);
            ContentItemDisplay? mapped = MapToDisplay(emptyContent, context => context.Items["CurrentUser"] = currentUser);

            if (mapped is null)
            {
                continue;
            }

            result.Add(CleanContentItemDisplay(mapped));
        }

        return result;
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="display"></param>
    /// <returns></returns>
    private ContentItemDisplay CleanContentItemDisplay(ContentItemDisplay display)
    {
        // translate the content type name if applicable
        display.ContentTypeName = UmbracoDictionaryTranslate(_localizedTextService, display.ContentTypeName, _cultureDictionary);

        // if your user type doesn't have access to the Settings section it would not get this property mapped
        if (display.DocumentType is not null)
        {
            display.DocumentType.Name = UmbracoDictionaryTranslate(_localizedTextService, display.DocumentType.Name, _cultureDictionary);
        }

        // remove the listview app if it exists
        display.ContentApps = display.ContentApps.Where(x => x.Alias != "umbListView").ToList();

        return display;
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="manager"></param>
    /// <param name="text"></param>
    /// <param name="cultureDictionary"></param>
    /// <returns></returns>
    private string? UmbracoDictionaryTranslate(ILocalizedTextService manager, string? text, ICultureDictionary cultureDictionary)
    {
        if (text is null)
        {
            return null;
        }

        if (text.StartsWith("#") == false)
        {
            return text;
        }

        text = text[1..];
        string? value = cultureDictionary[text];

        if (value.IsNullOrWhiteSpace() == false)
        {
            return value;
        }

        string[] splitValues = text.Split('_');
        value = manager.Localize(splitValues[0], splitValues[1]);

        return value.StartsWith("[") ? text : value;
    }

    /// <summary>
    /// Used to map an <see cref="IContent"/> instance to a <see cref="ContentItemDisplay"/> and ensuring AllowPreview is set correctly.
    /// Also allows you to pass in an action for the mapper context where you can pass additional information on to the mapper.
    /// </summary>
    /// <param name="content"></param>
    /// <param name="contextOptions"></param>
    /// <returns></returns>
    private ContentItemDisplay? MapToDisplay(IContent content, Action<MapperContext> contextOptions)
    {
        ContentItemDisplay? display = _umbracoMapper.Map<ContentItemDisplay>(content, contextOptions);

        if (display is null)
        {
            return null;
        }

        display.AllowPreview = display.AllowPreview && content.Trashed == false && content.ContentType.IsElement == false;

        return display;
    }


    /// <summary>
    /// Checks if the request contains the key and the item is not null, if that is the case, return it from the request, otherwise return it from the callback
    /// </summary>
    /// <typeparam name="TPersisted"></typeparam>
    /// <param name="getFromService"></param>
    /// <returns></returns>
    protected TPersisted? GetObjectFromRequest<TPersisted>(Func<TPersisted> getFromService)
        => HttpContext.Items.ContainsKey(typeof(TPersisted).ToString()) && HttpContext.Items[typeof(TPersisted).ToString()] is not null
            ? (TPersisted?)HttpContext.Items[typeof(TPersisted).ToString()]
            : getFromService();
}
