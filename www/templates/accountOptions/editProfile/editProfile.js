angular.module('app.controllers').controller('editProfileCtrl', function ($scope, $state, $ionicActionSheet, $localStorage, $cordovaCamera, $cordovaFile) {



    $scope.images = [];

    $scope.addMedia = function () {
        $scope.hideSheet = $ionicActionSheet.show({
            buttons: [
	        	{ text: 'Take photo' },
	        	{ text: 'Photo from library' }
            ],
            titleText: 'Add images',
            cancelText: 'Cancel',
            buttonClicked: function (index) {
                $scope.hideSheet();

                if (index == 0) {
                    var options = {
                        destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        targetWidth: 600,
                        targetHeight: 100,
                        quality: 100
                    };

                    $cordovaCamera.getPicture(options).then(function (imageUrl) {
                        $scope.images.push(imageUrl);
                    });

                } else {
                    var options = {
                        maximumImagesCount: 10,
                        width: 800,
                        height: 800,
                        quality: 80
                    };

                    $cordovaImagePicker.getPictures(options)
					    .then(function (results) {
					        for (var i = 0; i < results.length; i++) {
					            $scope.images.push(results[i]);
					            console.log(results[i]);
					        }
					    }, function (err) {
					        console.log(err);
					    });
                }
            }
        });
    }

})