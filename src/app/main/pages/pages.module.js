(function ()
{
    'use strict';

    angular
        .module('app.pages', [
            'app.pages.auth.login-v2',
            'app.pages.auth.register-v2',
            'app.pages.auth.forgot-password',
            'app.pages.error-404',
            'app.pages.profile',
            'app.pages.search'
        ])
        .config(config);

    /** @ngInject */
    function config(msNavigationServiceProvider)
    {
        // Navigation
        msNavigationServiceProvider.saveItem('pages', {
            title : 'PAGES',
            group : true,
            weight: 2
        });
    }
})();