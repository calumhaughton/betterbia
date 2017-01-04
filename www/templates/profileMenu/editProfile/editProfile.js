angular.module('app.controllers').controller('editProfileCtrl', function ($firebaseObject, $scope, $state, $ionicActionSheet, $localStorage, $cordovaCamera, $cordovaFile, $cordovaImagePicker, $ionicActionSheet, $rootScope) {

    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        // Load user details before page
        StatusBar.backgroundColorByHexString("#5b800d");
        $scope.username = $localStorage.username;
        $scope.imageURL = $localStorage.imageURL;
        $scope.email = $localStorage.email;
    });

    $scope.getPictureFromDevice = function (options) {
        $cordovaCamera.getPicture(options).then(function (imageData) {
            // Create Firebase storage reference using account id
            var imageName = $localStorage.accountId + '.jpg'
            var storageRef = firebase.storage().ref('profilers/' + imageName);

            // Get the file from its URI and convert it to a Blob
            var getFileBlob = function (url, cb) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.addEventListener('load', function () {
                    cb(xhr.response);
                });
                xhr.send();
            };

            var blobToFile = function (blob, name) {
                blob.lastModifiedDate = new Date();
                blob.name = name;
                return blob;
            };

            var getFileObject = function (filePathOrUrl, cb) {
                getFileBlob(filePathOrUrl, function (blob) {
                    cb(blobToFile(blob, imageName));
                });
            };

            getFileObject(imageData, function (fileObject) {
                // Upload the Blob to Firebase
                var uploadTask = storageRef.put(fileObject);

                uploadTask.on('state_changed', function (snapshot) {
                }, function (error) {
                    console.log(JSON.stringify(error));
                }, function () {
                    // Get the downloadURL of the image, and save it to the user's account details
                    var downloadURL = uploadTask.snapshot.downloadURL;
                    var thisAccount = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId));

                    thisAccount.$loaded().then(function () {
                        thisAccount.imageURL = downloadURL;
                        thisAccount.$save();

                        $scope.imageURL = downloadURL;
                        $localStorage.imageURL = downloadURL;

                    });
                });
            });

        }, function (err) {
            // An error occured. Show a message to the user
        });
    }

    // Take a photo using the phone's camera
    $scope.takePhoto = function () {
        var options = {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $scope.getPictureFromDevice(options);
        
    }

    // Pull an existing photo from the Gallery
    $scope.photoFromGallery = function () {
        var options = {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $scope.getPictureFromDevice(options);
    }

    // Displays an action sheet at the bottom of the screen for user input
    $scope.changeProfilePhoto = function () {

        $scope.hideSheet = $ionicActionSheet.show({


            buttons: [
              { text: "<h6>Take a New Photo</h6>" },
              { text: '<h6>Photo from Gallery</h6>' },
            ],
            titleText: 'Change Profile Photo ',
            cancelText: 'Cancel',



            buttonClicked: function (index) {
                $scope.hideSheet();

                if (index == 0) {
                    $scope.takePhoto();
                }
                else {
                    $scope.photoFromGallery();
                }

            },

        });
    };

})