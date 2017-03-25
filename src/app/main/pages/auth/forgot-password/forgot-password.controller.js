(function () {
    'use strict';

    angular
        .module('app.pages.auth.forgot-password')
        .controller('ForgotPasswordController', ForgotPasswordController);

    /** @ngInject */
    function ForgotPasswordController($rootScope) {
        var vm = this;
        vm.resetPassword = function () {
            var form = vm.form;

            Parse.User.requestPasswordReset(form.email.toLowerCase(), {
                success: function () {

                    $rootScope.alertModal("Request sent").then(function () {
                        location.href = "/";
                    })
                },
                error: function (error) {

                    $rootScope.alertModal(error.message, "Error");
                }
            });
        }
    }
})();