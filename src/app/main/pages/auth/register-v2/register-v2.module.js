(function () {
    'use strict';

    angular
        .module('app.pages.auth.register-v2', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider) {
        // State
        $stateProvider.state('app.pages_auth_register-v2', {
            url: '/register',
            views: {
                'main@': {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller: 'MainController as vm'
                },
                'content@app.pages_auth_register-v2': {
                    templateUrl: 'app/main/pages/auth/register-v2/register-v2.html',
                    controller: 'RegisterV2Controller as vm'
                }
            }, resolve: {
                Categories: function (msApi) {
                    return msApi.resolve('categories@find');
                }
            },
            bodyClass: 'register-v2'
        });

        msApiProvider.register('categories', ['Category']);

        // Translate
        $translatePartialLoaderProvider.addPart('app/main/pages/auth/register-v2');
    }

})();