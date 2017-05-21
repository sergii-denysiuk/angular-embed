(function() {
    'use strict';

    angular.module('embedApp', ['ngSanitize'])
        .controller('EmbedController', EmbedController);

    EmbedController.$inject = ['$scope'];

    function EmbedController($scope) {
        $scope.limitPreviews = 3;
        $scope.debounce = 2000;
        $scope.animateLimiting = 2000;

        $scope.inputText =
            "https://codepen.io/TrentWalton/pen/eyaDr " +
            "https://jsfiddle.net/blazeeboy/fNPvf/ " +
            "http://jsbin.com/oyigap/4/edit?html,output " +
            "http://plnkr.co/edit/N6lrSRhKzEP3xy25EKSx?p=preview " +
            "http://ideone.com/zfQ76p " +

            "https://www.w3schools.com/css/trolltunga.jpg " +
            "http://www.pdf995.com/samples/pdf.pdf " +

            "http://www.html5tutorial.info/media/vincent.mp3 " +
            "https://soundcloud.com/ul-ali/pink-floyd-wish-you-were-here " +

            "https://www.twitch.tv/gohamedia " +
            "https://www.ted.com/talks/brian_cox_why_we_need_the_explorers " +
            "https://dotsub.com/view/8459bcef-6404-4965-8025-dc875d946cb5 " +
            "https://www.liveleak.com/view?i=d2a_1495043187 " +
            "https://www.w3schools.com/html/mov_bbb.mp4 " +
            "https://www.youtube.com/watch?v=IXdNnw99-Ic " +
            "https://www.youtube.com/watch?v=IXdNnw99-Ic";
    }
})();
