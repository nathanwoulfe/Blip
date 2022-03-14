using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
#if NETCOREAPP
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Extensions;
#else
using Umbraco.Web;
using Umbraco.Core.PropertyEditors;
using Umbraco.Web.PublishedCache;
using Umbraco.Core.Models.Blocks;
using Umbraco.Core.Models.PublishedContent;
#endif

namespace Blip.Web
{
    public  class BlipPropertyValueConverter : IPropertyValueConverter
    {
        private readonly IPublishedSnapshotAccessor _publishedSnapshotAccessor;

        public BlipPropertyValueConverter(IPublishedSnapshotAccessor publishedSnapshotAccessor)
        {
            _publishedSnapshotAccessor = publishedSnapshotAccessor;
        }

        public object ConvertIntermediateToObject(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object inter, bool preview)
        {
            if (inter == null) return null;

            // inter is an array of element udis from the source node
            // we need the typed node, to get the source block list and keep only the required items
            var configuration = propertyType.DataType.ConfigurationAs<BlipConfiguration>();

            if (configuration.SourceNode == null || configuration.SourceProperty == null) return null;

#if NETCOREAPP
            _publishedSnapshotAccessor.TryGetPublishedSnapshot(out IPublishedSnapshot publishedSnapshot);
            var sourceNode = publishedSnapshot.Content.GetById(configuration.SourceNode);
#else
            var sourceNode = _publishedSnapshotAccessor.PublishedSnapshot.Content.GetById(configuration.SourceNode);
#endif
            var sourceProperty = sourceNode.Value<BlockListModel>(configuration.SourceProperty);

            var blockUdis = JsonConvert.DeserializeObject<List<string>>(inter.ToString());

            var blocks = new List<BlockListItem>();
            foreach (var udi in blockUdis)
            {
                blocks.Add(sourceProperty.FirstOrDefault(x => x.ContentUdi.ToString() == udi));
            }

            return new BlockListModel(blocks.ToList());
        }

        public object ConvertIntermediateToXPath(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object inter, bool preview)
        {
            if (inter == null) return null;
            return inter.ToString();
        }

        public object ConvertSourceToIntermediate(IPublishedElement owner, IPublishedPropertyType propertyType, object source, bool preview) => source;

        public PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType) => PropertyCacheLevel.Elements;

        public Type GetPropertyValueType(IPublishedPropertyType propertyType) => typeof(BlockListModel);

        public bool IsConverter(IPublishedPropertyType propertyType) => propertyType.EditorAlias.ToLower().Equals("nw.blip");

        public bool? IsValue(object value, PropertyValueLevel level)
        {
            switch (level)
            {
                case PropertyValueLevel.Source:
                    return value != null && (!(value is string valueString) || string.IsNullOrWhiteSpace(valueString) == false);
                case PropertyValueLevel.Inter:
                    return null;
                case PropertyValueLevel.Object:
                    return null;
                default:
                    throw new NotSupportedException($"Invalid level: {level}.");
            }
        }
    }
}
