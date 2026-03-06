using Newtonsoft.Json;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.DeliveryApi;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Extensions;

namespace Blip.Editor;

public class BlipPropertyValueConverter(
    IPublishedContentCache publishedContentCache,
    IApiElementBuilder apiElementBuilder)
    : IPropertyValueConverter, IDeliveryApiPropertyValueConverter
{
    private readonly IPublishedContentCache _publishedContentCache = publishedContentCache;
    private readonly IApiElementBuilder _apiElementBuilder = apiElementBuilder;

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

        if (!Guid.TryParse(configuration.SourceNode, out Guid sourceGuid))
        {
            // Try parsing as UDI (e.g. "umb://document/guid")
            if (UdiParser.TryParse(configuration.SourceNode, out Udi? udi) && udi is GuidUdi guidUdi)
            {
                sourceGuid = guidUdi.Guid;
            }
            else
            {
                return null;
            }
        }

        IPublishedContent? sourceNode = _publishedContentCache.GetById(sourceGuid);
        BlockListModel? sourceProperty = sourceNode?.Value<BlockListModel>(configuration.SourceProperty);

        List<string?>? blockUdis = JsonConvert.DeserializeObject<List<string?>>(sourceString);

        if (blockUdis is null || sourceProperty is null)
        {
            return null;
        }

        List<BlockListItem> blocks = [];

        foreach (string? udi in blockUdis)
        {
            if (string.IsNullOrEmpty(udi))
            {
                continue;
            }

            // match stored UDI strings against block content keys
            BlockListItem? block = sourceProperty.FirstOrDefault(x =>
                Udi.Create(Constants.UdiEntityType.Element, x.Content.Key).ToString() == udi);

            if (block is null)
            {
                continue;
            }

            blocks.Add(block);
        }

        return new BlockListModel(blocks.ToList());
    }

    /// <inheritdoc />
    public object? ConvertIntermediateToXPath(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object? inter, bool preview)
        => inter?.ToString() ?? null;

    /// <inheritdoc />
    public object? ConvertSourceToIntermediate(IPublishedElement owner, IPublishedPropertyType propertyType, object? source, bool preview) => source;

    /// <inheritdoc/>
    public PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType) => PropertyCacheLevel.Elements;

    /// <inheritdoc />
    public Type GetPropertyValueType(IPublishedPropertyType propertyType) => typeof(BlockListModel);

    /// <inheritdoc />
    public bool IsConverter(IPublishedPropertyType propertyType) => propertyType.EditorAlias.Equals("nw.blip", StringComparison.OrdinalIgnoreCase);

    /// <inheritdoc />
    public bool? IsValue(object? value, PropertyValueLevel level)
        => level switch
        {
            PropertyValueLevel.Source => value is not null && (value is not string valueString || string.IsNullOrWhiteSpace(valueString) == false),
            PropertyValueLevel.Inter => null,
            PropertyValueLevel.Object => null,
            _ => throw new NotSupportedException($"Invalid level: {level}."),
        };

    /// <inheritdoc />
    public PropertyCacheLevel GetDeliveryApiPropertyCacheLevel(IPublishedPropertyType propertyType) => PropertyCacheLevel.Elements;

    /// <inheritdoc />
    public Type GetDeliveryApiPropertyValueType(IPublishedPropertyType propertyType) => typeof(BlockListModel);

    /// <inheritdoc />
    public object? ConvertIntermediateToDeliveryApiObject(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object? inter, bool preview, bool expanding)
    {
        object? blocks = ConvertIntermediateToObject(owner, propertyType, referenceCacheLevel, inter, preview);

        if (blocks is not BlockListModel blockList)
        {
            return null;
        }

        var enabledBlocks = blockList.Where(i => i.Settings?.IsVisible() ?? i.Content.IsVisible()).ToList();
        if (enabledBlocks.Count == 0)
        {
            return null;
        }

        return new ApiBlockListModel(
            enabledBlocks != null
                ? enabledBlocks.Select(CreateApiBlockItem).ToArray()
                : Array.Empty<ApiBlockItem>());
    }

    private ApiBlockItem CreateApiBlockItem(BlockListItem item) => new(
            _apiElementBuilder.Build(item.Content),
            item.Settings != null ? _apiElementBuilder.Build(item.Settings) : null);
}
