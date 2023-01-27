using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;

namespace Blip.Editor;

[DataEditor(
        alias: "NW.Blip",
        name: "Block List Item Picker",
        view: "/App_Plugins/Blip/Backoffice/views/blip.editor.html",
        type: EditorType.PropertyValue,
        ValueType = ValueTypes.Json,
        Group = "Pickers",
        Icon = "icon-code")]
public class BlipEditor : DataEditor
{
    private readonly IIOHelper _ioHelper;
    private readonly IEditorConfigurationParser _editorConfigurationParser;

    public BlipEditor(
        IDataValueEditorFactory factory,
        IIOHelper ioHelper,
        IEditorConfigurationParser editorConfigurationParser,
        EditorType type = EditorType.PropertyValue)
        : base(factory, type)
    {
        _ioHelper = ioHelper;
        _editorConfigurationParser = editorConfigurationParser;
    }

    protected override IConfigurationEditor CreateConfigurationEditor()
        => new BlipConfigurationEditor(_ioHelper, _editorConfigurationParser);
}
