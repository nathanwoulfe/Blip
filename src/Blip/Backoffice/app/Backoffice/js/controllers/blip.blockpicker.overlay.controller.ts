export class BlipBlockPickerOverlayController {

    public static controllerName = 'Blip.BlockPicker.Overlay.Controller';

    loading: boolean = false;
    multiPicker!: boolean;

    constructor(private $scope, private localizationService) {

    }


    /**
     * 
     * */
    $onInit = () => {

        this.loading = true;
        this.multiPicker = this.$scope.model.multiPicker;

        // set default title
        if (!this.$scope.model.title) {
            const labelKey = this.multiPicker ? 'blip_selectItem' : 'blip_selectItems';
            this.localizationService.localize(labelKey).then(title => this.$scope.model.title = title);
        }

        // make sure we can push to something
        if (!this.$scope.model.selection) {
            this.$scope.model.selection = [];
        }

        this.loading = false;
    }


    /**
     * 
     * @param {IBlipBlock} block
     */
    selectBlock = (block: IBlipBlock) => {

        if (!block._selected) {
            block._selected = true;
            this.$scope.model.selection.push(block);
        } else {

            if (block._selected) {
                this.$scope.model.selection.forEach((selectedBlock, idx) => {
                    if (selectedBlock.id === block.id) {
                        block._selected = false;
                        this.$scope.model.selection.splice(idx, 1);
                    }
                });
            } else {
                if (!this.multiPicker) {
                    this.$scope.model.blocks.forEach(b => b._selected = false);
                }

                block._selected = true;
                this.$scope.model.selection.push(block);
            }
        }

        if (!this.multiPicker) {
            this.submit(this.$scope.model);
        }
    }


    /**
     * 
     * @param {any} model
     */
    submit = model => this.$scope.model.submit ? this.$scope.model.submit(model) : {};


    /**
     * 
     * */
    close = () => this.$scope.model.close ? this.$scope.model.close() : {};
}

