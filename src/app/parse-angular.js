(function (window, undef) {

    var angular = window.angular;

    if (angular !== undef) {

        var module = angular.module('parse-angular', []);

        module.run(['$q', '$window', '$rootScope', function ($q, $window, $rootScope) {
            // Process only if Parse exist on the global window, do nothing otherwise
            if (Parse) {


                //-------------------------------------
                // Structured object of what we need to update
                //-------------------------------------

                var methodsToUpdate = {
                    "Object": {
                        prototype: ['save', 'fetch', 'destroy'],
                        static: ['saveAll', 'destroyAll']
                    },
                    "Query": {
                        prototype: ['find', 'first', 'count', 'get'],
                        static: []
                    },
                    "Cloud": {
                        prototype: [],
                        static: ['run']
                    },
                    "User": {
                        prototype: ['signUp', 'logIn'],
                        static: ['requestPasswordReset']
                    },
                    "FacebookUtils": {
                        prototype: [],
                        static: ['logIn', 'link', 'unlink']
                    },
                    "Config": {
                        prototype: [],
                        static: ['get']
                    }
                };
                var loadingMethods = ['save', 'signUp', 'logIn', 'requestPasswordReset'];
                //// Let's loop over Parse objects
                for (var k in methodsToUpdate) {

                    var currentClass = k;
                    var currentObject = methodsToUpdate[k];

                    var currentProtoMethods = currentObject.prototype;
                    var currentStaticMethods = currentObject.static;

                    var rejectHandler = function (obj, err) {
                        var defer = $q.defer();
                        obj.code = obj.code || (err && err.code ) || 100;
                        obj.message = obj.message || (err && err.message);
                        console.log(obj);
                        defer.reject(obj);
                        return defer.promise;
                    };

                    /// Patching prototypes
                    currentProtoMethods.forEach(function (method) {

                        var origMethod = Parse[currentClass].prototype[method];

                        // Overwrite original function by wrapping it with $q
                        Parse[currentClass].prototype[method] = function () {
                            if (loadingMethods.indexOf(method) != -1) $rootScope.isLoading = true;
                            $rootScope.loadingProgress = true;
                            return origMethod.apply(angular.copy(this), arguments)
                                .then(function (data) {
                                    var defer = $q.defer();
                                    defer.resolve(data);
                                    if (loadingMethods.indexOf(method) != -1) $rootScope.isLoading = false;
                                    $rootScope.loadingProgress = false;
                                    return defer.promise;
                                }, function (obj, err) {
                                    if (loadingMethods.indexOf(method) != -1) $rootScope.isLoading = false;
                                    $rootScope.loadingProgress = false;
                                    return rejectHandler(obj, err);
                                });
                        };

                    });


                    ///Patching static methods too
                    currentStaticMethods.forEach(function (method) {

                        var origMethod = Parse[currentClass][method];

                        // Overwrite original function by wrapping it with $q
                        Parse[currentClass][method] = function () {
                            if (loadingMethods.indexOf(method) != -1) $rootScope.isLoading = true;
                            $rootScope.loadingProgress = true;
                            return origMethod.apply(angular.copy(this), arguments)
                                .then(function (data) {
                                    var defer = $q.defer();
                                    defer.resolve(data);
                                    if (loadingMethods.indexOf(method) != -1) $rootScope.isLoading = false;
                                    $rootScope.loadingProgress = false;
                                    return defer.promise;
                                }, function (obj, err) {
                                    if (loadingMethods.indexOf(method) != -1) $rootScope.isLoading = false;
                                    $rootScope.loadingProgress = false;
                                    return rejectHandler(obj, err);
                                });
                        };

                    });


                }
            }

        }]);


        angular.module('parse-angular.enhance', ['parse-angular'])
            .run(['$q', '$window', function ($q, $window) {


                if (Parse) {


                    /// Create a method to easily access our object
                    /// Because Parse.Object("xxxx") is actually creating an object and we can't access static methods

                    Parse.Object.getClass = function (className) {
                        return Parse.Object._classMap[className];
                    };

                    ///// CamelCaseIsh Helper
                    function capitaliseFirstLetter(string) {
                        return string.charAt(0).toUpperCase() + string.slice(1);
                    }


                    ///// Override orig extend
                    var origObjectExtend = Parse.Object.extend;

                    Parse.Object.extend = function (protoProps) {

                        var newClass = origObjectExtend.apply(this, arguments);

                        if (Parse._ && Parse._.isObject(protoProps) && Parse._.isArray(protoProps.attrs)) {
                            var attrs = protoProps.attrs;
                            /// Generate setters & getters
                            Parse._.each(attrs, function (currentAttr) {

                                var field = capitaliseFirstLetter(currentAttr);

                                // Don't override if we set a custom setters or getters
                                if (!newClass.prototype['get' + field]) {
                                    newClass.prototype['get' + field] = function () {
                                        return this.get(currentAttr);
                                    };
                                }
                                if (!newClass.prototype['set' + field]) {
                                    newClass.prototype['set' + field] = function (data) {
                                        this.set(currentAttr, data);
                                        return this;
                                    }
                                }

                            });
                        }
                        return newClass;
                    }


                    /// Keep references & init Object class map
                    Parse.Object._classMap = {};

                    var origExtend = Parse.Object.extend;

                    /// Enhance Object 'extend' to store their subclass in a map
                    Parse.Object.extend = function (opts) {

                        var extended = origExtend.apply(this, arguments);

                        if (opts && opts.className) {
                            Parse.Object._classMap[opts.className] = extended;
                        }

                        return extended;

                    };


                    Parse.Object.getClass = function (className) {
                        return Parse.Object._classMap[className];
                    }


                    /// Enhance Object prototype
                    Parse.Object.prototype = angular.extend(Parse.Object.prototype, {
                        // Simple paginator
                        loadMore: function (opts) {

                            if (!angular.isUndefined(this.query)) {

                                // Default Parse limit is 100
                                var currentLimit = this.query._limit == -1 ? 100 : this.query._limit;
                                var currentSkip = this.query._skip;

                                currentSkip += currentLimit;

                                this.query.skip(currentSkip);

                                var _this = this;

                                return this.query.find()
                                    .then(function (newModels) {
                                        if (!opts || opts.add !== false) _this.add(newModels)
                                        if (newModels.length < currentLimit) _this.hasMoreToLoad = false;
                                        return newModels;
                                    });

                            }

                        }

                    });

                }

            }]);


    }

})(this);
