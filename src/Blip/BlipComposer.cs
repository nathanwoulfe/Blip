using Blip.Events;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;

namespace Blip.Web;

public class BlipComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        _ = builder.Services
            .AddTransient<IServerVariablesSendingExecutor, ServerVariablesSendingExecutor>();

        _ = builder
            .AddNotificationHandler<ServerVariablesParsingNotification, ServerVariablesParsingHandler>();

        _ = builder.ManifestFilters().Append<BlipManifestFilter>();
    }
}
