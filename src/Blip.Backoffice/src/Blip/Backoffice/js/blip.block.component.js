function blipBlockController($scope, $compile, $element) {
    var model = this;

    model.$onInit = function () {

        $scope.block = model.block;

        if (model.styleSheet && model.view) {
            var shadowRoot = $element[0].attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = `
                    <style>
                        @import "${model.stylesheet}"
                    </style>
                    <div class="umb-block-list__block--view" ng-include="${model.view}"></div>
                `;
            $compile(shadowRoot)($scope);
        }
        else {
            $element.append($compile('<div class="umb-block-list_block--view" ng-include="model.view"></div>')($scope));
        }
    };
}

angular
    .module('umbraco')
    .component('blipBlock', {
        controller: blipBlockController,
        controllerAs: 'model',
        bindings: {
            view: '@',
            stylesheet: '@',
            block: '=',
        }
    });