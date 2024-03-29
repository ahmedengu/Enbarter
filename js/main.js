var prerender = false;
var rootS;
Raven.config('https://22c41b4449c04f2f9678babd3400566c@sentry.io/118691').install();
window.prerenderReady = false;
String.prototype.paddingLeft = function (paddingValue) {
    return String(paddingValue + this).slice(-paddingValue.length);
};

var app = angular.module("BarterApp", ["ngRoute", 'ngSanitize']);
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/indexContent.html"
        }).when("/browse", {
        templateUrl: "views/browse.html"
    }).when("/browse/:id", {
        templateUrl: "views/browse.html"
    }).when("/barter/:id", {
        templateUrl: "views/barter.html"
    }).when("/create_barter", {
        templateUrl: "views/create_barter.html"
    }).when("/dashboard", {
        templateUrl: "views/viewDashboard.html"
    }).when("/dashboard/barter/:id", {
        templateUrl: "views/barterDashboard.html"
    }).when("/profile/edit", {
        templateUrl: "views/editProfile.html"
    }).when("/profile/:id", {
        templateUrl: "views/viewProfile.html"
    }).when("/profile", {
        templateUrl: "views/viewProfile.html"
    }).when("/notifications", {
        templateUrl: "views/notifications.html"
    }).when("/prices", {
        templateUrl: "views/prices.html"
    }).when("/messages", {
        templateUrl: "views/messages.html"
    }).when("/messages/:id", {
        templateUrl: "views/messages.html"
    }).otherwise({
        templateUrl: "views/404.html"
    });

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
});

app.run(function ($rootScope, $location) {
    Parse.initialize("EnbarterApp", "Ad06@!30");
    Parse.serverURL = 'https://api.enbarter.com/v1';
    rootS = $rootScope;
    $rootScope.title = 'Enbarter';
    $rootScope.description = "Enbarter is an online skill-exchange platform, driven by the oldest form of doing business: bartering. A barter is a system of exchange where goods or services are directly exchanged for other goods or services without an intermediary medium of exchange, mainly money.";
    $rootScope.keywords = "Enbarter,Barter,Bartering,Skills,Exchange,Entrepreneur,Service,Help,Direct,Professional,Free,Business";
    $rootScope.statusCode = 200;
    $rootScope.isLoggedIn = function () {
        if (Parse.User.current())
            return true;
        return false;
    }
    if (Parse.User.current()) {
        $rootScope.userId = Parse.User.current().id;
        $rootScope.currentUser = Parse.User.current();
    }
    $rootScope.addItemTo = function (list, item) {
        if (item && list.indexOf(item) == -1)
            list.push(item);
        return item = '';
    }
    $rootScope.removeItemFrom = function (list, item) {
        var index = list.indexOf(item);
        if (index > -1) {
            list.splice(index, 1);
        }
    }

    if ($location.search()['_escaped_fragment_'] && $location.search()['_escaped_fragment_'].length > 0 && $location.path() == '/' && $location.path() != $location.search()['_escaped_fragment_']) {
        $location.path($location.search()['_escaped_fragment_']);
        prerender = true;
    }

    $rootScope.notificationCheck = function (notification) {
        if (notification.get('read')) {
            var redirect = notification.get('redirect').split('#');
            if (redirect[0] == $location.path())
                location.reload();
            else
                $location.path(redirect[0]);
            if (redirect[1])
                $location.hash(redirect[1]);
            else
                $location.hash(null);
            return;
        }
        notification.set("read", true);
        if ($rootScope.nCount > 0)
            $rootScope.nCount--;
        notification.save({
            success: function (notification) {
                var redirect = notification.get('redirect').split('#');
                if (redirect[0] == $location.path())
                    location.reload();
                else
                    $location.path(redirect[0]);
                if (redirect[1])
                    $location.hash(redirect[1]);
                else
                    $location.hash(null);
                $rootScope.$apply();
            },
            error: function (object, error) {
                errorHandler($rootScope, error || object);
            }
        });
    }

    $rootScope.$on('$locationChangeStart', function (event) {
        if (prerender)
            prerender = false;

        showSpinner();
        $("html, body").stop().animate({scrollTop: 0}, '100', 'swing');

    });

    $rootScope.$on('$routeChangeSuccess', function (event) {
        $rootScope.statusCode = 200;
        $rootScope.currentUrl = window.location.href || document.URL;
    });

    $rootScope.initFBLogin = function () {
        if (typeof FB === 'undefined') {
            showSpinner();
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
                    hideSpinner();
                },
                dataType: "script",
                cache: true
            });
        }
    }

    $rootScope.passwordReset = function (email) {
        email = email || prompt("Enter Email");
        if (email) {
            showSpinner();
            Parse.User.requestPasswordReset(email.toLowerCase(), {
                success: function () {
                    $rootScope.alertModal("Request sent");
                    hideSpinner();
                },
                error: function (object, error) {
                    errorHandler($rootScope, error || object);
                }
            });
        } else $rootScope.alertModal('Email is required');
    }

    $rootScope.createReport = function () {
        var Report = Parse.Object.extend("Report");
        var report = new Report();
        report.set("user", Parse.User.current());
        report.set("description", $rootScope.reportDescription);
        report.addUnique("objects", $rootScope.reportThis);
        showSpinner();
        report.save({
            success: function (results) {
                $rootScope.alertModal("Thank You");
                $rootScope.reportDescription = "";
                hideSpinner();
            },
            error: function (object, error) {
                errorHandler($rootScope, error || object);
            }
        });
    }
    $rootScope.parseReport = function (reportThis) {
        $rootScope.reportThis = reportThis;
    }
});
app.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
});
app.directive('starRating', function starRating() {
    return {
        restrict: 'EA',
        template: '<ul class="star-rating" ng-class="{readonly: readonly}">' +
        '  <li ng-repeat="star in stars" class="star" ng-class="{filled: star.filled}" ng-mouseover="toggle($index)">' +
        '    <i class="glyphicon glyphicon-star"></i>' +
        '  </li>' +
        '</ul>',
        scope: {
            ratingValue: '=?ngModel',
            ratingStatic: '=?ngRate',
            max: '=?',
            readonly: '=?'
        },
        link: function (scope, element, attributes) {
            if (scope.max == undefined) {
                scope.max = 5;
            }
            function updateStars(rate) {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < rate
                    });
                }
            }

            scope.toggle = function (index) {
                if (scope.readonly == undefined || scope.readonly === false) {
                    scope.ratingValue = index + 1;
                    updateStars(scope.ratingValue);
                }
            };
            if (scope.ratingValue == undefined)
                scope.ratingValue = 0;
            updateStars(scope.ratingValue);
            if (scope.ratingStatic != undefined)
                updateStars(scope.ratingStatic);

        }
    };
});
app.controller('header', function ($scope, $location, $rootScope, $sce) {
    $rootScope.alertModal = function (message) {
        $scope.alertMessage = message;
        $scope.$apply();
        $('#alertModal').modal();
    }

    $scope.homeLink = "/";
    $scope.browseLink = "/browse";
    $scope.createBarterLink = "/create_barter";
    $scope.dashboardLink = "/dashboard";
    $rootScope.currentUrl = window.location.href || document.URL;

    $scope.fbLogin = function () {
        showSpinner();
        Parse.FacebookUtils.logIn(null, {
            success: function (user) {
                if (!user.existed()) {
                    FB.api('/me', 'get', {
                        access_token: user.get('authData').access_token,
                        fields: 'id,name'
                    }, function (response) {
                        if (!response.error) {
                            toDataUrl("https://graph.facebook.com/" + response.id + "/picture?type=large", function (result) {
                                user.set("username", response.name.toLowerCase());
                                user.set("pic", new Parse.File("pic.jpg", {base64: result.toString('base64')}));
                                user.save(null, {
                                    success: function (user) {
                                        location.reload();
                                    },
                                    error: function (user, error) {
                                        hideSpinner();
                                        $rootScope.alertModal("Oops, something went wrong saving your name.");
                                    }
                                });
                            });
                        } else {
                            hideSpinner();
                            $rootScope.alertModal("Oops something went wrong with facebook.");
                        }
                    });
                } else
                    location.reload();
            },
            error: function (user, error) {
                hideSpinner();
                $rootScope.alertModal("User cancelled the Facebook login or did not fully authorize.");
            }
        });
    }
    $scope.login = function () {
        if (!$scope.username || !$scope.password) {
            $rootScope.alertModal("Username/Password are required!");
            return;
        }
        showSpinner();
        Parse.User.logIn($scope.username.toLowerCase(), $scope.password, {
            success: function (user) {
                location.reload();
                hideSpinner();
            },
            error: function (user, error) {
                errorHandler($rootScope, error || user);
            }
        });
    }

    $scope.signup = function () {
        if (!$scope.username || !$scope.password || !$scope.email) {
            $rootScope.alertModal("Username/Password/Email are required!");
            return;
        }
        var user = new Parse.User();
        user.set("username", $scope.username.toLowerCase());
        user.set("password", $scope.password);
        user.set("email", $scope.email.toLowerCase());
        showSpinner();
        user.signUp(null, {
            success: function (user) {
                Parse.User.logOut().then(function () {
                    hideSpinner();
                    $scope.$apply();
                    $rootScope.alertModal("Kindly verify your email!");
                });
            },
            error: function (user, error) {
                errorHandler($rootScope, error || user);
            }
        });
    }

    $scope.logout = function () {
        showSpinner();
        Parse.User.logOut().then(function () {
            location.href = "/";
            location.reload();
            hideSpinner();
        });
    }

    if (Parse.User.current()) {
        var Notification = Parse.Object.extend('Notification');
        var query = new Parse.Query(Notification);
        query.equalTo("user", Parse.User.current());
        query.descending("createdAt");
        query.limit(11);
        query.find({
            success: function (results) {
                $scope.notifications = results || [];
                $rootScope.nCount = results.filter(function (x) {
                    if (!x.get('read'))
                        return true;
                    return false;
                }).length;
                $scope.$apply();
            },
            error: function (object, error) {
                errorHandler($rootScope, error || object);
            }
        });

        var subscription = query.subscribe();
        subscription.on('create', function (object) {
            $rootScope.nCount++;
            $scope.notifications.unshift(object);
            $scope.$apply();
            (new Audio('beeb.mp3')).play();
        });
    }

    $('.navbar-collapse a:not(#dontClose),.navbar-collapse button').click(function () {
        $(".navbar-collapse").collapse('hide');
    });
    $('#theHeader').removeAttr('style');
    $('#theFooter').removeAttr('style');
});


