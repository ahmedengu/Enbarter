(function ()
{
    'use strict';

    angular
        .module('app.pages.auth.login-v2', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider)
    {
        // State
        $stateProvider.state('app.pages_auth_login-v2', {
            url      : '/login',
            views    : {
                'main@'                          : {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller : 'MainController as vm'
                },
                'content@app.pages_auth_login-v2': {
                    templateUrl: 'app/main/pages/auth/login-v2/login-v2.html',
                    controller : 'LoginV2Controller as vm'
                }
            },
            bodyClass: 'login-v2'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/pages/auth/login-v2');
    }

})();