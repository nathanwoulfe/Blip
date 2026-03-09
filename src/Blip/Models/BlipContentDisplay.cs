namespace Blip.Models;

public class BlipContentDisplay
{
    public IEnumerable<BlipVariantDisplay> Variants { get; set; } = [];

    public IEnumerable<string>? AllowedActions { get; set; }
}

public class BlipVariantDisplay
{
    public string? Culture { get; set; }

    public string? Name { get; set; }
}
