#if NETCOREAPP
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;
#else
using Umbraco.Core.Logging;
using Umbraco.Core.PropertyEditors;
#endif
namespace Blip.Web
{
    [DataEditor(
            alias: "NW.Blip",
            name: "Block List Item Picker",
            view: "~/App_Plugins/Blip/Backoffice/blip.editor.html",
            Group = "Pickers",
            Icon = "icon-code")]
    public class BlipEditor : DataEditor
    {
#if NETCOREAPP
        private readonly IIOHelper _ioHelper;

        public BlipEditor(IDataValueEditorFactory factory, IIOHelper ioHelper) : base(factory)
        { 
            _ioHelper = ioHelper;
        }

        protected override IConfigurationEditor CreateConfigurationEditor() => new BlipConfigurationEditor(_ioHelper);
#else
        public BlipEditor(ILogger logger) : base(logger)
        { }

        protected override IConfigurationEditor CreateConfigurationEditor() => new BlipConfigurationEditor();
#endif
    }
}
