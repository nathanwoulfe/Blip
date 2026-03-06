using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;

namespace Blip.Editor;

[DataEditor(
    "NW.Blip",
    ValueType = ValueTypes.Json,
    ValueEditorIsReusable = true)]
public class BlipPropertyEditor : DataEditor
{
    private readonly IIOHelper _ioHelper;

    public BlipPropertyEditor(IDataValueEditorFactory dataValueEditorFactory, IIOHelper ioHelper)
        : base(dataValueEditorFactory)
    {
        _ioHelper = ioHelper;
        SupportsReadOnly = true;
    }

    protected override IConfigurationEditor CreateConfigurationEditor()
        => new BlipConfigurationEditor(_ioHelper);
}
