'Use Strict';
angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
      .state('tabsMaster', {
          url: '/tabsMaster',
          templateUrl: 'templates/tabs/tabsMaster.html',
          controller:'masterCtrl'
      })

      .state('listDetail', {
          url: '/listDetail',
          templateUrl: 'templates/shoppingList/listDetail/listDetail.html',
          controller: 'listDetailCtrl'
      })



      .state('recipeDetail', {
        url: '/recipeDetail',
        templateUrl: 'templates/recipeDetail/recipeDetail.html',
        controller: 'recipeDetailCtrl'
      })

      .state('recipeSteps', {
        url: '/recipeSteps',
        templateUrl: 'templates/recipeSteps/recipeSteps.html',
        controller: 'recipeStepsCtrl'
      })

      .state('login', {
        url: '/login',
        templateUrl: 'templates/login/login.html',
        controller: 'loginCtrl'
      })

       .state('completeAccount', {
         url: '/completeAccount',
         templateUrl: 'templates/completeAccount/completeAccount.html',
         controller: 'completeAccountCtrl'
      })

        .state('editProfile', {
            url: '/editProfile',
            templateUrl: 'templates/profileMenu/editProfile/editProfile.html',
            controller:'editProfileCtrl'
        })

        .state('help', {
            url: '/help',
            templateUrl: 'templates/profileMenu/help/help.html',
            controller: 'helpCtrl'
        })

        .state('privacyPolicy', {
            url: '/privacyPolicy',
            templateUrl: 'templates/profileMenu/privacyPolicy/privacyPolicy.html',
            controller: 'privacyPolicyCtrl'
        })

    $urlRouterProvider.otherwise('/login')

});