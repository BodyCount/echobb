angular
	.module('wuutApp')
	.controller('ProfileController', 
  function($scope, $uibModalInstance, $stateParams, $timeout, authFactory, httpFactory, socketFactory)
	{

    if (!$stateParams.profile) return;

    $scope.loading = true;
		$scope.username = $stateParams.profile;

    if ($scope.username === authFactory.getUserIdentity().username)
      $scope.thisUser = true;

    if ($scope.thisUser && authFactory.getUserIdentity().permission == 2)
      $scope.isAdmin = true;
    
    if ($scope.thisUser && authFactory.getUserIdentity().permission == 1)
      $scope.isMod = true;

    socketFactory.emit('profile:get', $stateParams.profile);

    socketFactory.on('profile:set', function(profileData)
    {
      switch (profileData.profile.permission)
      {
        case '2':
          profileData.profile.permission = 'Admin';
          break
        case '1':
          profileData.profile.permission = 'Mod';
          break
        case '0':
          profileData.profile.permission = 'User'; 
          break      
      }
      console.log(profileData.profile.permission);
      $scope.user = {
        username: profileData.profile.username,
        color: profileData.profile.color,
        permission: profileData.profile.permission,
        creationDate: profileData.profile.creationDate,
        lastOnline: profileData.profile.lastOnline
      };
      $scope.onlineStatus = profileData.status? 'Online': false;

      $timeout(function(){$scope.loading = false}, 700);
    });

    $scope.logout = function()
    {
      $scope.isLoading = true;
      httpFactory.post.logout().success(function()
      {
        authFactory.delUserIdentity();
        authFactory.setAuth();
        socketFactory.reconnectSocket();
        $timeout(function()
        {
          $scope.isLoading = false;
          $uibModalInstance.dismiss('cancel');
        }, 1000);
      });
    }

    $scope.close = function () 
    {
      $uibModalInstance.dismiss('cancel');
    };
	});