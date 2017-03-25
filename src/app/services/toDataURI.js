(function () {
    'use strict';

    angular
        .module('fuse')
        .factory('toDataURI', toDataURI);

    /** @ngInject */
    function toDataURI() {
        var service = {
            convert: function (url, callback) {
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
        };

        return service;


    }
}());