app.controller('createBarter', function ($scope, $rootScope) {
    $scope.milestones = [];
    $rootScope.title = "Enbarter | Create Barter";

    if (!Parse.User.current()) {
        $rootScope.alertModal("Please Login to be able to create a new barter!");
        getCategories(function (results) {
            $scope.categories = results;
            $scope.$apply();
            hideSpinner();
        });
    } else {
        profileWidget(Parse.User.current().id, $scope, 'create_barter', function () {
            getCategories(function (results) {
                $scope.categories = results;
                $scope.$apply();
                hideSpinner();
            });
        }, true);
    }

    $scope.favorChange = function () {
        $('.hideFavor').toggle();
        if ($('.hideFavor').is(":hidden")) {
            $scope.barterTitle1 = 'Favor';
            $('#formInput121').prop('disabled', true);
        } else {
            $scope.barterTitle1 = '';
            $('#formInput121').prop('disabled', false);
        }
    };

    $scope.startBarter = function () {
        if (!Parse.User.current()) {
            $rootScope.alertModal("Not loggedIn");
            return;
        }
        if ((!$scope.milestones || !$scope.milestones.length) && !$scope.favor) {
            $rootScope.alertModal('Milestones are required!');
            return;
        }
        var required = ['barterTitle2', 'seekCategory', 'seekDeadline'];
        if (!$scope.favor)
            required.push('offerDeadline', 'offerCategory', 'barterTitle1');
        var errors = "";
        for (var i = 0; i < required.length; i++) {
            if (!$scope[required[i]])
                errors += required[i] + "/";
        }
        var seekDesc = $('#seekDescription').summernote('code');
        var offerDesc = $('#offerDescription').summernote('code');
        if (!seekDesc.length)
            errors += "seekDescription/";
        if (!offerDesc.length && !$scope.favor)
            errors += "offerDescription/";
        if (errors.length) {
            $rootScope.alertModal("[" + errors + "] is/are Required");
            return;
        }

        $scope.canStartDisabled = true;
        var Barter = Parse.Object.extend("Barter");
        var Category = Parse.Object.extend("Category");
        var barter = new Barter();

        var milestones = [];
        for (var i = 0; i < $scope.milestones.length; i++) {
            milestones.push({checked: false, task: $scope.milestones[i]});
        }
        if ($scope.favor) {
            barter.set("barterTitle", "Favor For " + $scope.barterTitle2);
            barter.set("offerCategory", getPointer('JErAOy1k9B', 'Category'));
            barter.set("offerDeadline", 0);
            barter.set("offerFavor", getPointer($scope.result.get('favors')[0].favor, 'Favor'));
        } else {
            barter.set("barterTitle", $scope.barterTitle1 + " For " + $scope.barterTitle2);
            barter.set("offerMilestones", milestones);
            barter.set("offerDeadline", $scope.offerDeadline);
            barter.set("offerCategory", $scope.categories[$scope.offerCategory]);
            barter.set("offerDescription", offerDesc);
        }
        barter.set("seekCategory", $scope.categories[$scope.seekCategory]);
        barter.set("seekDescription", seekDesc);
        barter.set("seekDeadline", $scope.seekDeadline);
        barter.set("user", Parse.User.current());
        var text = offerDesc.replace(/(<([^>]+)>)/ig, "") + " " + seekDesc.replace(/(<([^>]+)>)/ig, "");
        barter.set('barterDescription', text);
        text += ' ' + barter.get('barterTitle');
        var words = text.split(" ");
        barter.set("words", jQuery.unique(words));
        barter.set("state", "new");

        showSpinner();
        barter.save(null, {
            success: function (barter) {
                window.location.href = "/barter/" + barter.id;
                hideSpinner();
            },
            error: function (barter, error) {
                errorHandler($rootScope, error || barter);
                $scope.canStartDisabled = false;
                $scope.$apply();
            }
        });

    }
});


