angular
    .module("app.controllers")

    /**
     * @module editProfileCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the edit profile view.
     */
    .controller("editProfileCtrl", ["$scope", "$rootScope", "sharedProps",
        "$state", "UserService", "$ionicLoading", "$window", "$ionicHistory",
        function ($scope, $rootScope, sharedProps, $state, UserService, $ionicLoading, $window, $ionicHistory) {
            var data = {};
            var username = "";
            $scope.input = {};
            init();

            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.editProfileCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
                if (sharedProps.getData("isNightmode") != undefined)
                    $scope.isNightmode = sharedProps.getData("isNightmode").value;
                getFontSize();
            });

            /**
             * @function
             * @memberof controllerjs.editProfileCtrl
             * @description This function is responsible for retrieving the selected font size from the 
             * shared properties space and set the value into scope variables in order to be used in 
             * the page and set the page's font size.
             */
            function getFontSize() {
                //font size for normal letters
                $scope.fontsize = { 'font-size': data.fontsize + '%' }
                //font size for smaller letters than the normal ones
                $scope.fontsizeSmaller = { 'font-size': (data.fontsize - 20) + '%' }
            }

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description This function is responsible for retrieving the class used in the background
              * in order to set the background to nightmode/lightmode.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description This function is responsible for updating all the stored values in the local
              * storage with the new username.
              */
            function UpdateStorage() {
                var usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));
                var usersDeletedArticles = JSON.parse($window.localStorage.getItem("usersDeletedArticles"));
                var usersSources = JSON.parse($window.localStorage.getItem("usersSources"));
                var usersArticleCache = JSON.parse($window.localStorage.getItem("usersArticleCache"));
                var usersSavedArticles = JSON.parse($window.localStorage.getItem("usersSavedArticles"));

                usersSettings.forEach(el => {
                    if (el.username == username)
                        el.username = $scope.editedUser.username;
                });
                usersDeletedArticles.forEach(el => {
                    if (el.username == username)
                        el.username = $scope.editedUser.username;
                });
                usersSources.forEach(el => {
                    if (el.username == username)
                        el.username = $scope.editedUser.username;
                });
                usersArticleCache.forEach(el => {
                    if (el.username == username)
                        el.username = $scope.editedUser.username;
                });
                usersSavedArticles.forEach(el => {
                    if (el.username == username)
                        el.username = $scope.editedUser.username;
                });

                $window.localStorage.setItem("usersSettings", JSON.stringify(usersSettings));
                $window.localStorage.setItem("usersDeletedArticles", JSON.stringify(usersDeletedArticles));
                $window.localStorage.setItem("usersSources", JSON.stringify(usersSources));
                $window.localStorage.setItem("usersArticleCache", JSON.stringify(usersArticleCache));
                $window.localStorage.setItem("usersSavedArticles", JSON.stringify(usersSavedArticles));

            }

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description This function is responsible for sending the new values of the newly edited profile 
              * to be saved in the device's local storage, broadcasts the new username value for the sidemenu to 
              * get and display and changes from the current page to the profile page.
              */
            $scope.editProfile = function () {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner><p>Saving changes...</p>',
                });
                if (username != $scope.editedUser.username){
                    for (let i = 0; i < users.length; i++) {
                        if (users[i].username == $scope.editedUser.username) {
                            $scope.input.usernameTaken = true;
                            break;
                        } else {
                            $scope.input.usernameTaken = false;
                        }
                    }
                } else {
                    $scope.input.usernameTaken = false;
                }

                if (!$scope.input.usernameTaken) {
                    UpdateStorage();
                    UserService.Update($scope.editedUser).then(function (response) {
                        if (response.success) {
                            $rootScope.$broadcast("usernameChange", $scope.editedUser.username);
                            $state.go("eyeReader.profile");
                        } else {
                            var promptAlert = $ionicPopup.show({
                                title: "Error",
                                template: "<span>Failed to update user's profile!</span>",
                                buttons: [{
                                    text: "Retry",
                                    type: "button-positive",
                                    onTap: function (e) { }
                                }]
                            });
                        }
                    });
                }

                $ionicLoading.hide();
            }

            $scope.goBack = function () {
                $ionicHistory.goBack();
            };

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description This function is responsible for calling all the functions that need to 
              * be executed when the page is initialized.
              */
            function init() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner><p>Loading profile...</p>',
                });

                users = JSON.parse($window.localStorage.getItem("users"));

                //sets the value of the user's sex based on their decision
                $scope.sexOptions = [
                    { name: "Female", id: 0 },
                    { name: "Male", id: 1 },
                    { name: "Other", id: 2 }
                ];
                $scope.user = $rootScope.activeUser;
                username = $scope.user.username;
                //creates a new objects with the current user details
                $scope.editedUser = $scope.user;
                $scope.selectedSex = $scope.editedUser.sex;
                $scope.editedUser.birthday = new Date($scope.editedUser.birthday);

                var usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));

                var currentUserSettings = _.find(usersSettings, function (userSettings) {
                    return userSettings.username == $rootScope.activeUser.username;
                });

                data = {
                    cachenewsEnabled: currentUserSettings.settings.cachenewsEnabled,
                    fontsize: currentUserSettings.settings.fontsize,
                    markupEnabled: currentUserSettings.settings.markupEnabled,
                    hideEnabled: currentUserSettings.settings.hideEnabled,
                    tolerance: currentUserSettings.settings.tolerance,
                };

                $ionicLoading.hide();
            }
        }
    ])