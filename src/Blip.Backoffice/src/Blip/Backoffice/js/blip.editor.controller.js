function blipEditorController($scope, editorService, contentResource, blipResource) {

    $scope.model.value = $scope.model.value || [];

    let vm = this;
    vm.renderModel = [];

    vm.config = Object.assign({
        minNumber: 1,
        maxNumber: 1,
    }, $scope.model.config);

    // for validation
    vm.minNumberOfItems = vm.config.minNumber ? parseInt(vm.config.minNumber) : 0;
    vm.maxNumberOfItems = vm.config.maxNumber ? parseInt(vm.config.maxNumber) : 0;
    vm.multiPicker = vm.maxNumberOfItems !== 1;

    // external API
    vm.removeBlock = removeBlock;
    vm.addBlock = addBlock;

    let onFormSubmitting;
    let onRenderModelChange;

    /**
     * 
     * */
    function subscribe() {
        onFormSubmitting = $scope.$on('formSubmitting', () => {
            $scope.model.value = vm.renderModel.map(r => r.udi);
        });

        onRenderModelChange = $scope.$watch('vm.renderModel', (newVal, oldVal) => {
            if (newVal !== oldVal) {
                validate();
            }
        });
    }


    $scope.$on('$destroy', () => {
        onFormSubmitting ? onFormSubmitting() : {};
        onRenderModelChange ? onRenderModelChange() : {};
    });


    /**
     * 
     * */
    function validate() {
        if (!$scope.blipForm) return;

        var hasItemsOrMandatory = $scope.renderModel.length !== 0 || ($scope.model.validation && $scope.model.validation.mandatory);

        const validMinCount = hasItemsOrMandatory && $scope.minNumberOfItems > $scope.renderModel.length;
        $scope.blipForm.minCount.$setValidity("minCount", validMinCount);

        const validMaxCount = $scope.blipForm < $scope.renderModel.length);
        $scope.contentPickerForm.maxCount.$setValidity("maxCount", validMaxCount);
    }



    /**
     * 
     * */
    function addBlock() {
        const editorModel = {
            view: Umbraco.Sys.ServerVariables.umbracoSettings.appPluginsPath + '/Blip/Backoffice/blip.overlay.html',
            config: vm.config,
            selection: vm.blocks.filter(b => b._selected),
            blocks: vm.blocks,
            submit: model => {
                vm.renderModel = model.value;
                editorService.close();
            },
            close: () => editorService.close()
        };

        editorService.open(editorModel);
    }

    function removeBlock(idx) {
        vm.blocks[idx]._selected = false;
        vm.renderModel.splice(1, idx);
    }

    /**
     * 
     */
    function preSelect() {
        $scope.model.value.forEach(s => {
            vm.blocks.forEach(b => b._selected = s === b.udi)
        });
    }

    vm.loading = true;

    contentResource.getById($scope.model.config.sourceNode)
        .then(sourceNode => {
            const sourceProperty = blipResource.getSourceProperty(sourceNode);

            vm.blocks = sourceProperty.value.contentData;

            preSelect();
            subscribe();
            validate();

            vm.loading = false;
        });
}

angular.module('umbraco').controller('Blip.Editor.Controller', ['$scope', 'editorService', 'contentResource', 'blipResource', blipEditorController]);