function getCategories(successCallback) {
    var query = new Parse.Query(Parse.Object.extend("Category"));

    query.find({
        success: function (results) {
            successCallback(results);
        },
        error: function (object, error) {
            errorHandler($rootScope, error || object);
        }
    });

}
app.controller('browseCtrl', function ($rootScope, $scope, $routeParams, $location) {
    $rootScope.title = "Enbarter | Browse";
    $rootScope.description += " | Browse Barters";
    $rootScope.keywords += " ,browse,search,find";

    $scope.offerCat = 'all';
    $scope.seekCat = 'all';
    $scope.barterState = 'new';
    var skip = 0;
    getCategories(function (results) {
        $scope.categories = results;
        $scope.$apply();
        if ($routeParams.id) {
            $scope.seekCat = $routeParams.id;
            $scope.search();
        } else
            hideSpinner();
    });

    var Category = Parse.Object.extend("Category");
    var query;
    $scope.search = function () {
        showSpinner();
        skip = 0;
        query = new Parse.Query(Parse.Object.extend("Barter"));
        query.include('seekCategory');
        query.include('offerCategory');
        query.include('user');
        if ($scope.seekCat && $scope.seekCat != 'all')
            query.equalTo("seekCategory", Category.createWithoutData($scope.seekCat));
        if ($scope.offerCat && $scope.offerCat != 'all')
            query.equalTo("offerCategory", Category.createWithoutData($scope.offerCat));
        if ($scope.barterState && $scope.barterState != 'all')
            query.equalTo("state", $scope.barterState);
        if ($scope.query)
            query.containsAll("words", $scope.query.split(" "));
        query.limit(10);
        query.descending("createdAt");
        $scope.showLoadMore = false;
        query.find({
            success: function (results) {
                $scope.results = results;
                if (results.length > 9)
                    $scope.showLoadMore = true;
                $scope.$apply();
                hideSpinner();
            },
            error: function (object, error) {
                errorHandler($rootScope, error || object);
            }
        });
    }

    $scope.loadMore = function () {
        skip++;
        query.skip(skip * 10);
        showSpinner();
        query.find({
            success: function (results) {
                if (results.length) {
                    $scope.results = $scope.results.concat(results);
                }
                if (results.length < 10)
                    $scope.showLoadMore = false;
                $scope.$apply();
                hideSpinner();
            },
            error: function (object, error) {
                errorHandler($rootScope, error || object);
            }
        });
    }
});

