'Use Strict';
// Email Management System
var SERVER_SIDE_URL = "https://betterbiaemail.herokuapp.com";


// App dependencies
angular.module('app', ['ionic', 'ngCordova', 'firebase', 'ngStorage', 'ngCordovaOauth', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ion-floating-menu', 'timer', 'rzModule', 'ngAnimate', 'ngMessages', 'angular-svg-round-progressbar', 'ionic-native-transitions', 'xeditable'])

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

        //update the color of the android notification bar, and lock the orientation of the device
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady() {
            StatusBar.backgroundColorByHexString("#272727");
            screen.lockOrientation('portrait');
        }
    });
})

// Service used to access Firebase throughout the login workflow
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
  })

// Manages Ionic Native Transitions
.config(function ($ionicNativeTransitionsProvider) {

    $ionicNativeTransitionsProvider.setDefaultOptions({
        duration: 300,
        slowdownfactor: 4,
        iosdelay: -1,
        androiddelay: -1,
        winphonedelay: -1,
        fixedPixelsTop: 0,
        fixedPixelsBottom: 0,
        triggerTransitionEvent: '$ionicView.afterEnter',
        backInOppositeDirection: false
    });

    $ionicNativeTransitionsProvider.setDefaultTransition({
        type: 'slide',
        direction: 'left'
    });

    $ionicNativeTransitionsProvider.setDefaultBackTransition({
        type: 'slide',
        direction: 'right'
    });

})

// Cancels Javascript scrolling, in favour of Native scrolling
.config(function ($ionicConfigProvider) {
    $ionicConfigProvider.scrolling.jsScrolling(false);
})
;