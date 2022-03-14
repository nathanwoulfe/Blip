using System.Collections.Generic;
#if NETCOREAPP
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core;
#else
using Umbraco.Core;
using Umbraco.Core.Services;
#endif

namespace Blip.Web.Events
{
    public interface IServerVariablesSendingExecutor
    {
        void Generate(IDictionary<string, object> dictionary);
    }

    public class ServerVariablesSendingExecutor : IServerVariablesSendingExecutor
    {
        private readonly ILocalizationService _localizationService;
        private readonly IRuntimeState _runtimeState;
        private readonly ILinkGenerator _linkGenerator;

        public ServerVariablesSendingExecutor(ILocalizationService localizationService, IRuntimeState runtimeState, ILinkGenerator linkGenerator)
        {
            _localizationService = localizationService;
            _runtimeState = runtimeState;
            _linkGenerator = linkGenerator;
        }

        public void Generate(IDictionary<string, object> dictionary)
        {
            if (_runtimeState.Level != RuntimeLevel.Run)
                return;

            Dictionary<string, object> umbracoSettings = dictionary["umbracoSettings"] as Dictionary<string, object> ?? new Dictionary<string, object>();
            string pluginPath = $"{umbracoSettings["appPluginsPath"]}/Blip/Backoffice";

            var defaultCultureIsoCode = _localizationService.GetDefaultLanguageIsoCode();
            var defaultCulture = _localizationService.GetLanguageByIsoCode(defaultCultureIsoCode);

            var blipDictionary = new Dictionary<string, object>
            {
                { "pluginPath", pluginPath },
                { "contentApiBaseUrl", _linkGenerator.GetUmbracoApiServiceBaseUrl<ContentController>(x => x.GetEmptyByKeys(null))},                
            };

            dictionary.Add("Blip", blipDictionary);
        }
    }
}