function getPointer(object, className) {
    return {
        "__type": "Pointer",
        "className": object.className || className || '_User',
        "objectId": object.id || object.objectId || object
    };
}
app.controller('barterCtrl', function ($scope, $location, $rootScope, $routeParams, $sce) {
    $scope.result = null;
    $scope.milestones = [];
    var Barter = Parse.Object.extend("Barter");
    var query = new Parse.Query(Barter);
    query.include('seekCategory');
    query.include('offerCategory');
    query.include('user');
    query.include('barterUpUser');
    query.include('barterRequests.user');


    query.get($routeParams.id, {
        success: function (result) {
            $scope.result = result;
            $rootScope.title = "Enbarter | " + result.get("barterTitle");
            $rootScope.description = result.get("barterDescription");
            $rootScope.keywords = result.get("words").join(",");
            $scope.barterRequests = angularCopy((result.get('barterRequests')) ? result.get('barterRequests') : []);
            if ($location.hash() == 'qna') {
                $scope.initComments(function () {
                    $('#aQna').tab('show');
                    $("html, body").animate({scrollTop: $('#aQna').offset().top - 60}, 2000);
                });

            } else {
                $scope.$apply();
                hideSpinner();
            }

            if (Parse.User.current()) {
                var queryUser = new Parse.Query(Parse.User);
                queryUser.include('favors.favor');
                queryUser.get(Parse.User.current().id, {
                    success: function (user) {
                        $scope.currentUser = user;
                        $scope.$apply();
                    }
                });
            }
        },
        error: function (object, error) {
            if ($location.path().includes("/barter"))
                $location.path('/NotFound');
            $scope.$apply();
            hideSpinner();
        }
    });

    $scope.sameAccount = function () {
        if (Parse.User.current() && $scope.result && $scope.result.get('user').id == Parse.User.current().id)
            return true;
        return false;
    }

    $scope.disable = function () {
        var result = angularCopy($scope.result);
        if (result) {
            result.set("state", "disabled");
            showSpinner();
            result.save({
                success: function (results) {
                    $scope.result = results;
                    $scope.$apply();
                    hideSpinner();
                },
                error: function (object, error) {
                    errorHandler($rootScope, error || object);
                }
            });
        }
    }

    $scope.favorChange = function () {
        $('.hideFavor').toggle();
    };

    $scope.barterUpRequest = function () {
        if ((!$scope.milestones || !$scope.milestones.length) && !$scope.favor) {
            $rootScope.alertModal('Milestones are required!');
            return;
        }
        var milestones = [];
        for (var i = 0; i < $scope.milestones.length; i++) {
            milestones.push({checked: false, task: $scope.milestones[i]});
        }
        var request;
        if ($scope.favor) {
            request = {
                deadline: 0,
                user: Parse.User.current(),
                favor: getPointer($scope.currentUser.get('favors')[0].favor, 'Favor')
            };
        } else {
            request = {
                deadline: $scope.deadline || 0,
                milestone: milestones,
                user: Parse.User.current()
            };
        }
        var result = angularCopy($scope.result);
        var barterRequests = result.get('barterRequests');
        result.add("barterRequests", request);
        showSpinner();
        result.save({
            success: function (results) {
                var relation = Parse.User.current().relation("barterRequests");
                relation.add(results);
                Parse.User.current().save({
                    success: function () {
                        $scope.result = results;
                        $scope.barterRequests.push(angularCopy(request));
                        $scope.$apply();
                        hideSpinner();
                    },
                    error: function (object, error) {
                        errorHandler($rootScope, error || object);
                    }
                });
            },
            error: function (object, error) {
                errorHandler($rootScope, error || object);
                result.set('barterRequests', angularCopy(barterRequests));
                $scope.$apply();
            }
        });
    }

    $scope.bartered = function () {
        if ($scope.result) {
            var barterRequests = $scope.result.get('barterRequests');
            if (barterRequests)
                for (var i = 0; i < barterRequests.length; i++)
                    if (Parse.User.current() && barterRequests[i].user.id == Parse.User.current().id)
                        return true;
        }
        return false;
    }

    $scope.showMilestones = function (milestones, offer, index) {
        $scope.barterMilestones = angularCopy(milestones);
        $scope.milestonesOffer = offer;
        $scope.milestonesOfferIndex = index;
    }

    $scope.barterUpOwner = function (request, index) {
        var result = angularCopy($scope.result);

        var BarterDashboard = Parse.Object.extend("BarterDashboard");
        var barterDashboard = new BarterDashboard();
        barterDashboard.set("barterUpUser", getPointer(request.user));
        barterDashboard.set("barterUpMilestones", request.milestone);
        barterDashboard.set("barterUpDeadline", request.deadline);
        barterDashboard.set('user', result.get('user'));
        barterDashboard.set('barter', result);
        barterDashboard.set('offerMilestones', result.get('offerMilestones'));
        barterDashboard.set('offerDeadline', result.get('offerDeadline'));

        showSpinner();
        barterDashboard.save({
            success: function (results) {
                result.set("barterUpUser", getPointer(request.user));
                result.set("barterUpMilestones", request.milestone);
                result.set("barterUpDeadline", request.deadline);
                result.set("state", "bartered");
                result.set('barterDashboard', results);
                if (request.favor)
                    result.set('barterUpFavor', getPointer(request.favor, 'Favor'));

                result.save({
                    success: function (results) {
                        $scope.result = angularCopy(results);
                        $scope.barterRequests.splice(index, 1);
                        $scope.$apply();
                        hideSpinner();
                    },
                    error: function (object, error) {
                        errorHandler($rootScope, error || object);
                    }
                });
            }, error: function (object, error) {
                errorHandler($rootScope, error || object);
            }
        });


    }

    function reloadComments(callback) {
        var BarterComment = Parse.Object.extend("BarterComment");
        var query = new Parse.Query(BarterComment);
        query.equalTo("barter", angularCopy($scope.result));
        query.include('user');

        showSpinner();
        query.find({
            success: function (results) {
                var aCopy = angularCopy(results);
                for (var i = 0; i < aCopy.length; i++) {
                    if (aCopy[i].get('parent'))
                        aCopy[i].get('parent').addUnique('children', aCopy[i]);
                }
                $scope.comments = aCopy;
                $scope.$apply();
                hideSpinner();
                callback();
            },
            error: function (object, error) {
                $scope.$apply();
                errorHandler($rootScope, error || object);
            }
        });
    }

    $scope.initComments = function (callback) {
        if ($scope.comments)
            return;
        if ($scope.result.get('state') == 'new')
            $scope.commentsFlag = true;
        reloadComments(callback);
    }
    $scope.sendComment = function (parent) {
        if (!$(parent ? '#commentReply' : '#comment').summernote('code') || ($(parent ? '#commentReply' : '#comment').summernote('code').replace(/(<([^>]+)>)/ig, "").length == 0 && !$(parent ? '#commentReply' : '#comment').summernote('code').includes('img')))
            return;
        $scope.cantSend = true;
        var BarterComment = Parse.Object.extend("BarterComment");
        var barterComment = new BarterComment();
        barterComment.set('barter', getPointer($scope.result));
        barterComment.set('user', Parse.User.current());
        barterComment.set('comment', $(parent ? '#commentReply' : '#comment').summernote('code'));
        if (parent)
            barterComment.set('parent', getPointer(parent));

        showSpinner();
        barterComment.save({
            success: function (results) {
                $scope.cantSend = false;
                $($(parent ? '#commentReply' : '#comment')).summernote('code', '');
                reloadComments();
            },
            error: function (object, error) {
                $scope.cantSend = false;
                $scope.$apply();
                errorHandler($rootScope, error || object);
            }
        });
    }
    $scope.commentsFlag = false;

    $scope.setParentComment = function (comment) {
        $scope.parentComment = comment;
    }

    if (navigator.userAgent.match(/(Prerender)/) != null)
        $scope.initComments();
});


app.controller('indexCtrl', function ($scope, $location, $rootScope, $routeParams) {
    $scope.catSoft = "/browse/0NFJVql0U9";
    $scope.catWrite = "/browse/zSBhtFd8ZE";
    $scope.catMedia = "/browse/Wb8uqGgkdG";
    $scope.catData = "/browse/4TtjWA9W5e";
    $scope.catMarket = "/browse/7lY1lEwRny";
    $scope.catOther = "/browse/U8MCGz0C2B";
    $rootScope.title = 'Enbarter';
    $rootScope.description = "Enbarter is an online skill-exchange platform, driven by the oldest form of doing business: bartering. A barter is a system of exchange where goods or services are directly exchanged for other goods or services without an intermediary medium of exchange, mainly money.";
    $rootScope.keywords = "Enbarter,Barter,Bartering,Skills,Exchange,Entrepreneur,Service,Help,Direct,Professional,Free,Business";


    var query = new Parse.Query(Parse.Object.extend("Barter"));
    query.include('seekCategory');
    query.include('offerCategory');
    query.include('user');
    query.descending("createdAt");
    query.limit(5);

    query.find({
        success: function (results) {
            $scope.barters = results;
            $scope.$apply();
            hideSpinner();
        },
        error: function (object, error) {
            errorHandler($rootScope, error || object);
        }
    });
});

