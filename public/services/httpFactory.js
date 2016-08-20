angular
	.module('wuutApp')
	.factory('httpFactory', function($http) {
		return {

			get: {
				//profile: function(username){
				//	return $http.get('/profile/'+ username);
				//}
			},

			post:{

				createUser: function(userData) {
					return $http.post('/create', userData);
				},

				authUser:function(userData) {
					return $http.post('/login', userData);
				},

				logout: function(){
					return $http.post('/logout');
				}			
			}

		};
	});
