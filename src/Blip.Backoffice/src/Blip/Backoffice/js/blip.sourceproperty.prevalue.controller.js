function blipSourcePropertyPrevalueController($scope, contentResource) {

    let vm = this;
    vm.setSourceProperty = () => $scope.model.value = vm.sourceProperty;
    vm.sourceProperty = $scope.model.value;  


    /**
     * 
     * */
    const getEditorScope = () => {
        let editorScope = $scope.$parent;
        do {
            editorScope = editorScope.$parent;
        } while (!Object.prototype.hasOwnProperty.call(editorScope, 'contentForm'));

        return editorScope;
    }


    /**
     * 
     * @param {any} content
     */
    const getBlockListProperties = content => {
        let props = [];
        content.variants[0].tabs.forEach(tab => {
            tab.properties.forEach(prop => {
                if (prop.view === 'blocklist') {
                    props.push({ key: prop.label, value: prop.alias });
                }
            });
        });

        return props;
    }


    /**
     * 
     * @param {any} udi
     */
    const getSourceNode = udi => {
        contentResource.getById(udi)
            .then(content => {
                vm.sourceProperties = getBlockListProperties(content);
            });
    }

    const editorScope = getEditorScope();
    let editorScopeWatch;

    if (editorScope) {
        editorScopeWatch = $scope.$watch(() => editorScope.vm.preValues, newVal => {
            const sourceNode = newVal.find(x => x.alias === 'sourceNode');
            if (!sourceNode.value) return;

            getSourceNode(sourceNode.value);
        }, true);
    }

    // clean up

    $scope.$on('$destroy', () => {
        editorScopeWatch ? editorScopeWatch() : {};
    })
}

angular.module('umbraco').controller('Blip.SourceProperty.Prevalue.Controller', ['$scope', 'contentResource', blipSourcePropertyPrevalueController]);