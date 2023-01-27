using Blip.Controllers;
using Microsoft.AspNetCore.Routing;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace Blip.Events;

public class ServerVariablesSendingExecutor : IServerVariablesSendingExecutor
{
    private readonly IRuntimeState _runtimeState;
    private readonly LinkGenerator _linkGenerator;

    public ServerVariablesSendingExecutor(IRuntimeState runtimeState, LinkGenerator linkGenerator)
    {
        _runtimeState = runtimeState;
        _linkGenerator = linkGenerator;
    }

    public void Generate(IDictionary<string, object> dictionary)
    {
        if (_runtimeState.Level != RuntimeLevel.Run)
        {
            return;
        }

        Dictionary<string, object> umbracoSettings = dictionary["umbracoSettings"] as Dictionary<string, object> ?? new Dictionary<string, object>();
        string pluginPath = $"{umbracoSettings["appPluginsPath"]}/Blip/Backoffice";

        Dictionary<string, object> blipDictionary = new()
        {
            { "pluginPath", pluginPath },
            { "contentApiBaseUrl", _linkGenerator.GetUmbracoApiServiceBaseUrl<ContentController>(x => x.GetById(null))! },
        };

        dictionary.Add("Blip", blipDictionary);
    }
}
