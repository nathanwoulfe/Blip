using Blip.Api.Configuration;
using Blip.Models;
using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Routing;

namespace Blip.Api.Controllers;

[ApiController]
[ApiExplorerSettings(GroupName = ApiConstants.ApiGroupName)]
[BackOfficeRoute($"{ApiConstants.RootPath}/v{{version:apiVersion}}")]
[MapToApi(ApiConstants.ApiName)]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
public abstract class BlipControllerBase : ControllerBase
{

    /// <summary>
    /// Maps an <see cref="IContent"/> instance to a <see cref="BlipContentDisplay"/>.
    /// </summary>
    protected IEnumerable<BlipVariantDisplay> MapVariantsToDisplay(IContent? content)
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
