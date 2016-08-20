angular
	.module('wuutApp')
	.factory('socketFactory', function($rootScope) {
		var socket = io.connect('localhost:3000');
		return {

			getSocket: function(){
				return socket;
			},

			removeAllListeners: function(){
				socket.removeAllListeners();
			},

			reconnectSocket: function(){
				socket.io.disconnect();
			  socket = io.connect('localhost:3000');
				$rootScope.$broadcast('socketStateChange'); //this is random value need to change
			},

			on: function(eventName, callback) {
				socket.on(eventName, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						callback.apply(socket, args);
					});
				});
			},

			emit: function(eventName, data, callback) {
				socket.emit(eventName, data, function(){
					var args = arguments;
					$rootScope.$apply(function() {
						if (callback)
							callback.apply(socket, args);
					});
				});
			}

		}
	});