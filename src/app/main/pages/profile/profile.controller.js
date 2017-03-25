(function () {
    'use strict';

    angular
        .module('app.pages.profile')
        .controller('ProfileController', ProfileController);

    /** @ngInject */
    function ProfileController(Timeline, About, Barters, Followers) {
        var vm = this;

        // Data
        vm.posts = Timeline;
        vm.activities = Timeline;
        vm.about = About;
        vm.barters = Barters;
        vm.followers = Followers;
        var count = 0;
        for (var i = 0; i < Barters.length; i++) {
            if (Barters[i].get('state') == 'completed') count++;
        }
        vm.completedBarters = count;

        if (!About.get('options') || About.get('options').requestsPublic != false) {
            About.get('barterRequests').query().include('seekCategory,offerCategory,barterUpUser,user').find({
                success: function (barterRequests) {
                    vm.barterRequests = barterRequests;
                    console.log(barterRequests);
                }
            })
        }
        vm.sendPost = function () {
            var UserPost = Parse.Object.extend("UserPost");
            var post = new UserPost();
            post.set('user', vm.about);
            post.set('message', vm.message);
            post.set('type', 'post');
            post.set('creator', Parse.User.current());
            post.save({
                success: function (post) {
                    vm.message = "";
                    vm.posts.unshift(post);
                },
                error: function (error) {
                    $rootScope.alertModal(error.message, "Error");
                }
            });
        }

        vm.follow = function () {
            var UserFollow = Parse.Object.extend("UserFollow");
            var userFollow = new UserFollow();
            userFollow.set('to', vm.about);
            userFollow.set('from', Parse.User.current());
            userFollow.save({
                success: function (userFollow) {
                    vm.followers.unshift(userFollow);
                },
                error: function (error) {
                    $rootScope.alertModal(error.message, "Error");
                }
            });
        };

        vm.unFollow = function () {
            var index = vm.isFollowing();
            var following = vm.followers[index];
            following.destroy({
                success: function (userFollow) {
                    vm.followers.splice(index, 1);
                },
                error: function (error) {
                    $rootScope.alertModal(error.message, "Error");
                }
            });
        };

        vm.isFollowing = function () {
            for (var i in vm.followers) {
                if (vm.followers[i].get('from').id == Parse.User.current().id)
                    return i;
            }
            return false;
        }

        console.log(About);
        console.log(Barters);
    }

})();
