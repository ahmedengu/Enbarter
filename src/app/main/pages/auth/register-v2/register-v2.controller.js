(function () {
    'use strict';

    angular
        .module('app.pages.auth.register-v2')
        .controller('RegisterV2Controller', RegisterV2Controller);

    /** @ngInject */
    function RegisterV2Controller($rootScope, $mdDialog, Categories) {
        var vm = this;

        vm.register = function () {
            var form = vm.form;
            var user = new Parse.User();
            user.set("username", form.username.toLowerCase());
            user.set("password", form.password);
            user.set("email", form.email.toLowerCase());
            user.set("name", form.name);
            user.set("mobile", form.mobile);
            user.set("birthday", form.birthday);
            user.set("isMale", form.isMale);
            if (vm.interest.length)
                user.set("interest", vm.interest);

            user.signUp(null, {
                success: function (user) {
                    Parse.User.logOut().then(function () {

                        $rootScope.alertModal("Your account have been created, Kindly validate your email.", "Congrats")
                            .then(function () {
                                location.href = "/";
                            });
                    });
                },
                error: function (user, error) {

                    $rootScope.alertModal(error.message, "Error");
                }
            });
        }
        vm.interest = [];
        var cachedQuery;
        vm.interestSearch = function (query) {
            cachedQuery = cachedQuery || query;
            return Categories.filter(function (cat) {
                if (cat.get('name').toLowerCase().indexOf(cachedQuery.toLowerCase()) != -1) {
                    if (vm.interest.filter(function (x) {
                            return x.id == cat.id
                        }).length)
                        return;
                    cat.name = cat.get('name');
                    cat.pic = cat.get('pic');
                    return cat;
                }
            });
        }
    }
})();