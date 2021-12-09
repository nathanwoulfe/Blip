#if NETCOREAPP
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;
#else 
using Umbraco.Core.PropertyEditors;
#endif

namespace Blip.Web
{
    public class BlipConfigurationEditor : ConfigurationEditor<BlipConfiguration>
    {
#if NETCOREAPP
        public BlipConfigurationEditor(IIOHelper ioHelper) : base(ioHelper)
        {
        }
#endif
    }
}
