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

        $rootScope.reportObject = function (object) {
            $mdDialog.show($mdDialog.prompt()
                .title('Report')
                .placeholder('description')
                .ariaLabel('description')
                .parent(angular.element(document.body))
                .ok('Report!')
                .cancel('Cancel')).then(function (result) {

                var Report = Parse.Object.extend("Report");
                var report = new Report();
                report.set("user", Parse.User.current());
                report.set("description", result);
                report.addUnique("objects", object);
                report.save({
                    success: function (results) {
                        $rootScope.alertModal('Thank you');
                    },
                    error: function (object, error) {
                        $rootScope.alertModal(error.message, "Error");
                    }
                });
            });
        }
    }
})();