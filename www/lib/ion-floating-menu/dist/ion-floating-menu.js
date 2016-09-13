/*!
 * Copyright 2016 PREGIOTEK
 * http://pregiotek.com/
 *
 * ion-floating-menu
 * Material UI-like Floating Action Button and Menu for Ionic applications.
 *
 * By @ennedigi
 * 
 * Licensed under the MIT license. Please see LICENSE for more information.
 *
 */


angular.module('ion-floating-menu', [])

        .directive('ionFloatingMenu', function (ingTypeStore) {

            return {
                restrict: 'E',
                scope: {
                    menuOpenColor: '@?',
                    menuOpenIcon: '@?',
                    menuOpenIconColor: '@?',
                    menuColor: '@?',
                    menuIcon: '@?',
                    menuIconColor: '@?',
                    hasFooter: '=?'
                },
                template: '<ul id="floating-menu"  \n\
                            ng-style="{\'bottom\' : \'{{bottomValue}}\'}" \n\
                            ng-class="{\'active\' : isOpen}" \n\
                            ng-click="open()">' +
                        '<div ng-transclude></div>' +
                        '<span><li class="menu-button green">' +
                        '<img class="menu-button-image-placer" ng-src="img/ing-select/{{ingValue}}.svg"/>' +
                        '</li></span>' +
                        '</ul>',
                replace: true,
                transclude: true,
                link: function (scope, element, attrs, ctrl, transclude)
                {
                    element.find('div').replaceWith(transclude());
                },
                controller: function ($scope) {
                    $scope.ingValue = ingTypeStore.getType();

                    $scope.isOpen = false;
                    $scope.open = function () {
                        $scope.isOpen = !$scope.isOpen;
                        if ($scope.isOpen) {
                            $scope.setOpen();
                        } else {
                            $scope.setClose();
                        }
                    };
                    $scope.setOpen = function () {
                        $scope.buttonColor = menuOpenColor;
                    };
                    $scope.setClose = function () {
                        $scope.buttonColor = menuColor;
                        $scope.ingValue = ingTypeStore.getType();
                    };
                    var menuColor = $scope.menuColor || '#6fa724';
                    var menuIcon = $scope.menuIcon || 'ion-plus';
                    var menuIconColor = $scope.menuIconColor || '#fff';
                    var menuOpenColor = $scope.menuOpenColor || '#6fa724';
                    var menuOpenIcon = $scope.menuOpenIcon || 'ion-minus';
                    var menuOpenIconColor = $scope.menuOpenIconColor || '#fff';
                    $scope.setClose();
                    //Has a footer
                    $scope.hasFooter = $scope.hasFooter || false;
                    if ($scope.hasFooter) {
                        $scope.bottomValue = '60px';
                    } else {
                        $scope.bottomValue = '20px';
                    }
                }
            };
        })
        .directive('ionFloatingItem', function (ingTypeStore) {

            return {
                restrict: 'E',
                require: ['^ionFloatingMenu'],
                scope: {
                    value:'@',
                    click: '&?',
                    icon: '@',
                    buttonColor: '@?',
                    buttonClass: '@?',
                    iconColor: '@?',
                    text: '@?',
                    textClass: '@?'},
                template:
                        '<li ng-click="selectIngredient(value)" ng-class="buttonClass">' +
                        '<img ng-src="img/ing-select/{{value}}-grey.svg">' +
                        '</li>',
                replace: true,
                controller: function ($scope, $log) {
                    $scope.buttonColor = $scope.buttonColor || '#6fa724';
                    $scope.iconColor = $scope.iconColor || '#fff';
                    $scope.selectIngredient = function (newType) {
                        ingTypeStore.setType(newType);
                    };
                }
            };
        });
