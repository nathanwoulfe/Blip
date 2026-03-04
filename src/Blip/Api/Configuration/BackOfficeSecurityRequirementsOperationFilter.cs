using Umbraco.Cms.Api.Management.OpenApi;

namespace Blip.Api.Configuration;

public class BackOfficeSecurityRequirementsOperationFilter : BackOfficeSecurityRequirementsOperationFilterBase
{
    protected override string ApiName => ApiConstants.ApiName;
}
