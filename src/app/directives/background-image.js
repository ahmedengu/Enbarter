(function () {
    'use strict';

    angular
        .module('fuse')
        .directive('backgroundImage', backgroundImage);

    /** @ngInject */
    function backgroundImage() {
        return {
            restrict: 'A',
            scope: {
                backgroundImage: '<backgroundImage'
            },
            link: function (scope, element, attrs) {
                if (scope.backgroundImage)
                    element.css({
                        "background": "url('" + scope.backgroundImage + "') no-repeat 0 45%",
                        'background-size': '100% auto'
                    });
            }
        }
    }
}());