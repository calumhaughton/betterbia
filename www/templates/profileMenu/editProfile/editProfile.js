angular.module('app.controllers').controller('editProfileCtrl', function ($scope, $state, $ionicActionSheet, $localStorage, $cordovaCamera, $cordovaFile, $cordovaImagePicker, $ionicActionSheet, $rootScope) {


  
    $scope.changeProfilePhoto= function () {

        $scope.hideSheet = $ionicActionSheet.show({
           

            buttons: [
              { text: 'Take photo' },
              { text: 'Photo from Gallery' },
            ],
            titleText: 'Change Profile Photo ',
            cancelText: 'Cancel',

          

            buttonClicked: function (index) {
                $scope.hideSheet();
                ;
                

                if (index == 0) {
                    var options = {
                        quality: 75,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        allowEdit: true,
                        encodingType: Camera.EncodingType.JPEG,
                        targetWidth: 300,
                        targetHeight: 300,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: false
                    };

                    $cordovaCamera.getPicture(options).then(function (imageData) {
                        $rootScope.imgURI = "data:image/jpeg;base64," + imageData;
                    }, function (err) {
                        // An error occured. Show a message to the user
                    });

                }
                else {
                    var options = {
                        quality: 75,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                        allowEdit: true,
                        encodingType: Camera.EncodingType.JPEG,
                        targetWidth: 300,
                        targetHeight: 300,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: false
                    };

                    $cordovaCamera.getPicture(options).then(function (imageData) {
                        $rootScope.imgURI = "data:image/jpeg;base64," + imageData;
                    }, function (err) {
                        // An error occured. Show a message to the user
                    });

                }

            },
          
        });
    };















})