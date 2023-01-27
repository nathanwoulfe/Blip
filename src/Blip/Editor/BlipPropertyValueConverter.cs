using Newtonsoft.Json;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Extensions;

namespace Blip.Editor;

public class BlipPropertyValueConverter : IPropertyValueConverter
{
    private readonly IPublishedSnapshotAccessor _publishedSnapshotAccessor;

    public BlipPropertyValueConverter(IPublishedSnapshotAccessor publishedSnapshotAccessor)
    {
        _publishedSnapshotAccessor = publishedSnapshotAccessor;
    }

    public object? ConvertIntermediateToObject(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object? inter, bool preview)
    {
        string sourceString = inter?.ToString() ?? string.Empty;
        if (string.IsNullOrEmpty(sourceString))
        {
            return null;
        }

        // inter is an array of element udis from the source node
        // we need the typed node, to get the source block list and keep only the required items
        BlipConfiguration? configuration = propertyType.DataType.ConfigurationAs<BlipConfiguration>();

        if (configuration?.SourceNode is null || configuration.SourceProperty is null)
        {
            return null;
        }

        _ = _publishedSnapshotAccessor.TryGetPublishedSnapshot(out IPublishedSnapshot? publishedSnapshot);
        IPublishedContent? sourceNode = publishedSnapshot?.Content?.GetById(configuration.SourceNode);
        BlockListModel? sourceProperty = sourceNode?.Value<BlockListModel>(configuration.SourceProperty);

        List<string?>? blockUdis = JsonConvert.DeserializeObject<List<string?>>(sourceString);

        if (blockUdis is null || sourceProperty is null)
        {
            return null;
        }

        List<BlockListItem> blocks = new();

        foreach (string? udi in blockUdis)
        {
            BlockListItem? block = sourceProperty.FirstOrDefault(x => x.ContentUdi.ToString() == udi);

            if (block is null)
            {
                continue;
            }

            blocks.Add(block);
        }

        return new BlockListModel(blocks.ToList());
    }

    public object? ConvertIntermediateToXPath(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object? inter, bool preview)
        => inter?.ToString() ?? null;

    public object? ConvertSourceToIntermediate(IPublishedElement owner, IPublishedPropertyType propertyType, object? source, bool preview) => source;

    public PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType) => PropertyCacheLevel.Elements;

    public Type GetPropertyValueType(IPublishedPropertyType propertyType) => typeof(BlockListModel);

    public bool IsConverter(IPublishedPropertyType propertyType) => propertyType.EditorAlias.ToLower().Equals("nw.blip");

    public bool? IsValue(object? value, PropertyValueLevel level)
        => level switch
        {
            PropertyValueLevel.Source => value is not null && (value is not string valueString || string.IsNullOrWhiteSpace(valueString) == false),
            PropertyValueLevel.Inter => null,
            PropertyValueLevel.Object => null,
            _ => throw new NotSupportedException($"Invalid level: {level}."),
        };
}
