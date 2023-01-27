export class BlipSourcePropertyPrevalueController {

    public static controllerName = 'Blip.SourceProperty.Prevalue.Controller';

    sourceProperty: any;
    editorScope: any;

    sourceProperties: Array<any> = [];

    editorScopeWatch!: Function;

    constructor(private $scope, private contentResource) { }


    /**
     * 
     * */
    $onInit = () => {
        this.sourceProperty = this.$scope.model.value;
        this.editorScope = this.getEditorScope();

        if (this.editorScope) {
            this.editorScopeWatch = this.$scope.$watch(() => {
                return this.editorScope.vm.dataType ? this.editorScope.vm.dataType.preValues : this.editorScope.vm.preValues;
            }, newVal => {
                if (!newVal) return;

                const sourceNode = newVal.find(x => x.alias === 'sourceNode');
                if (!sourceNode.value)
                    return;
                this.getSourceNode(sourceNode.value);
            }, true);
        }
    }


    /**
     * 
     * */
    $onDestroy = () => {
        this.editorScopeWatch ? this.editorScopeWatch() : {};
    }


    /*
     * 
     * */
    setSourceProperty = () => this.$scope.model.value = this.sourceProperty;


    /**
     * 
     * */
    getEditorScope = () => {
        let editorScope = this.$scope.$parent;
        do {
            editorScope = editorScope.$parent;
        } while (!Object.prototype.hasOwnProperty.call(editorScope, 'dataTypeSettingsForm')
            && !Object.prototype.hasOwnProperty.call(editorScope, 'contentForm'));
        return editorScope;
    }


    /**
     * 
     * @param {any} content
     */
    getBlockListProperties = content => {
        const props: Array<{ [key: string]: string }> = [];

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
    getSourceNode = udi => {
        this.contentResource.getById(udi)
            .then(content => {
                this.sourceProperties = this.getBlockListProperties(content);
            });
    }
}
