using Blip.Models;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Dictionary;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace Blip.Api.Controllers.Content;

[ApiVersion(1.0)]
public class GetEmptyByKeysController(
    IContentService contentService,
    IBackOfficeSecurityAccessor backOfficeSecurityAccessor,
    IContentTypeService contentTypeService,
    ICultureDictionary cultureDictionary,
    ILocalizedTextService localizedTextService)
    : BlipControllerBase(contentService, backOfficeSecurityAccessor)
{
    private readonly IContentTypeService _contentTypeService = contentTypeService;
    private readonly ICultureDictionary _cultureDictionary = cultureDictionary;
    private readonly ILocalizedTextService _localizedTextService = localizedTextService;

    /// <summary>
    /// Gets a collection of empty content items for all document types.
    /// </summary>
    /// <param name="model"></param>
    [HttpPost("empty-by-keys")]
    [ProducesResponseType(typeof(IDictionary<Guid, BlipContentDisplay>), StatusCodes.Status200OK)]
    public async Task<IActionResult> EmptyByKeys(ScaffoldModel model)
    {
        IEnumerable<IContentType> contentTypes = _contentTypeService.GetMany(model.ContentTypeKeys);
        var result = GetEmpties(contentTypes, model.ParentId).ToDictionary(x => x.ContentTypeKey);
        return Ok(result);
    }

    /// <summary>
    /// Gets an empty <see cref="BlipContentDisplay"/> for each content type in the IEnumerable, all with the same parent ID.
    /// </summary>
    protected IEnumerable<BlipContentDisplay> GetEmpties(IEnumerable<IContentType> contentTypes, int parentId)
    {
        List<BlipContentDisplay> result = [];

        IBackOfficeSecurity? backOfficeSecurity = BackOfficeSecurityAccessor.BackOfficeSecurity;
        IUser? currentUser = backOfficeSecurity?.CurrentUser;

        foreach (IContentType contentType in contentTypes)
        {
            IContent emptyContent = ContentService.Create(string.Empty, parentId, contentType, currentUser?.Id ?? Constants.Security.SuperUserId);
            BlipContentDisplay mapped = MapToDisplay(emptyContent);

            result.Add(CleanContentItemDisplay(mapped));
        }

        return result;
    }

    private BlipContentDisplay CleanContentItemDisplay(BlipContentDisplay display)
    {
        // translate the content type name if applicable
        display.ContentTypeName = UmbracoDictionaryTranslate(_localizedTextService, display.ContentTypeName, _cultureDictionary);

        // if your user type doesn't have access to the Settings section it would not get this property mapped
        display.DocumentType?.Name = UmbracoDictionaryTranslate(_localizedTextService, display.DocumentType.Name, _cultureDictionary);

        // remove the listview app if it exists
        display.ContentApps = [.. display.ContentApps.Where(x => x.Alias != "umbListView")];

        return display;
    }

    private string? UmbracoDictionaryTranslate(ILocalizedTextService manager, string? text, ICultureDictionary cultureDictionary)
    {
        if (text is null)
        {
            return null;
        }

        if (!text.StartsWith('#'))
        {
            return text;
        }

        text = text[1..];
        string? value = cultureDictionary[text];

        if (value.IsNullOrWhiteSpace() is false)
        {
            return value;
        }

        string[] splitValues = text.Split('_');
        value = manager.Localize(splitValues[0], splitValues[1]);

        return value.StartsWith('[') ? text : value;
    }
}
