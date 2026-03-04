class BlipBlockController {

    block!: { data: IBlipBlock };
    stylesheet!: string;
    view!: string;

    constructor(private $scope, private $compile, private $element) {
    }

    $onInit = () => {

        this.$scope.block = this.block;

        if (this.stylesheet && this.view) {
            var shadowRoot = this.$element[0].attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = `
                    <style>
                        @import "${this.stylesheet}"
                    </style>
                    <div class="umb-block-list__block--view" ng-include="${this.view}"></div>
                `;
            this.$compile(shadowRoot)(this.$scope);
        }
        else {
            this.$element.append(this.$compile('<div class="umb-block-list_block--view" ng-include="model.view"></div>')(this.$scope));
        }
    };
}

export const BlipBlockComponent = {
    name: 'blipBlock',
    transclude: true,
    bindings: {
        view: '@',
        stylesheet: '@',
        block: '=',
    },
    controller: BlipBlockController,
};
