export class BlipEditorController {

    public static controllerName = 'Blip.Editor.Controller';

    renderModel: Array<IBlipBlock> = [];
    blocks: Array<IBlipBlock> =[];
    types: Array<UmbBlock> = [];

    loading: boolean = false;
    userCanAddBlock: boolean = true;
    multiPicker: boolean;

    config: any;
    minNumberOfItems: number;
    maxNumberOfItems: number;
    sortableOptions: any;

    sourceNode!: UmbNode;

    onFormSubmitting!: Function;
    onRenderModelChange!: Function;

    constructor(private $scope, private editorService, private contentResource, private blipResource) {

        this.$scope.model.value = this.$scope.model.value || [];

        this.renderModel = [];

        this.config = Object.assign({
            minNumber: 1,
            maxNumber: 1,
        }, $scope.model.config);

        // for validation
        this.minNumberOfItems = this.config.minNumber ? parseInt(this.config.minNumber) : 0;
        this.maxNumberOfItems = this.config.maxNumber ? parseInt(this.config.maxNumber) : 0;
        this.multiPicker = this.maxNumberOfItems !== 1;

        // sortable options
        this.sortableOptions = {
            axis: 'y',
            containment: 'parent',
            distance: 10,
            opacity: 0.7,
            tolerance: 'pointer',
            scroll: true,
            zIndex: 6000,
            update: () => {
                this.setDirty();
            },
        };
    }


    /**
     * 
     * */
    $onInit = () => this.init();


    /**
     * 
     * */
    $onDestroy = () => {
        this.onFormSubmitting ? this.onFormSubmitting() : {};
        this.onRenderModelChange ? this.onRenderModelChange() : {};
    }


    /**
     * 
     * */
    setDirty = () => {
        if (this.$scope.blipForm && this.$scope.blipForm.modelValue) {
            this.$scope.blipForm.modelValue.$setDirty();
        }
    }


    /**
     * Get the correct blocks, and sort to match the saved order
     * */
    syncRenderModel = () => {
        const value = this.$scope.model.value;

        this.renderModel = this.blocks.filter(b => value.includes(b.udi));
        this.renderModel.sort((a, b) => value.indexOf(a.udi) - value.indexOf(b.udi));
    }


    /**
     * After closing the infinite editor, check that the render model blocks are still valid
     * Block can be modified or removed
     * */
    refreshRenderModel = () => {
        const keysToRemove: Array<string> = [];
        this.blocks.forEach(block => {
            const renderModelBlock = this.renderModel.find(b => b.udi === block.udi);
            if (!renderModelBlock) {
                keysToRemove.push(block.udi);
            } else {
                Object.assign(renderModelBlock, block);
            }
        });

        this.renderModel = this.renderModel.filter(b => !keysToRemove.includes(b.udi));
    }


    /**
     * 
     * */
    subscribe = () => {
        this.onFormSubmitting = this.$scope.$on('formSubmitting', () => {
            this.$scope.model.value = this.renderModel.map(r => r.udi);
        });

        this.onRenderModelChange = this.$scope.$watch(() => this.renderModel, (newVal, oldVal) => {
            if (newVal !== oldVal) {
                this.validate();
            }
        });
    }


    /**
     * 
     * */
    validate = () => {
        if (!this.$scope.blipForm) return;

        const hasItemsOrMandatory = this.renderModel.length !== 0 || (this.$scope.model.validation && this.$scope.model.validation.mandatory);

        const validMinCount = hasItemsOrMandatory && this.minNumberOfItems && this.minNumberOfItems <= this.renderModel.length;
        this.$scope.blipForm.minCount.$setValidity('minCount', validMinCount);

        const validMaxCount = this.maxNumberOfItems && this.maxNumberOfItems >= this.renderModel.length;
        this.$scope.blipForm.maxCount.$setValidity('maxCount', validMaxCount);
    }


    /**
     * 
     * */
    addBlock = () => {
        const editorModel = {
            view: Umbraco.Sys.ServerVariables.umbracoSettings.appPluginsPath + '/Blip/Backoffice/blip.blockpicker.overlay.html',
            multiPicker: this.multiPicker,
            selection: this.blocks.filter(b => b._selected),
            size: 'medium',
            blocks: this.blocks,
            submit: model => {
                this.renderModel = model.selection;
                this.$scope.model.value = this.renderModel.map(r => r.udi);

                this.editorService.close();
            },
            close: () => this.editorService.close()
        };

        this.editorService.open(editorModel);
    }


    /**
     * After closing, we re-fetch the node as it may have additional data
     * */
    createBlock = () => {
        var editor = {
            size: 'medium',
            id: this.sourceNode.id,
            submit: () => {
                this.editorService.close();
                this.init(true);
            },
            close: () => {
                this.editorService.close();
                this.init(true);
            }
        };

        this.editorService.contentEditor(editor);
    }


    /**
     * 
     * @param {any} udi
     */
    removeBlock = udi => {
        const blockRef = this.blocks.find(b => b.udi === udi);

        if (blockRef) {
            blockRef._selected = false;
        }

        this.renderModel = this.blocks.filter(b => b._selected);
    }


    /**
     * 
     */
    preSelect = () => this.blocks.forEach(b => b._selected = this.$scope.model.value.includes(b.udi));


    /**
     * 
     * */
    init = (isRefresh?: boolean) => {
        this.loading = true;

        this.contentResource.getById(this.config.sourceNode)
            .then(result => {
                this.sourceNode = result;
                const sourceProperty = this.blipResource.getSourceProperty(this.sourceNode, this.config.sourceProperty);

                // does the current user have edit permissions on the source node?
                this.userCanAddBlock = this.sourceNode.allowedActions.includes('A');                  

                this.blipResource.getBlockData(sourceProperty)
                    .then(_ => {

                        this.blocks = sourceProperty.value.contentData;
                        this.types = sourceProperty.config.blocks;

                        this.preSelect();

                        if (isRefresh) {
                            this.refreshRenderModel();
                        } else {
                            this.syncRenderModel();
                            this.subscribe();
                        }

                        this.validate();

                        this.loading = false;
                    });
            });
    }
}
