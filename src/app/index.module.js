(function () {
    'use strict';

    /**
     * Main module of the Fuse
     */
    angular
        .module('fuse', [

            // Core
            'app.core',
            'parse-angular',
            'parse-angular.enhance',
            // Navigation
            'app.navigation',

            // Toolbar
            'app.toolbar',

            // Pages
            'app.pages',

            // Sample
            'app.sample'
        ]);
})();