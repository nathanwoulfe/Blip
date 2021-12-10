function blipOverlayController($scope, localizationService) {
    var vm = this;

    vm.loading = false;

    vm.selectBlock = selectBlock;
    vm.submit = submit;
    vm.close = close;

    vm.multiPicker = $scope.model.multiPicker;

    /**
     * 
     * */
    function onInit() {

        vm.loading = true;

        // set default title
        if (!$scope.model.title) {
            const labelKey = vm.multiPicker ? 'blip_selectItem' : 'blip_selectItems';
            localizationService.localize(labelKey).then(value => $scope.model.title = value);
        }

        // make sure we can push to something
        if (!$scope.model.selection) {
            $scope.model.selection = [];
        }

        vm.loading = false;
    }

    /**
     * 
     * @param {any} block
     */
    function selectBlock(block) {

        if (!block._selected) {
            block._selected = true;
            $scope.model.selection.push(block);
        } else {

            if (block._selected) {
                $scope.model.selection.forEach((selectedBlock, idx) => {
                    if (selectedBlock.id === block.id) {
                        block._selected = false;
                        $scope.model.selection.splice(idx, 1);
                    }
                });
            } else {
                if (!vm.multiPicker) {
                    $scope.model.blocks.forEach(b => b._selected = false);
                }
                block._selected = true;
                $scope.model.selection.push(block);
            }
        }

        if (!vm.multiPicker) {
            submit($scope.model);
        }
    }


    /**
     * 
     * @param {any} model
     */
    function submit(model) {
        $scope.model.submit ? $scope.model.submit(model) : {};
    }


    /**
     * 
     * */
    function close() {
        $scope.model.close ? $scope.model.close() : {};
    }

    onInit();
}

angular.module('umbraco').controller('Blip.Overlay.Controller', ['$scope', 'localizationService', blipOverlayController]);