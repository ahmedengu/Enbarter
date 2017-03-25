(function ()
{
    'use strict';

    angular
        .module('fuse')
        .config(config);

    /** @ngInject */
    function config($translateProvider)
    {
        // Put your common app configurations here
        Parse.initialize("EnbarterApp", "Ad06@!30");
        Parse.serverURL = 'http://localhost:1337/v1';

        // angular-translate configuration
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '{part}/i18n/{lang}.json'
        });
        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('sanitize');
    }

})();