app.controller('barterDashboardCtrl', function ($scope, $location, $rootScope, $routeParams) {
    $scope.result = null;
    $scope.messages = [];
    $scope.offerMilestones = [];
    $scope.barterUpMilestones = [];
    var Barter = Parse.Object.extend("Barter");
    var Chat = Parse.Object.extend("BarterChat");
    var BarterDashboard = Parse.Object.extend("BarterDashboard");
    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        if (!$('#messageBox').is(":hover"))
            $("#messageBox").animate({scrollTop: document.getElementById('messageBox').scrollHeight}, 600);
    });
    $scope.reloadChat = function () {
        var query = new Parse.Query(Chat);
        query.include("user");
        query.equalTo("barter", getPointer($scope.result.get('barter')));

        query.find({
            success: function (results) {
                $scope.messages = results;
                $scope.$apply();
            },
            error: function (object, error) {
                errorHandler($rootScope, error || object);
            }
        });

        var subscription = query.subscribe();
        subscription.on('create', function (object) {
            $scope.messages.push(object);
            $scope.$apply();
            if (object.get('user').id != Parse.User.current().id)
                (new Audio('beeb.mp3')).play();
        });

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            subscription.unsubscribe();
        });
    };

    var query = new Parse.Query(BarterDashboard);
    query.include('barter');
    query.include('user');
    query.include('barterUpUser');
    query.equalTo("barter", getPointer($routeParams, 'Barter'));

    query.find({
        success: function (results) {
            if (results[0]) {
                result = results[0];
                if (!Parse.User.current() || !result.get('barterUpUser') || (Parse.User.current().id != result.get('user').id && Parse.User.current().id != result.get('barterUpUser').id)) {
                    // alert("Dashboard can't be accessed because there is no barter user");
                    window.location.href = "/barter/" + result.get('barter').id;
                    return;
                }

                $scope.result = result;
                $rootScope.title = "Enabrter | Dashboard";
                $scope.offerMilestones = angularCopy(result.get('offerMilestones'));
                $scope.barterUpMilestones = angularCopy(result.get('barterUpMilestones'));

                $scope.$apply();
                $scope.reloadChat();
                if ($scope.result.get('barter').get('state') != 'completed' && $scope.result.get('state') != 'completed') {
                    var subscription = query.subscribe();
                    if ($scope.result.get('user').id == Parse.User.current().id)
                        subscription.on('update', function (object) {
                            $scope.result = object;
                            $scope.barterUpMilestones = angularCopy(object.get('barterUpMilestones'));
                            $scope.$apply();
                        });
                    if ($scope.result.get('barterUpUser').id == Parse.User.current().id)
                        subscription.on('update', function (object) {
                            $scope.result = object;
                            $scope.offerMilestones = angularCopy(object.get('offerMilestones'));
                            $scope.$apply();
                        });
                    $rootScope.$on('$locationChangeStart', function (event, next, current) {
                        subscription.unsubscribe();
                    });
                }
                hideSpinner();
            } else {
                $location.path('/NotFound');
                $scope.$apply();
                hideSpinner();
            }
        },
        error: function (object, error) {
            if ($location.path().includes("/dashboard/barter"))
                $location.path('/NotFound');
            $scope.$apply();
            hideSpinner();
        }
    });

    $scope.sendMessage = function () {
        if ($scope.result.get('barter').get('state') != 'completed' && $scope.result.get('state') != 'completed') {
            $scope.cantSend = true;
            var chat = new Chat();
            chat.set("message", $scope.message);
            chat.set("user", Parse.User.current());
            chat.set("barter", getPointer($scope.result.get('barter')));
            chat.set("offerUser", $scope.result.get("user"));
            chat.set("barterUpUser", $scope.result.get("barterUpUser"));
            chat.save({
                success: function (results) {
                    $scope.message = "";
                    $scope.cantSend = false;
                    $scope.$apply();
                    $('#messageInput').focus();
                },
                error: function (object, error) {
                    $scope.cantSend = false;
                    $scope.$apply();
                    errorHandler($rootScope, error || object);
                }
            });
        }
    };
    $scope.checkParse = function (o, column) {
        $scope.checkParseColumn = column;
        $scope.checkParseObject = o;
        $('#milestoneCheck').modal();
    };

    $scope.check = function (o, column) {
        var result = angularCopy($scope.result);
        var arr = result.get(column);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].task == o.task && !arr[i].checked) {
                arr[i].checked = true;
                arr[i].date = new Date();
                arr[i].comment = $scope.comment;
                fileUploadControl = $("#formInput25675")[0];
                if (fileUploadControl.files.length > 0) {
                    var file = fileUploadControl.files[0];
                    var name = $("#formInput25675").val().substring(($("#formInput25675").val().indexOf('\\') >= 0 ? $("#formInput25675").val().lastIndexOf('\\') : $("#formInput25675").val().lastIndexOf('/')) + 1);
                    var parseFile = new Parse.File(name, file);
                    arr[i].file = parseFile;
                }
                break;
            }
        }
        result.set(column, arr);
        showSpinner();
        result.save({
            success: function (results) {
                $scope[column] = angularCopy(arr);
                $scope.result = results;
                $scope.comment = '';
                $("#formInput25675").val('');
                $scope.$apply();
                hideSpinner();
            },
            error: function (object, error) {
                errorHandler($rootScope, error || object);
            }
        });
    };

    $scope.closeAndRate = function () {
        var result = angularCopy($scope.result.get('barter'));
        var who = (Parse.User.current().id == result.get('user').id) ? "offer" : "barterUp";
        result.set(who + "Rate", $scope.rate);
        result.set(who + "Review", $scope.review);

        showSpinner();
        result.save({
            success: function (results) {
                hideSpinner();
            },
            error: function (object, error) {
                errorHandler($rootScope, error || object);
            }
        });
    };

    $scope.showClose = function (x) {
        if (x == 'favor') {

            if ($scope.result && $scope.result.get('barter') && Parse.User.current().id == $scope.result.get('barterUpUser').id && $scope.result.get('barter').get('offerFavor') && $scope.result.get('barterUpFinalPic') && !$scope.result.get('barter').get("barterUpRate"))
                return true;
            if ($scope.result && $scope.result.get('barter') && Parse.User.current().id == $scope.result.get('user').id && $scope.result.get('barter').get('barterUpFavor') && $scope.result.get('offerFinalPic') && !$scope.result.get('barter').get("offerRate"))
                return true;
            return false;
        }
        var oppisite = (x == 'offer') ? 'barterUp' : 'offer';
        if ($scope.result && ((x == 'offer' && Parse.User.current().id == $scope.result.get('user').id) || (x == 'barterUp' && Parse.User.current().id == $scope.result.get('barterUpUser').id) || ($scope.result.get('barter').get(oppisite + "Rate"))))
            return false;
        if ($scope.result && $scope.result.get(x + 'FinalPic'))
            return true;
        return false;
    }
    $scope.showFinalPic = function (x) {
        if ($scope.result && ((x == 'offer' && Parse.User.current().id != $scope.result.get('user').id) || (x == 'barterUp' && Parse.User.current().id != $scope.result.get('barterUpUser').id) ))
            return false;
        var arr = [];
        if ($scope.result)
            arr = $scope.result.get(x + 'Milestones') || [];

        for (var i = 0; i < arr.length; i++) {
            if (!arr[i].checked)
                return false;
        }
        if (arr.length && !$scope.result.get(x + 'FinalPic'))
            return true;
        return false;
    }

    $scope.finalPic = function (x) {
        fileUploadControl = $("#" + x + "FinalPic")[0];
        if (fileUploadControl.files.length == 0) {
            $rootScope.alertModal("You must attach a file!");
            return;
        }
        var result = angularCopy($scope.result);
        if (fileUploadControl.files.length > 0) {
            var file = fileUploadControl.files[0];
            var name = $("#" + x + "FinalPic").val().substring(($("#" + x + "FinalPic").val().indexOf('\\') >= 0 ? $("#" + x + "FinalPic").val().lastIndexOf('\\') : $("#" + x + "FinalPic").val().lastIndexOf('/')) + 1);
            var parseFile = new Parse.File(name, file);
            result.set(x + "FinalPic", parseFile);
        }
        showSpinner();
        result.save({
            success: function () {
                hideSpinner();
            }, error: function (object, error) {
                errorHandler($rootScope, error || object);
            }
        });
    }
    $scope.canCheck = function (x) {
        if (Parse.User.current().id == $scope.result.get(x).id)
            return true;
        return false;
    }
});

