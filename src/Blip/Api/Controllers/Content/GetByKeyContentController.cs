using Blip.Models;
using Blip.Services;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Security;

namespace Blip.Api.Controllers.Content;

[ApiVersion(1.0)]
public class GetByKeyContentController(IBlipService blipService, IBackOfficeSecurityAccessor backOfficeSecurityAccessor)
    : BlipControllerBase
{

    [HttpGet]
    [ProducesResponseType(typeof(ContentSlim), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetById(Guid key, string propertyAlias, string? culture = null)
    {
        if (backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser is null)
        {
            return BadRequest();
        }

        Attempt<ContentSlim?, BlipOperationStatus> attempt = await blipService.GetContentByKey(key, propertyAlias, culture);

        return attempt.Success
            ? Ok(attempt.Result)
            : BlipOperationStatusResult(attempt.Status);
    }
}
