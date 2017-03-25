(function () {
    'use strict';

    angular
        .module('app.pages.profile')
        .controller('ProfileController', ProfileController);

    /** @ngInject */
    function ProfileController(Timeline, About, Barters, Followers, $mdDialog, $rootScope) {
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
                }
            })
        }
        vm.sendPost = function () {
            var Post = Parse.Object.extend("Post");
            var post = new Post();
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

        vm.sendComment = function (index) {
            var PostComment = Parse.Object.extend("PostComment");
            var comment = new PostComment();
            comment.set('post', vm.posts[index]);
            comment.set('message', vm.comment[index]);
            comment.set('user', Parse.User.current());
            comment.save({
                success: function (comment) {
                    vm.comment[index] = "";
                    if (!vm.posts[index].comments) vm.posts[index].comments = [];
                    vm.posts[index].comments.push(comment);
                },
                error: function (error) {
                    $rootScope.alertModal(error.message, "Error");
                }
            });
        }
        vm.like = function (index) {
            var PostLike = Parse.Object.extend("PostLike");
            var like = new PostLike();
            like.set('post', vm.posts[index]);
            like.set('user', Parse.User.current());
            like.save({
                success: function (like) {
                    if (!vm.posts[index].likes) vm.posts[index].likes = 0;
                    vm.posts[index].likes++;
                    vm.posts[index].like = like;
                },
                error: function (error) {
                    $rootScope.alertModal(error.message, "Error");
                }
            });
        }
        vm.unlike = function (index) {
            var like = vm.posts[index].like;
            like.destroy({
                success: function (like) {
                    delete  vm.posts[index].like;
                    if (vm.posts[index].likes > 0)
                        vm.posts[index].likes--;
                },
                error: function (error) {
                    $rootScope.alertModal(error.message, "Error");
                }
            });
        }
        function retrievePost(index) {
            var PostComment = Parse.Object.extend("PostComment");
            var commentQuery = new Parse.Query(PostComment);
            commentQuery.equalTo("post", vm.posts[index]);
            commentQuery.include('user');
            commentQuery.find({
                success: function (comments) {
                    if (!vm.posts[index].comments) vm.posts[index].comments = [];
                    vm.posts[index].comments = comments;
                },
                error: function (error) {
                    $rootScope.alertModal(error.message, "Error");
                }
            });

            var PostLike = Parse.Object.extend("PostLike");
            var likeQuery = new Parse.Query(PostLike);
            likeQuery.equalTo("post", vm.posts[index]);
            likeQuery.equalTo("user", Parse.User.current());
            likeQuery.first({
                success: function (like) {
                    if (!vm.posts[index].likes) vm.posts[index].likes = 1;
                    vm.posts[index].like = like;
                },
                error: function (error) {
                    $rootScope.alertModal(error.message, "Error");
                }
            });

            var likesQuery = new Parse.Query(PostLike);
            likesQuery.equalTo("post", vm.posts[index]);
            likesQuery.count({
                success: function (likes) {
                    vm.posts[index].likes = likes;
                },
                error: function (error) {
                    $rootScope.alertModal(error.message, "Error");
                }
            });
        }

        for (var index in vm.posts) {
            retrievePost(index);
        }

        vm.deletePost = function (index) {
            var post = vm.posts[index];
            post.destroy({
                success: function (post) {
                    vm.posts.splice(index, 1);
                },
                error: function (error) {
                    $rootScope.alertModal(error.message, "Error");
                }
            });
        }
    }

})();
