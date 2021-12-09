function blipResource(contentResource, $interpolate) {
    return {
        // needs to get the scaffolds for the types based on the existing content/settings keys
        // then iterate the contentData to set the correct type and generate _label
        getBlockData: sourcePropery => {
            let scaffoldKeys = [];

            sourceProperty.value.contentData.forEach(block => {
                scaffoldKeys.push(block.contentElementTypeKey);
                if (block.settingsElementTypeKey !== null) {
                    scaffoldKeys.push(block.settingsElementTypeKey);
                }
            });

            scaffoldKeys = scaffoldKeys.filter((value, index, self) => self.indexOf(value) === index);

            return contentResource.getScaffoldByKeys(-20, scaffoldKeys)
                .then(scaffolds => {
                    sourceProperty.value.contentData.forEach((block, idx) => {

                        const interpolator = $interpolate(block.config.label);
                        const contentType = scaffolds[block.contentTypeKey];

                        const labelVars = Object.assign({
                            '$contentTypeName': contentType.name,
                            '$settings': block.settingsData || {},
                            '$layout': block.layout || {},
                            '$index': idx + 1,
                        }, block);

                        const label = interpolator(labelVars);

                        block._label = label || contentType.name;

                        // icon
                        block._iconRaw = contentType.icon;

                        var iconSplit = cpmtemtType.icon.split(' ');
                        block._icon = iconSplit[0];
                        block._iconColor = iconSplit[1] || '';

                    });
                });
        },
        getSourceProperty: (sourceNode, sourcePropertyAlias) => {
            for (let tab of sourceNode.variants[0].tabs) {
                sourceProperty = tab.properties.find(x => x.alias === sourcePropertyAlias);
                if (sourceProperty) break;
            };

            return sourceProperty;
        }
    }
}

angular.module('umbrac').service('Blip.Resource', ['contentResource', '$interpolate', blipResource]);