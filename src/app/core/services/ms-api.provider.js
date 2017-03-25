(function () {
    'use strict';

    angular
        .module('app.core')
        .provider('msApi', msApiProvider);

    /** @ngInject **/
    function msApiProvider() {
        /* ----------------- */
        /* Provider          */
        /* ----------------- */
        var provider = this;

        // Inject the $log service
        var $log = angular.injector(['ng']).get('$log');

        // Data
        var api = [];

        // Methods
        provider.getApiObject = getApiObject;
        provider.register = register;

        //////////

        /**
         * Return the api object
         *
         * @returns {object}
         */
        function getApiObject() {
            return api;
        }

        /**
         * Register API endpoint
         *
         * @param key
         * @param resource
         */
        function register(key, resource) {
            if (!angular.isString(key)) {
                $log.error('"path" must be a string (eg. `dashboard.project`)');
                return;
            }
            if (!angular.isArray(resource)) {
                $log.error('"resource" must be an array and it must follow $resource definition');
                return;
            }


            // Store the API object
            api[key] = {
                className: resource[0],
                paramDefaults: resource[1] || {},
                actions: resource[2] || {},
                options: resource[3] || {}
            };
        }


        function assignKey(params2, key, query) {
            if (params2.length == 1) {
                query[key](params2[0]);
            } else if (params2.length == 2) {
                query[key](params2[0], params2[1]);
            } else if (params2.length > 2) {
                query[key](params2[0], params2.slice(1));
            }
        }

        function assignKeys(params2, query) {
            for (var key in params2) {
                if (query[key]) {
                    if (Array.isArray(params2[key])) {
                        assignKey(params2[key], key, query);
                    } else {
                        for (var k in params2[key]) {
                            assignKey(params2[key][k], key, query);
                        }
                    }
                }
            }
        }

        function parseBuilder(method, apiObject, defaults, params, callbackObj) {
            if (['save', 'delete', 'remove', 'update', 'put'].indexOf(method.toLowerCase()) != -1) {

            } else {

                var name = apiObject.className;
                var ClassName = Parse.Object.extend(name);
                var queryArr = [];
                var iterateOver = defaults.or || params.or || [''];
                for (var i = 0; i < iterateOver.length; i++) {
                    var query = new Parse.Query(ClassName);

                    var defaults2 = (defaults.or && defaults.or[i]) || defaults;
                    assignKeys(defaults2, query);
                    var params2 = (params.or && params.or[i]) || params;
                    assignKeys(params2, query);
                    queryArr.push(query);
                }

                if (method == 'get') {
                    queryArr[0].get((params.id || params.objectId || defaults.id || defaults.objectId),
                        callbackObj
                    );
                }
                else if (queryArr.length > 1) {
                    delete params.or;
                    delete defaults.or;
                    var or = Parse.Query.or.apply(this, queryArr);
                    assignKeys(params, or);
                    assignKeys(defaults, or);

                    or[method || 'find'](
                        callbackObj
                    );
                }
                else
                    queryArr[0][method || 'find'](
                        callbackObj
                    );
            }
        }

        /* ----------------- */
        /* Service           */
        /* ----------------- */
        this.$get = function ($log, $q, $rootScope) {
            // Data

            // Methods
            var service = {
                register: register,
                resolve: resolve,
                request: request
            };

            return service;

            //////////

            /**
             * Resolve an API endpoint
             *
             * @param action {string}
             * @param parameters {object}
             * @returns {promise|boolean}
             */
            function resolve(action, parameters) {
                // Emit an event
                $rootScope.$broadcast('msApi::resolveStart');

                var actionParts = action.split('@'),
                    resource = actionParts[0],
                    method = actionParts[1],
                    params = parameters || {};

                if (!resource || !method) {
                    $log.error('msApi.resolve requires correct action parameter (resourceName@methodName)');
                    return false;
                }

                // Create a new deferred object
                var deferred = $q.defer();

                // Get the correct resource definition from api object
                var apiObject = api[resource];
                var defaults = apiObject.paramDefaults
                if (!apiObject) {
                    $log.error('Resource "' + resource + '" is not defined in the api service!');
                    deferred.reject('Resource "' + resource + '" is not defined in the api service!');
                }
                else {
                    var callbackObj = {
                        success: function (response) {
                            deferred.resolve(response);
                            $rootScope.$broadcast('msApi::resolveSuccess');
                        },
                        error: function (response, response1) {
                            deferred.reject(response, response1);
                            $rootScope.$broadcast('msApi::resolveError');
                        }
                    };
                    parseBuilder(method, apiObject, defaults, params, callbackObj);
                }
                // Return the promise
                return deferred.promise;
            }

            /**
             * Make a request to an API endpoint
             *
             * @param action {string}
             * @param [parameters] {object}
             * @param [success] {function}
             * @param [error] {function}
             *
             * @returns {promise|boolean}
             */
            function request(action, parameters, success, error) {
                // Emit an event
                $rootScope.$broadcast('msApi::requestStart');

                var actionParts = action.split('@'),
                    resource = actionParts[0],
                    method = actionParts[1],
                    params = parameters || {};

                if (!resource || !method) {
                    $log.error('msApi.resolve requires correct action parameter (resourceName@methodName)');
                    return false;
                }

                // Create a new deferred object
                var deferred = $q.defer();

                // Get the correct resource definition from api object
                var apiObject = api[resource];

                if (!apiObject) {
                    $log.error('Resource "' + resource + '" is not defined in the api service!');
                    deferred.reject('Resource "' + resource + '" is not defined in the api service!');
                }
                else {
                    var callbackObj = {
                        success: function (response) {
                            // Emit an event
                            $rootScope.$broadcast('msApi::requestSuccess');

                            // Resolve the promise
                            deferred.resolve(response);

                            // Call the success function if there is one
                            if (angular.isDefined(success) && angular.isFunction(success)) {
                                success(response);
                            }
                        },
                        error: function (response, response1) {
                            // Emit an event
                            $rootScope.$broadcast('msApi::requestError');

                            // Reject the promise
                            deferred.reject(response);

                            // Call the error function if there is one
                            if (angular.isDefined(error) && angular.isFunction(error)) {
                                error(response);
                            }
                        }
                    };
                    parseBuilder(method, apiObject, defaults, params, callbackObj);
                }

                // Return the promise
                return deferred.promise;
            }
        };
    }
})();