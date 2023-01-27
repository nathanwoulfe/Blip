using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;

namespace Blip.Events;

public class ServerVariablesParsingHandler : INotificationHandler<ServerVariablesParsingNotification>
{
    private readonly IServerVariablesSendingExecutor _serverVariablesGenerator;

    public ServerVariablesParsingHandler(IServerVariablesSendingExecutor serverVariablesGenerator)
    {
        _serverVariablesGenerator = serverVariablesGenerator;
    }

    public void Handle(ServerVariablesParsingNotification notification) =>
        _serverVariablesGenerator.Generate(notification.ServerVariables);
}
