(function () {
    'use strict';

    angular
        .module('fuse')
        .run(runBlock);

    /** @ngInject */
    function runBlock($rootScope, $timeout, $state, $mdDialog) {
        $rootScope.loggedIn = Parse.User.current();

        // Activate loading indicator
        var stateChangeStartEvent = $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.loadingProgress = true;
            if (!Parse.User.current() && toState.name.indexOf('auth') == -1) {
                event.preventDefault();
                $state.go('app.pages_auth_login-v2');
            }
        });

        // De-activate loading indicator
        var stateChangeSuccessEvent = $rootScope.$on('$stateChangeSuccess', function () {
            $timeout(function () {
                $rootScope.loadingProgress = false;
            });
        });

        // Store state in the root scope for easy access
        $rootScope.state = $state;

        // Cleanup
        $rootScope.$on('$destroy', function () {
            stateChangeStartEvent();
            stateChangeSuccessEvent();
        });

        $rootScope.alertModal = function (message, title, ok) {
            return $mdDialog.show(
                $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .parent(angular.element(document.body))
                    .title(title || 'Alert')
                    .textContent(message)
                    .ariaLabel('Alert Dialog Demo')
                    .ok(ok || 'Got it!')
            );
        }
    }
})();