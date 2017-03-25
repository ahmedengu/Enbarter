(function () {
    'use strict';

    angular
        .module('app.pages.auth.login-v2')
        .controller('LoginV2Controller', LoginV2Controller);

    /** @ngInject */
    function LoginV2Controller($rootScope, toDataURI) {
        var vm = this;

        vm.login = function () {
            var form = vm.form;
            Parse.User.logIn(form.username.toLowerCase(), form.password, {
                success: function (user) {
                    location.href = "/";
                },
                error: function (user, error) {
                    $rootScope.alertModal(error.message, "Error");
                }
            });
        }
        vm.fbLogin = function () {
            Parse.FacebookUtils.logIn(null, {
                success: function (user) {
                    if (!user.existed()) {
                        FB.api('/me', 'get', {
                            access_token: user.get('authData').access_token,
                            fields: 'id,name'
                        }, function (response) {
                            if (!response.error) {
                                toDataURI.convert("https://graph.facebook.com/" + response.id + "/picture?type=large", function (result) {
                                    user.set("username", response.name.toLowerCase());
                                    user.set("pic", new Parse.File("pic.jpg", {base64: result.toString('base64')}));
                                    user.save(null, {
                                        success: function (user) {
                                            location.href = "/";
                                        },
                                        error: function (user, error) {

                                            $rootScope.alertModal("Oops, something went wrong saving your name.");
                                        }
                                    });
                                });
                            } else {

                                $rootScope.alertModal("Oops something went wrong with facebook.");
                            }
                        });
                    } else
                        location.href = "/";
                },
                error: function (error) {

                    $rootScope.alertModal(error.message || "User cancelled the Facebook login or did not fully authorize.");
                }
            });
        }

        if (typeof FB === 'undefined') {
            $.ajax({
                type: "GET",
                url: "https://connect.facebook.net/en_US/all.js",
                success: function () {
                    $(this).attr('id', 'facebook-jssdk');
                    Parse.FacebookUtils.init({
                        appId: '1394780183887567',
                        status: false,
                        cookie: true,
                        xfbml: true
                    });
                },
                dataType: "script",
                cache: true
            });
        }
    }
})();