function profileWidget(id, $scope, path, callback, lite) {
    $scope.result = null;
    var query = new Parse.Query(Parse.User);
    if (!lite) {
        query.include("barterSeeks");
        query.include('barterSeeks.seekCategory');
        query.include('barterSeeks.offerCategory');
    }
    query.include('membership');
    query.include('favors.favor');

    query.get(id, {
        success: function (result) {
            $scope.result = result;
            var Barter = Parse.Object.extend("Barter");
            var barterQuery = new Parse.Query(Barter);
            barterQuery.equalTo("user", result);

            var barterQuery1 = new Parse.Query(Barter);
            barterQuery1.equalTo("barterUpUser", result);

            var mainQuery = Parse.Query.or(barterQuery, barterQuery1);
            mainQuery.include('seekCategory');
            mainQuery.include('offerCategory');
            mainQuery.include('barterUpUser');
            mainQuery.include('user');
            mainQuery.descending('updatedAt');
            mainQuery.find({
                success: function (results) {
                    $scope.barters = results;
                    var count = 0;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].get('state') == 'completed') count++;
                    }
                    $scope.completedBarters = count;
                    $scope.$apply();
                    callback(result);
                }, error: function () {
                    hideSpinner();
                }
            });
        },
        error: function (object, error) {
            if ($location.path().includes(path))
                $location.path('/NotFound');
            $scope.$apply();
            hideSpinner();
        }
    });
}

app.controller('showProfileCtrl', function ($scope, $location, $rootScope, $routeParams) {
    profileWidget(($routeParams.id) ? $routeParams.id : ((Parse.User.current()) ? Parse.User.current().id : null), $scope, "/profile", function (result) {
        $rootScope.title = "Enbarter | " + result.get('username');
        if ((Parse.User.current() && result.id == Parse.User.current().id) || !result.get('options') || result.get('options').requestsPublic) {
            var relationQuery = result.relation('barterRequests').query();
            relationQuery.include('seekCategory');
            relationQuery.include('offerCategory');
            relationQuery.find({
                success: function (results) {
                    $scope.barterRequests = results;
                    $scope.$apply();
                    hideSpinner();
                }, error: function () {
                    hideSpinner();
                }
            });
        } else {
            $scope.$apply();
            hideSpinner();
        }
    });
});

app.controller('editProfileCtrl', function ($scope, $location, $rootScope, $routeParams) {
    var id = Parse.User.current() ? Parse.User.current().id : null;
    if (!id) {
        $location.path('/');
        $scope.$apply();
    }
    profileWidget(id, $scope, "/profile/edit", function (result) {
        $scope.bio = result.get('bio');
        if (result.get('birthday')) {
            $scope.birthday = result.get('birthday').getFullYear().toString().paddingLeft("0000") + '-' + result.get('birthday').getMonth().toString().paddingLeft("00") + '-' + result.get('birthday').getDate().toString().paddingLeft("00");
        }
        $scope.skills = result.get('skills') ? result.get('skills') : [];
        $scope.workLinks = result.get('workLinks') ? result.get('workLinks') : [];
        $rootScope.title = "Enbarter | Edit: " + result.get('username');
        $scope.sendEmails = result.get('options') && result.get('options').sendEmails == false ? false : true;
        $scope.requestsPublic = result.get('options') && result.get('options').requestsPublic == false ? false : true;
        $scope.email = result.get('email');
        $scope.$apply();
        hideSpinner();
    }, true);

    $scope.submit = function () {
        $scope.cantSubmit = true;
        var result = angularCopy($scope.result);
        result.set("bio", $('#bioText').summernote('code'));
        if ($scope.birthday)
            result.set("birthday", new Date($scope.birthday));
        if ($scope.email)
            result.set("email", $scope.email);
        result.set("skills", $scope.skills);
        result.set("workLinks", $scope.workLinks);
        if ($scope.sendEmails == false || result.get('options') && result.get('options').sendEmails == false) {
            var options = result.get('options') || {};
            options.sendEmails = $scope.sendEmails;
            result.set("options", options);
        }
        if ($scope.requestsPublic == false || result.get('options') && result.get('options').requestsPublic == false) {
            var options = result.get('options') || {};
            options.requestsPublic = $scope.requestsPublic;
            result.set("options", options);
        }
        if ($("#exampleInputFile1")[0].files.length > 0) {
            var parseFile = new Parse.File("photo1.jpg", {base64: document.getElementById('avatarImg').src});
            result.set("pic", parseFile);
        }
        showSpinner();
        result.save({
            success: function (result) {
                location.reload();
                hideSpinner();
            }, error: function (object, error) {
                errorHandler($rootScope, error || object);
                $scope.cantSubmit = false;
                $scope.$apply();
            }
        });
    }

    $(document).ready(function () {
        $("#exampleInputFile1").change(function () {
            var filesToUpload = document.getElementById('exampleInputFile1').files;
            var file = filesToUpload[0];

            var img = document.createElement("img");
            var reader = new FileReader();
            reader.onload = function (e) {
                img.src = e.target.result;

                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                var MAX_WIDTH = 256;
                var MAX_HEIGHT = 256;
                var width = img.width;
                var height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                document.getElementById('avatarImg').src = canvas.toDataURL("image/png", 0.7);
            }
            reader.readAsDataURL(file);
        });
    });
});

app.controller('viewDashboardCtrl', function ($scope, $location, $rootScope, $routeParams) {
    var id = ($routeParams.id) ? $routeParams.id : ((Parse.User.current()) ? Parse.User.current().id : null);
    if (!id) {
        $location.path('/');
        $scope.$apply();
    }
    profileWidget(id, $scope, "/dashboard", function (results) {
        $rootScope.title = "Enbarter | Dashboard";
        $scope.$apply();
        hideSpinner();
    }, true);

    $scope.dashboardActive = function (barter) {
        if ((barter && barter.get('barterUpUser')) && (Parse.User.current().id == barter.get('user').id || Parse.User.current().id == barter.get('barterUpUser').id))
            return true;

        return false;
    }
});

