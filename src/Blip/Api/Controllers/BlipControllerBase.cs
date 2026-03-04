using Blip.Api.Configuration;
using Blip.Models;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Routing;

namespace Blip.Api.Controllers;

[ApiController]
[ApiExplorerSettings(GroupName = ApiConstants.ApiGroupName)]
[BackOfficeRoute($"{ApiConstants.RootPath}/v{{version:apiVersion}}")]
[MapToApi(ApiConstants.ApiName)]
public abstract class BlipControllerBase(
    IContentService contentService,
    IBackOfficeSecurityAccessor backOfficeSecurityAccessor)
    : ControllerBase
{
    protected IContentService ContentService { get; } = contentService;
    protected IBackOfficeSecurityAccessor BackOfficeSecurityAccessor { get; } = backOfficeSecurityAccessor;

    /// <summary>
    /// Maps an <see cref="IContent"/> instance to a <see cref="BlipContentDisplay"/>.
    /// </summary>
    protected BlipContentDisplay MapToDisplay(IContent content)
    {
        List<BlipVariantDisplay> variants = [];

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

        return new BlipContentDisplay
        {
            Id = content.Id,
            ContentTypeKey = content.ContentType.Key,
            ContentTypeName = content.ContentType.Name,
            AllowPreview = !content.Trashed && !content.ContentType.IsElement,
            Variants = variants,
            DocumentType = new() { Name = content.ContentType.Name },
            ContentApps = [],
        };
    }
}
