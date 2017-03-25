(function () {
    'use strict';

    angular
        .module('app.pages.profile', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider, msApiProvider) {
        var resolve = {
            Timeline: function ($stateParams, msApi) {
                return msApi.resolve('profile.timeline@find', {
                    equalTo: ['user', {
                        "__type": "Pointer",
                        "className": '_User',
                        "objectId": ($stateParams && $stateParams.id) || (Parse.User.current() && Parse.User.current().id)
                    }]
                });
            },
            About: function ($stateParams, msApi) {
                return msApi.resolve('profile.about@get', {
                    id: ($stateParams && $stateParams.id) || (Parse.User.current() && Parse.User.current().id)
                });
            },
            Barters: function ($stateParams, msApi) {
                return msApi.resolve('profile.barters@find', {
                    or: [{
                        equalTo: ['user', {
                            "__type": "Pointer",
                            "className": '_User',
                            "objectId": ($stateParams && $stateParams.id) || (Parse.User.current() && Parse.User.current().id)
                        }]
                    }, {
                        equalTo: ['barterUpUser', {
                            "__type": "Pointer",
                            "className": '_User',
                            "objectId": ($stateParams && $stateParams.id) || (Parse.User.current() && Parse.User.current().id)
                        }]
                    }]
                });
            },
            Followers: function ($stateParams, msApi) {
                return msApi.resolve('profile.followers@find', {
                    or: [{
                        equalTo: {
                            1: ['from', Parse.User.current()], 2: ['to', {
                                "__type": "Pointer",
                                "className": '_User',
                                "objectId": ($stateParams && $stateParams.id) || (Parse.User.current() && Parse.User.current().id)
                            }]
                        }
                    }, {
                        equalTo: ['to', {
                            "__type": "Pointer",
                            "className": '_User',
                            "objectId": ($stateParams && $stateParams.id) || (Parse.User.current() && Parse.User.current().id)
                        }]
                    }]
                });
            }
        };
        $stateProvider.state('app.pages_profile', {
            url: '/profile',
            views: {
                'content@app': {
                    templateUrl: 'app/main/pages/profile/profile.html',
                    controller: 'ProfileController as vm'
                }
            }, resolve: resolve,
            bodyClass: 'profile'
        });

        $stateProvider.state('app.pages_profile.id', {
            url: '/:id',
            views: {
                'content@app': {
                    templateUrl: 'app/main/pages/profile/profile.html',
                    controller: 'ProfileController as vm'
                }
            }, resolve: resolve,
            bodyClass: 'profile'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/pages/profile');

        // Api
        msApiProvider.register('profile.timeline', ['Post', {
            equalTo: ['user', Parse.User.current()],
            descending: ['createdAt']
        }]);
        msApiProvider.register('profile.about', ['_User', {
            id: (Parse.User.current() && Parse.User.current().id),
            include: ['barterSeeks,barterSeeks.seekCategory,barterSeeks.offerCategory,membership,favors.favor,interest']
        }]);
        msApiProvider.register('profile.barters', ['Barter', {
            or: [{
                equalTo: ['user', Parse.User.current()]
            }, {
                equalTo: ['barterUpUser', Parse.User.current()]
            }],
            include: ['seekCategory,offerCategory,barterUpUser,user'],
            descending: ['updatedAt']
        }]);

        msApiProvider.register('profile.followers', ['UserFollow', {
            or: [{
                equalTo: ['from', Parse.User.current()]
            }, {
                limit: [20]
            }],
            include: ['from,to'],
            limit: [20]
        }]);
        // Navigation
        msNavigationServiceProvider.saveItem('pages.profile', {
            title: 'Profile',
            icon: 'icon-account',
            state: 'app.pages_profile',
            weight: 6
        });
    }

})();