app.controller('notificationsCtrl', function ($scope, $location, $rootScope, $routeParams) {
    if (!Parse.User.current()) {
        $location.path('/');
        $scope.$apply();
    }
    $rootScope.title = "Enbarter | Notifications";
    var Notification = Parse.Object.extend('Notification');

    if ($location.hash()) {
        var query = new Parse.Query(Notification);
        query.get($location.hash(), {
            success: function (result) {
                $rootScope.notificationCheck(result);
                $scope.$apply();
            },
            error: function (object, error) {
                loadNotification();
            }
        });
    } else
        loadNotification();
    function loadNotification() {
        profileWidget(Parse.User.current().id, $scope, '/notifications', function (result) {
            var query = new Parse.Query(Notification);
            query.descending("createdAt");
            query.equalTo("user", Parse.User.current());
            query.find({
                success: function (results) {
                    $scope.results = results;
                    $scope.$apply();
                    hideSpinner();
                },
                error: function (object, error) {
                    $location.path('/');
                    $scope.$apply();
                    hideSpinner();
                }
            });
        }, true);
    }
});

app.controller('pricesCtrl', function ($scope, $location, $rootScope, $routeParams) {
    $rootScope.title = 'Enbarter | Prices';
    function getUser() {
        showSpinner();
        var query = new Parse.Query(Parse.User);
        query.include('paymentInfo');
        query.get(Parse.User.current().id, {
            success: function (result) {
                $scope.user = result;
                $scope.$apply();
                hideSpinner();
            }, error: function () {
                hideSpinner();
            }
        });
    }

    var Membership = Parse.Object.extend("Membership");
    var query = new Parse.Query(Membership);
    query.find({
        success: function (memberships) {
            $scope.memberships = memberships;
            for (var i = 0; i < memberships.length; i++) {
                if (memberships[i].id == '42FyZkMdNq')
                    $scope.premuim = memberships[i];
            }
            if (Parse.User.current()) {
                getUser();
            } else {
                $scope.$apply();
                hideSpinner();
            }
        },
        error: function (object, error) {
            errorHandler($rootScope, error || object);
        }
    });

    function initPaddle(callback) {
        if (typeof Paddle === 'undefined') {
            showSpinner();
            $.ajax({
                type: "GET",
                url: "https://cdn.paddle.com/paddle/paddle.js",
                success: function () {
                    Paddle.Setup({
                        vendor: 17807,
                        completeDetails: true
                    });
                    hideSpinner();
                    callback();
                },
                dataType: "script",
                cache: true
            });
        } else {
            callback();
        }
    };
    $scope.buyNow = function (membership) {
        initPaddle(function () {
            var options = {
                product: membership.get('productId'),
                email: Parse.User.current().get('email'),
                passthrough: Parse.User.current().id,
                successCallback: function () {
                    getUser();
                    $rootScope.alertModal("Thank you for your payment, The payment may take up to 72 hours to be processed and appear in your account.");
                },
                disableLogout: true
            };
            if (Parse.User.current().get('membership') && Parse.User.current().get('membership').id == 'fQcewB3856' && membership.get('auth')) {
                options.trialDays = membership.get('period');
                options.price = membership.get('price');
                options.trialDaysAuth = membership.get('auth')[0];
                options.auth = membership.get('auth')[1];
                options.message = membership.get('name') + ", No Trial";
            }

            Paddle.Checkout.open(options);
        });
    };

    $scope.openOverride = function (override) {
        initPaddle(function () {
            Paddle.Checkout.open({
                override: override,
                successCallback: function () {
                    getUser();
                }
            });
        });
    };

    $scope.changeSubscription = function (membership) {
        showSpinner();
        Parse.Cloud.run('changeSubscription', {'membership': membership.id || membership.objectId || membership}, {
            success: function (result) {
                $rootScope.alertModal(result.result);
                hideSpinner();
            }, error: function (object, error) {
                errorHandler($rootScope, error || object);
            }
        });
    };
});

app.controller('messagesCtrl', function ($scope, $location, $rootScope, $routeParams) {
    if (!Parse.User.current()) {
        $location.path('/');
    }
    $rootScope.title = 'Enbarter | Messages';
    var MessageThread = Parse.Object.extend('MessageThread');
    var Message = Parse.Object.extend('Message');

    function loadMessages(result, callback) {
        var query = new Parse.Query(Message);
        query.equalTo("messageThread", result);
        query.include('to');
        query.include('user');
        query.include('messageThread');

        query.find({
            success: function (results) {
                $scope.messages = results;
                $scope.thread = result;
                $scope.$apply();
                callback();
            },
            error: function (object, error) {
                errorHandler($rootScope, error || object);
            }
        });
    }

    function loadThreads(callback) {
        var query = new Parse.Query(MessageThread);
        query.include('to');
        query.include('user');
        query.find({
            success: function (results) {
                $scope.threads = results;
                $scope.$apply();
                hideSpinner();
                if (results[0])
                    callback(results[0]);
            },
            error: function (object, error) {
                errorHandler($rootScope, error || object);
            }
        });
    };
    if ($routeParams.id) {
        var queryUser = new Parse.Query(Parse.User);
        queryUser.get($routeParams.id, {
            success: function (toUser) {
                var query1 = new Parse.Query(MessageThread);
                query1.equalTo("user", toUser);
                var query2 = new Parse.Query(MessageThread);
                query2.equalTo("to", toUser);
                var mainQuery = Parse.Query.or(query1, query2);
                mainQuery.include('to');
                mainQuery.include('user');
                mainQuery.find({
                    success: function (mainQueryResults) {
                        if (mainQueryResults[0]) {
                            loadMessages(mainQueryResults[0], loadThreads);
                        } else {
                            var messageThread = new MessageThread();

                            messageThread.set('to', toUser);
                            messageThread.set('user', Parse.User.current());
                            messageThread.save({
                                success: function (result) {
                                    loadMessages(result, loadThreads);
                                },
                                error: function (object, error) {
                                    errorHandler($rootScope, error || object);
                                }
                            });
                        }
                    },
                    error: function (object, error) {
                        $location.path('/messages');
                        $scope.$apply();
                        hideSpinner();
                    }
                });
            },
            error: function (object, error) {
                if ($location.path().includes('/messages'))
                    $location.path('/NotFound');
                $scope.$apply();
                hideSpinner();
            }
        });
    } else {
        loadThreads(function (result) {
            showSpinner();
            loadMessages(result, function () {
                hideSpinner();
            });
        });
    }

    $scope.sendMessage = function (parent) {
        if (!$('#message').summernote('code') || ($('#message').summernote('code').replace(/(<([^>]+)>)/ig, "").length == 0 && !$('#message').summernote('code').include('img')) || !$scope.subject)
            return;
        $scope.cantSend = true;
        var message = new Message();
        message.set('to', $scope.thread.get('user').id == Parse.User.current().id ? $scope.thread.get('to') : $scope.thread.get('user'));
        message.set('user', Parse.User.current());
        message.set('message', $('#message').summernote('code'));
        message.set('messageThread', $scope.thread);
        message.set('subject', $scope.subject);

        showSpinner();
        message.save({
            success: function (results) {
                loadMessages(results.get('messageThread'), function () {
                    $scope.cantSend = false;
                    $($('#message')).summernote('code', '');
                    $scope.subject = "";
                    $scope.$apply();
                    hideSpinner();
                });
            },
            error: function (object, error) {
                $scope.cantSend = false;
                $scope.$apply();
                errorHandler($rootScope, error || object);
            }
        });
    }
    $scope.commentsFlag = false;

    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        if (!$('#messageBox').is(":hover"))
            $("#messageBox").animate({scrollTop: document.getElementById('messageBox').scrollHeight}, 600);
    });
});


