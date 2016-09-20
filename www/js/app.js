// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
'Use Strict';

// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic','ngCordova', 'firebase', 'ngStorage', 'ngCordovaOauth', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ion-floating-menu', 'timer', 'rzModule', 'ngAnimate', 'ngMessages', 'angular-svg-round-progressbar'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (cordova.plugins.Keyboard.hideKeyboardAccessoryBar) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        //update the color of the android notification bar
        //if (window.StatusBar) {
        //    if (ionic.Platform.isAndroid()) {
        //        StatusBar.backgroundColorByHexString("#272727");
        //    } else {
        //        StatusBar.styleLightContent();
        //    }
        //}
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady() {
            console.log(StatusBar);
            StatusBar.backgroundColorByHexString("#272727");
        }
    });
})


  .factory('Firebase', function ($firebaseArray, $firebaseObject) {
      var ref = firebase.database().ref();
      return {
          all: function (section) {
              var data = $firebaseArray(ref.child(section));
              return data;
          },
          getById: function (section, id) {
              var data = $firebaseObject(ref.child(section).child(id));
              return data;
          },
          get: function (section, field, value) {
              var data = $firebaseArray(ref.child(section).orderByChild(field).equalTo(value));
              return data;
          }
      };
  });