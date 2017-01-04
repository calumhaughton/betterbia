angular.module('app.controllers').controller('helpCtrl', function ($scope, $ionicLoading, $timeout, EmailManager) {

    // send email, use as input $scope.MailData
    initMailData();
    $scope.sendMail = function () {
        // validate
        if ($scope.MailData.senderEmail && $scope.MailData.senderName && $scope.MailData.receiverEmail) {

            // send
            showMessage('Sending...');
            EmailManager.sendMail($scope.MailData).then(
              function (success) {
                  showMessage('Mail sent!', 1500);
                  initMailData();
              },
              function (error) {
                  console.log(error);
                  showMessage('Oooops... something went wrong', 1500);
              }
            );

        } else {

            // notify the user
            showMessage('Please fill in the required (*) fields', 2000);

        };
    };

    // init maildata
    function initMailData() {
        $scope.MailData = {
            senderName: "userName",//account name 
            senderEmail: "userEmail@gmail.com",// firebase data needed here ie user account email
            receiverEmail: "betterbia.app@gmail.com",
            html: "", // optionally, add html formatting
        };
    };

    // fn show loading dialog
    function showMessage(optMessage, optTime) {

        // prepare the dialog content
        var templateStr;
        if (optTime != undefined) { templateStr = optMessage };
        if (optMessage != undefined && optTime != undefined) {
            templateStr = optMessage;
        } else if (optMessage != undefined && optTime == undefined) {
            templateStr = optMessage + '<br><br>' + '<ion-spinner icon="dots"></ion-spinner>';
        } else {
            templateStr = '<ion-spinner icon="dots"></ion-spinner>';
        };

        // prompt
        $ionicLoading.show({
            template: templateStr
        });

        // hide if input provided
        if (optTime != undefined) {
            $timeout(function () {
                $ionicLoading.hide();
            }, optTime)
        };

    };

})

.factory('EmailManager', function ($q, $http) {
    var self = this;

    /**
    * Send Email
    * @mailObj: object with properties
    *      'senderName'
    *      'senderEmail'
    *      'receiverEmail'
    *      'subject'
    *      'html'
    */
    self.sendMail = function (mailObj) {
        var qSend = $q.defer();
        $http.post(SERVER_SIDE_URL + "/email/send", mailObj)
        .success(
          function (response) {
              qSend.resolve(response)
          }
        )
        .error(
          function (error) {
              qSend.reject(error);
          }
        );
        return qSend.promise;
    };

    return self;
})