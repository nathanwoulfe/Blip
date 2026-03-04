using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;

namespace Blip.Editor;

public class BlipConfigurationEditor(IIOHelper ioHelper) : ConfigurationEditor<BlipConfiguration>(ioHelper)
{
}
