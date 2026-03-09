namespace Blip.Models;

public class ContentSlim
{
    public IEnumerable<BlipVariantDisplay> Variants { get; set; } = [];

    public object? SourceValue { get; set; }

    public object? BlockConfiguration { get; set; }

    public bool CanEdit { get; set; }
}
