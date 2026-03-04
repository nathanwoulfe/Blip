using Umbraco.Cms.Core;
using Umbraco.Cms.Core.PropertyEditors;

namespace Blip.Editor;

public class BlipConfiguration
{
    [ConfigurationField("sourceNode")]
    public Udi? SourceNode { get; set; }

    [ConfigurationField("sourceProperty")]
    public string? SourceProperty { get; set; }

    [ConfigurationField("minNumber")]
    public int MinNumber { get; set; }

    [ConfigurationField("maxNumber")]
    public int MaxNumber { get; set; }
}
