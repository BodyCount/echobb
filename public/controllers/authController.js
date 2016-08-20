angular
  .module('wuutApp')
  .controller('AuthController', 
  function($scope, $state, $uibModalInstance, $stateParams, $timeout, httpFactory, socketFactory, authFactory)
  {
    socketFactory.emit('main:auth');

    $scope.createUser = function(user)
    {
      $scope.isLoadingReg = true;
      httpFactory.post.createUser(user).success(function(response){
        $timeout(function()
        {
          $scope.isLoadingReg = false;
          if (response.error){
            $scope.error = response.error
            $scope.info = null;
          }
          if (response.message){
            $scope.error = null;
            $scope.info = response.message;     
          }          
        }, 1000);
      });
    }
    
    $scope.authUser = function (user) 
    {
      $scope.isLoadingLogin = true;
      httpFactory.post.authUser(user).success(function(response){
        $timeout(function()
        {
          $scope.isLoadingLogin = false;
          if (response.error){
            $scope.error = response.error
            $scope.info = null;
          }
          if (response.username){
            $scope.error = null;
            $scope.info = 'Login successful';
            socketFactory.reconnectSocket();
            authFactory.setUserIdentity(response);
            authFactory.setAuth();

            $timeout(function(){$scope.close();}, 1200);    
          }
        }, 1000);

      });
    }

    $scope.close = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.$on('$destroy', function (event) 
    {
      socketFactory.removeAllListeners();
    });

  });


  /*

  */  
      /*
    $scope.createUser = function (user) 
    {
      socketFactory.emit('auth:createUser', user);
    };

        {
      socketFactory.emit('auth:authUser', user);
    };
*/    /*
    socketFactory.on('auth:success', function(successMessage)
    {
      $scope.error = null;
      $scope.info = successMessage;
    });

    socketFactory.on('auth:authSuccess', function(username)
    {
      $scope.info = 'Login successful';
      authFactory.setUserIdentity(username);
      authFactory.setAuth();
      $timeout(function(){$scope.showValue = false;}, 1200);
    });

    socketFactory.on('auth:error', function(error)
    {
      $scope.info = null;
      $scope.error = error;
    });
    */