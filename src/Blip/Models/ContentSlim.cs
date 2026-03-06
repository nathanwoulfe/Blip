namespace Blip.Models;

public class ContentSlim
{
    public IEnumerable<BlipVariantDisplay> Variants { get; set; } = [];

    public int Id { get; set; }

    public IEnumerable<string>? AllowedActions { get; set; }

    public Guid DataTypeKey { get; set; }
}
