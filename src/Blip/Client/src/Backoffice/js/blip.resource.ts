export class BlipResource {

  public static serviceName = 'blipResource';

  constructor(private blipContentResource, private $interpolate) { }


  /**
   * needs to get the scaffolds for the types based on the existing content/settings keys
   * then iterate the contentData to set the correct type and generate _label
   * @param sourceProperty
   */
  getBlockData = sourceProperty => {
    let scaffoldKeys: Array<string | undefined> = [];

    sourceProperty.config.blocks.forEach((block: UmbBlock) => {
      scaffoldKeys.push(block.contentElementTypeKey);
      scaffoldKeys.push(block.settingsElementTypeKey);
    });

    scaffoldKeys = scaffoldKeys.filter((value, index, self) => self.indexOf(value) === index).filter(x => !!x);

    return this.blipContentResource.getScaffoldByKeys(-20, scaffoldKeys)
      .then(scaffolds => {
        if (!sourceProperty.value.contentData) {
          return;
        }

        sourceProperty.value.contentData.forEach((block: IBlipBlock, idx) => {

          const blockConfig = sourceProperty.config.blocks.find(b => b.contentElementTypeKey === block.contentTypeKey);
          const contentType = scaffolds[block.contentTypeKey];

          const layoutData = sourceProperty.value.layout[sourceProperty.editor].find(l => l.contentUdi === block.udi);
          const settingsData = layoutData && layoutData.settingsUdi ? sourceProperty.value.settingsData.find(d => d.udi === layoutData.settingsUdi) : {};

          if (blockConfig.label) {
            const labelVars = Object.assign({
              '$contentTypeName': contentType.contentTypeName,
              '$settings': settingsData || {},
              '$layout': block.layout || {},
              '$index': idx + 1,
            }, block);

            const interpolator = this.$interpolate(blockConfig.label);
            const label = interpolator(labelVars);
            block._label = label || contentType.contentTypeName;
          }
          else {
            block._label = contentType.contentTypeName;
          }

          block._view = blockConfig.view?.substring(1) || null;
          block._stylesheet = blockConfig.stylesheet?.substring(1) || null;

          // icon
          block._iconRaw = contentType.icon;

          var iconSplit = contentType.icon.split(' ');
          block._icon = iconSplit[0];
          block._iconColor = iconSplit[1] || '';

          // for button labels
          blockConfig.contentTypeName = contentType.contentTypeName;
        });
      });
  }

  /**
   * 
   * @param sourceNode
   * @param sourcePropertyAlias
   */
  getSourceProperty = (sourceNode, sourcePropertyAlias) => {
    let sourceProperty;

    const activeVariant = sourceNode.variants.find(v => v.active) || sourceNode.variants[0];

    for (let tab of activeVariant.tabs) {
      sourceProperty = tab.properties.find(x => x.alias === sourcePropertyAlias);
      if (sourceProperty) break;
    };

    return sourceProperty;
  }
}
