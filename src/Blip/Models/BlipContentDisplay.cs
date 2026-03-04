namespace Blip.Models;

public class BlipContentDisplay
{
    public int Id { get; set; }

    public Guid ContentTypeKey { get; set; }

    public string? ContentTypeName { get; set; }

    public bool AllowPreview { get; set; }

    public IEnumerable<BlipVariantDisplay> Variants { get; set; } = [];

    public IEnumerable<string>? AllowedActions { get; set; }

    public BlipDocumentTypeDisplay? DocumentType { get; set; }

    public IList<BlipContentAppDisplay> ContentApps { get; set; } = [];
}

public class BlipVariantDisplay
{
    public string? Culture { get; set; }

    public string? Name { get; set; }
}

public class BlipDocumentTypeDisplay
{
    public string? Name { get; set; }
}

public class BlipContentAppDisplay
{
    public string? Alias { get; set; }
}
