(function () {
    'use strict';

    angular
        .module('fuse')
        .directive('starRating', function () {
            return {
                scope: {
                    rating: '=',
                    maxRating: '@',
                    readOnly: '@',
                    click: "&",
                    mouseHover: "&",
                    mouseLeave: "&"
                },
                restrict: 'EA',
                template: '<ul  style="display: inline-block; margin: 0px; padding: 0px; cursor:pointer;" class="star-rating" ng-class="{readonly: readonly}">' +
                '  <li ng-repeat="idx in maxRatings track by $index" class="star" ng-class="(hoverValue + _rating > $index)&&\'amber-600-fg\'" ng-mouseover="toggle($index)">' +
                '    <i class="glyphicon glyphicon-star" ng-Click="isolatedClick($index + 1)" ng-mouseenter="isolatedMouseHover($index + 1)" ng-mouseleave="isolatedMouseLeave($index + 1)"></i>' +
                '  </li>' +
                '</ul>',
                compile: function (element, attrs) {
                    if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
                        attrs.maxRating = '5';
                    }
                    ;
                },
                controller: function ($scope, $element, $attrs) {
                    $scope.maxRatings = [];

                    for (var i = 1; i <= $scope.maxRating; i++) {
                        $scope.maxRatings.push({});
                    }
                    ;

                    $scope._rating = $scope.rating;

                    $scope.isolatedClick = function (param) {
                        if ($scope.readOnly == 'true') return;

                        $scope.rating = $scope._rating = param;
                        $scope.hoverValue = 0;
                        $scope.click({
                            param: param
                        });
                    };

                    $scope.isolatedMouseHover = function (param) {
                        if ($scope.readOnly == 'true') return;

                        $scope._rating = 0;
                        $scope.hoverValue = param;
                        $scope.mouseHover({
                            param: param
                        });
                    };

                    $scope.isolatedMouseLeave = function (param) {
                        if ($scope.readOnly == 'true') return;

                        $scope._rating = $scope.rating;
                        $scope.hoverValue = 0;
                        $scope.mouseLeave({
                            param: param
                        });
                    };
                }
            };
        });

}());