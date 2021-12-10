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
    vm.createBlock = createBlock;

    // sortable options
    vm.sortableOptions = {
        axis: 'y',
        containment: 'parent',
        distance: 10,
        opacity: 0.7,
        tolerance: 'pointer',
        scroll: true,
        zIndex: 6000,
        update: () => {
            setDirty();
        },
    };

    let sourceNode;
    let onFormSubmitting;
    let onRenderModelChange;


    /**
     * 
     * */
    function setDirty() {
        if ($scope.blipForm && $scope.blipForm.modelValue) {
            $scope.blipForm.modelValue.$setDirty();
        }
    }


    /**
     * Get the correct blocks, and sort to match the saved order
     * */
    function syncRenderModel() {
        const value = $scope.model.value;

        vm.renderModel = vm.blocks.filter(b => value.includes(b.udi));
        vm.renderModel.sort((a, b) => value.indexOf(a.udi) - value.indexOf(b.udi));
    }


    /**
     * After closing the infinite editor, check that the render model blocks are still valid
     * Block can be modified or removed
     * */
    function refreshRenderModel() {
        const keysToRemove = [];
        vm.blocks.forEach(block => {
            const renderModelBlock = vm.renderModel.find(b => b.udi === block.udi);
            if (!renderModelBlock) {
                keysToRemove.push(block.udi);
            } else {
                Object.assign(renderModelBlock, block);
            }
        });

        vm.renderModel = vm.renderModel.filter(b => !keysToRemove.includes(b.udi));
    }


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

        const hasItemsOrMandatory = vm.renderModel.length !== 0 || ($scope.model.validation && $scope.model.validation.mandatory);

        const validMinCount = hasItemsOrMandatory && vm.minNumberOfItems <= vm.renderModel.length;
        $scope.blipForm.minCount.$setValidity('minCount', validMinCount);

        const validMaxCount = vm.maxNumberOfItems >= vm.renderModel.length;
        $scope.blipForm.maxCount.$setValidity('maxCount', validMaxCount);
    }


    /**
     * 
     * */
    function addBlock() {
        const editorModel = {
            view: Umbraco.Sys.ServerVariables.umbracoSettings.appPluginsPath + '/Blip/Backoffice/blip.overlay.html',
            multiPicker: vm.multiPicker,
            selection: vm.blocks.filter(b => b._selected),
            blocks: vm.blocks,
            submit: model => {
                vm.renderModel = model.selection;
                editorService.close();
            },
            close: () => editorService.close()
        };

        editorService.open(editorModel);
    }


    /**
     * After closing, we re-fetch the node as it may have additional data
     * */
    function createBlock() {
        var editor = {
            id: sourceNode.id,
            submit: () => {
                editorService.close();
                init(true);
            },
            close: () => {
                editorService.close();
                init(true);
            }
        };

        editorService.contentEditor(editor);
    }


    /**
     * 
     * @param {any} udi
     */
    function removeBlock(udi) {
        vm.blocks.find(b => b.udi === udi)._selected = false;
        vm.renderModel = vm.blocks.filter(b => b._selected);
    }

    /**
     * 
     */
    function preSelect() {
        vm.blocks.forEach(b => b._selected = $scope.model.value.includes(b.udi));
    }


    /**
     * 
     * */
    function init(isRefresh) {
        vm.loading = true;

        contentResource.getById(vm.config.sourceNode)
            .then(result => {
                sourceNode = result;
                const sourceProperty = blipResource.getSourceProperty(sourceNode, vm.config.sourceProperty);

                blipResource.getBlockData(sourceProperty)
                    .then(_ => {

                        vm.blocks = sourceProperty.value.contentData;
                        vm.types = sourceProperty.config.blocks;

                        preSelect();

                        if (isRefresh) {
                            refreshRenderModel();
                        } else {
                            syncRenderModel();
                            subscribe();
                        }
                        validate();

                        vm.loading = false;
                    });
            });
    }

    init();
}

angular.module('umbraco').controller('Blip.Editor.Controller', ['$scope', 'editorService', 'contentResource', 'Blip.Resource', blipEditorController]);


function featureBlockController($scope) {

}

angular.module('umbraco').controller('featureBlockController', ['$scope', featureBlockController]);