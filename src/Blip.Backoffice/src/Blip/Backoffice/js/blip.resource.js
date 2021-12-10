function blipResource(contentResource, $interpolate) {
    return {
        // needs to get the scaffolds for the types based on the existing content/settings keys
        // then iterate the contentData to set the correct type and generate _label
        getBlockData: sourceProperty => {
            let scaffoldKeys = [];

            sourceProperty.config.blocks.forEach(block => {
                scaffoldKeys.push(block.contentElementTypeKey);
                scaffoldKeys.push(block.settingsElementTypeKey);                
            });

            scaffoldKeys = scaffoldKeys.filter((value, index, self) => self.indexOf(value) === index);

            return contentResource.getScaffoldByKeys(-20, scaffoldKeys)
                .then(scaffolds => {
                    sourceProperty.value.contentData.forEach((block, idx) => {

                        const blockConfig = sourceProperty.config.blocks.find(b => b.contentElementTypeKey === block.contentTypeKey);
                        const interpolator = $interpolate(blockConfig.label);
                        const contentType = scaffolds[block.contentTypeKey];

                        const labelVars = Object.assign({
                            '$contentTypeName': contentType.contentTypeName,
                            '$settings': scaffolds[block.settingsTypeKey] || {},
                            '$layout': block.layout || {},
                            '$index': idx + 1,
                        }, block);

                        const label = interpolator(labelVars);
                        block._label = label || contentType.contentTypeName;

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
        },
        getSourceProperty: (sourceNode, sourcePropertyAlias) => {
            let sourceProperty;

            for (let tab of sourceNode.variants[0].tabs) {
                sourceProperty = tab.properties.find(x => x.alias === sourcePropertyAlias);
                if (sourceProperty) break;
            };

            return sourceProperty;
        }
    }
}

angular.module('umbraco').service('Blip.Resource', ['contentResource', '$interpolate', blipResource]);