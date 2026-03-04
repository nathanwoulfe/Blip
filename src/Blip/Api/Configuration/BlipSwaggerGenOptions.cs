using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Blip.Api.Configuration;

internal class BlipSwaggerGenOptions : IConfigureOptions<SwaggerGenOptions>
{
    public void Configure(SwaggerGenOptions options)
    {
        options.SwaggerDoc(
            ApiConstants.ApiName,
            new OpenApiInfo
            {
                Title = ApiConstants.ApiTitle,
                Version = "Latest",
                Description = $"Describes the {ApiConstants.ApiTitle} available for the Blip backoffice extension."
            });

        options.OperationFilter<BackOfficeSecurityRequirementsOperationFilter>();
    }
}
