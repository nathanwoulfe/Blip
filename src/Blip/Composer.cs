using Blip.Api.Configuration;
using Blip.Services;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace Blip;

internal class Composer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.ConfigureOptions<BlipSwaggerGenOptions>();
        builder.Services.AddSingleton<IOperationIdHandler, Api.Configuration.OperationIdHandler>();
        builder.Services.AddSingleton<IBlipService, BlipService>();
    }
}
