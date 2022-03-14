#if NETCOREAPP
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.PropertyEditors;
#else
using Umbraco.Core;
using Umbraco.Core.PropertyEditors;
#endif

namespace Blip.Web
{
    public class BlipConfiguration
    {
        [ConfigurationField("sourceNode", "Source node", "treepicker", Description = "The node containing the Block List editor")]
        public Udi SourceNode { get; set; }

        [ConfigurationField("sourceProperty", "Source property", "~/App_Plugins/Blip/Backoffice/blip.sourceproperty.prevalue.html", Description = "The property containing the Block List data")]
        public string SourceProperty { get; set; }

        [ConfigurationField("minNumber", "Minimum number of items", "number")]
        public int MinNumber { get; set; }

        [ConfigurationField("maxNumber", "Maximum number of items", "number")]
        public int MaxNumber { get; set; }
    }
}
