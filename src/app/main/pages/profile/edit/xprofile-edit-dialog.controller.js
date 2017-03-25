(function () {
    'use strict';

    angular
        .module('app.pages.profile')
        .controller('ProfileEditDialogController', ContactDialogController);

    /** @ngInject */
    function ContactDialogController($mdDialog, User, msApi) {
        var vm = this;

        vm.title = 'Edit';
        vm.user = User;
        vm.newContact = false;

        msApi.resolve('categories@find').then(function (categories) {
            vm.categories = categories;
        });

        vm.saveContact = function () {
            // Dummy save action
            for (var i = 0; i < vm.contacts.length; i++) {
                if (vm.contacts[i].id === vm.contact.id) {
                    vm.contacts[i] = angular.copy(vm.contact);
                    break;
                }
            }

            closeDialog();
        };
        vm.closeDialog = function () {
            $mdDialog.hide();
        };
    }
})();