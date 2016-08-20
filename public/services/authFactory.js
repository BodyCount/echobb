angular
	.module('wuutApp')
	.factory('authFactory', function($rootScope) {

		var authorized = false;
		var userIdentity = {username: null, permission: null, color:null};
		return {

      setAuth: function(){
        authorized = !authorized;
        $rootScope.$broadcast('authStateChange');
      },

			getAuth: function(){
				return authorized;
			},

      setUserIdentity: function(user){
        userIdentity.username = user.username;
        userIdentity.permission = user.permission;
      },

      setUserColor: function(color){
        userIdentity.color = color;     	
      },

			getUserIdentity: function(){
				return userIdentity;
			},

      delUserIdentity: function(){
        userIdentity = {username: null, permission: null, color:null};
      }

		}
	});