using Blip.Web.Events;
#if NETCOREAPP
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
#else
using Umbraco.Core;
using Umbraco.Core.Composing;
#endif

namespace Blip.Web
{
#if NETFRAMEWORK
    [RuntimeLevel(MinLevel = RuntimeLevel.Run)]
    public class BlipWebComposer : IUserComposer
    {
        public void Compose(Composition composition)
        {
            composition.Register<ILinkGenerator, LinkGenerator>();
            composition.Register<IBackOfficeSecurityAccessor, BackOfficeSecurityAccessor>();
            composition.Register<IServerVariablesSendingExecutor, ServerVariablesSendingExecutor>();
            composition.Components()
                .Append<WebComponent>();
        }
    }
#endif

#if NETCOREAPP
    public class BlipWebComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services
                .AddSingleton<ILinkGenerator, LinkGenerator>()
                .AddSingleton<IServerVariablesSendingExecutor, ServerVariablesSendingExecutor>();

            builder
                .AddNotificationHandler<ServerVariablesParsingNotification, ServerVariablesParsingHandler>();
        }
    }
#endif
}

