angular
	.module('wuutApp')
	.controller('NavbarController', function($scope, $stateParams, $timeout, authFactory, socketFactory)
	{
		$scope.authStatus = authFactory.getAuth();

		if (!$scope.authStatus){
			$scope.isLoading = true;
			
			socketFactory.on('auth:setAuth', function(user)
			{
				authFactory.setUserIdentity(user);
				getColor(user.username);
		    authFactory.setAuth();				
			});
			
			$timeout(function(){
        $scope.isLoading = false;		
      }, 1200); 
		}

		$scope.user = {
			username:authFactory.getUserIdentity().username || undefined,
			color: authFactory.getUserIdentity().color || undefined
		};

		$scope.$on('authStateChange', function()
		{
			if (authFactory.getAuth() === true)
				getColor(authFactory.getUserIdentity().username, function()
				{
					$timeout(function(){
						$scope.user = authFactory.getUserIdentity();
						$scope.authStatus = authFactory.getAuth();	
					}, 1200);
				});
			else
				$timeout(function(){
					$scope.user = authFactory.getUserIdentity();
					$scope.authStatus = authFactory.getAuth();	
				}, 1200);				
		});

		function getColor(profile, callback)
		{
			if (authFactory.getUserIdentity().color || !authFactory.getUserIdentity().username) return;
	    socketFactory.emit('profile:get', profile);

	    socketFactory.on('profile:set', function(profileData)
	    {
	    	authFactory.setUserColor(profileData.profile.color);
	    	if (callback) return callback();
	    });			
		}
	});


						//httpFactory.checkAuth().success(function(response, status)
				//{
					//if (response.username){
						//authFactory.setUserIdentity(response.username);
		        //authFactory.setAuth();
					//}