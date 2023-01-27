using System.Runtime.Serialization;
using Umbraco.Cms.Core.Models.ContentEditing;

namespace Blip.Models;

[DataContract(Name = "content", Namespace = "")]
public class ContentSlim
{
    [DataMember(Name = "variants")]
    public IEnumerable<ContentVariantDisplay> Variants { get; set; } = Enumerable.Empty<ContentVariantDisplay>();

    [DataMember(Name = "id")]
    public int Id { get; set; }

    [DataMember(Name = "allowedActions")]
    public IEnumerable<string>? AllowedActions { get; set; }
}
