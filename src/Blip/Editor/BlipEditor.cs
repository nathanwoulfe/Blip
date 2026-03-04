using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;

namespace Blip.Editor;

[DataEditor("NW.Blip", ValueType = ValueTypes.Json)]
public class BlipEditor(
    IDataValueEditorFactory factory,
    IIOHelper ioHelper)
    : DataEditor(factory)
{
    private readonly IIOHelper _ioHelper = ioHelper;

    protected override IConfigurationEditor CreateConfigurationEditor()
        => new BlipConfigurationEditor(_ioHelper);
}