app.controller('notFoundCtrl', function ($scope, $location, $rootScope, $routeParams) {
    hideSpinner();
    $rootScope.title = 'Enbarter | Not Found';
    $rootScope.statusCode = 404;
});


function hideSpinner() {
    $('#divLoading').fadeOut(250, function () {
        $('#divLoading').removeClass('show');
    });
    window.prerenderReady = true;
}

var errorsMap = {
    100: 'It seems like you\'re offline, Please check your internet connection.'
};

function errorHandler($rootScope, error) {
    if (typeof error === 'undefined') error = {code: 100};
    if (error.code == 141 || errorsMap[error.code])
        message = errorsMap[error.code] || error.message;
    else if (error.message)
        message = "Error: " + error.code + " " + error.message;
    else
        message = "Error: " + error;
    hideSpinner();
    $rootScope.alertModal(message);
    if (error.code == 209) {
        alert("Logging out ...");
        Parse.User.logOut().then(function () {
            location.href = "/";
            location.reload();
        });
    }
}

function showSpinner() {
    $('#divLoading').fadeIn(250, function () {
        $('#divLoading').addClass('show');
    });
}

function toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.send();
}


function angularCopy(source) {
    function isWindow(obj) {
        return obj && obj.window === obj;
    }

    function isScope(obj) {
        return obj && obj.$evalAsync && obj.$watch;
    }

    function isBlankObject(value) {
        return value !== null && typeof value === 'object' && !getPrototypeOf(value);
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function setHashKey(obj, h) {
        if (h) {
            obj.$$hashKey = h;
        } else {
            delete obj.$$hashKey;
        }
    }

    var toString = Object.prototype.toString;
    var isArray = Array.isArray;
    var getPrototypeOf = Object.getPrototypeOf;
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    var stackSource = [];
    var stackDest = [];

    return copyElement(source);

    function copyRecurse(source, destination) {
        var h = destination.$$hashKey;
        var key;
        if (isArray(source)) {
            for (var i = 0, ii = source.length; i < ii; i++) {
                destination.push(copyElement(source[i]));
            }
        } else if (isBlankObject(source)) {
            for (key in source) {
                destination[key] = copyElement(source[key]);
            }
        } else if (source && typeof source.hasOwnProperty === 'function') {
            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    destination[key] = copyElement(source[key]);
                }
            }
        } else {
            for (key in source) {
                if (hasOwnProperty.call(source, key)) {
                    destination[key] = copyElement(source[key]);
                }
            }
        }
        setHashKey(destination, h);
        return destination;
    }

    function isObject(value) {
        return value !== null && typeof value === 'object';
    }

    function copyElement(source) {
        if (!isObject(source)) {
            return source;
        }
        var index = stackSource.indexOf(source);
        if (index !== -1) {
            return stackDest[index];
        }

        if (isWindow(source) || isScope(source)) {
            throw 'Can\'t copy! Making copies of Window or Scope instances is not supported.';
        }

        var needsRecurse = false;
        var destination = copyType(source);

        if (destination === undefined) {
            destination = isArray(source) ? [] : Object.create(getPrototypeOf(source));
            needsRecurse = true;
        }

        stackSource.push(source);
        stackDest.push(destination);

        return needsRecurse
            ? copyRecurse(source, destination)
            : destination;
    }

    function copyType(source) {
        switch (toString.call(source)) {
            case '[object Int8Array]':
            case '[object Int16Array]':
            case '[object Int32Array]':
            case '[object Float32Array]':
            case '[object Float64Array]':
            case '[object Uint8Array]':
            case '[object Uint8ClampedArray]':
            case '[object Uint16Array]':
            case '[object Uint32Array]':
                return new source.constructor(copyElement(source.buffer), source.byteOffset, source.length);

            case '[object ArrayBuffer]':
                if (!source.slice) {
                    var copied = new ArrayBuffer(source.byteLength);
                    new Uint8Array(copied).set(new Uint8Array(source));
                    return copied;
                }
                return source.slice(0);

            case '[object Boolean]':
            case '[object Number]':
            case '[object String]':
            case '[object Date]':
                return new source.constructor(source.valueOf());

            case '[object RegExp]':
                var re = new RegExp(source.source, source.toString().match(/[^/]*$/)[0]);
                re.lastIndex = source.lastIndex;
                return re;

            case '[object Blob]':
                return new source.constructor([source], {type: source.type});
        }

        if (isFunction(source.cloneNode)) {
            return source.cloneNode(true);
        }
    }
}


$(document).ready(function () {
    if (navigator.userAgent.match(/(Prerender)/) == null) {
        setTimeout(function () {
            $.ajax({
                type: "GET",
                url: "https://s7.addthis.com/js/300/addthis_widget.js",
                dataType: "script",
                success: function () {
                    addthis_config = {pubid: 'ra-584fd4d3f9f8431f'};
                    addthis.init();
                },
                cache: true
            });
            $.ajax({
                type: "GET",
                url: "https://www.google-analytics.com/analytics.js",
                dataType: "script",
                success: function () {
                    ga('create', 'UA-88019035-1', 'auto');
                    ga('send', 'pageview');
                },
                cache: true
            });
        }, 5000);

        if (navigator.userAgent.match(/(MSIE)/) != null) {
            hideSpinner();
            alert("You are now using enbarter in legacy mode, Kindly use enbarter a modern browser to enjoy the full experience!");
        }

        $(document).on("click", 'a[src^="http"]', function (e) {
            e.preventDefault();
            $("body").append('<div class="modal fade in" id="youtubeModal" tabindex="-1" role="dialog" aria-hidden="true" style="display: block"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-header">Preview <button type="button" class="close" onclick="$(\'#youtubeModal\').remove()">&times;</button> </div> <div class="modal-body"> <iframe frameborder="0" src="' + $(this).attr('src') + '" width="100%" height="315" allowfullscreen autoplay></iframe> </div> </div> </div> </div>');
        });
    }
});