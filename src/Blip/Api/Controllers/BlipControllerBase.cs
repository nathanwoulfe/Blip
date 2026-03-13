using Blip.Api.Configuration;
using Blip.Models;
using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Builders;
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
    protected IActionResult BlipOperationStatusResult(BlipOperationStatus status) =>
        status switch
        {
            BlipOperationStatus.ContentNotFound => NotFound(new ProblemDetailsBuilder()
                .WithTitle("Content not found")
                .WithDetail("The source content node could not be found.")
                .Build()),
            BlipOperationStatus.PropertyValueNotFound => NotFound(new ProblemDetailsBuilder()
                .WithTitle("Property value not found")
                .WithDetail("The source property does not have a value for the requested culture.")
                .Build()),
            BlipOperationStatus.PropertyNotFound => BadRequest(new ProblemDetailsBuilder()
                .WithTitle("Property not found")
                .WithDetail("The specified property alias does not exist on the source content.")
                .Build()),
            BlipOperationStatus.BlockConfigNotFound => NotFound(new ProblemDetailsBuilder()
                .WithTitle("Block configuration not found")
                .WithDetail("The block configuration for the source property could not be resolved.")
                .Build()),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetailsBuilder()
                .WithTitle("Unknown error")
                .Build()),
        };
}
