angular
  .module('wuutApp')
  .controller('AdminPanelController', 
  function($scope, $stateParams,  $location, $timeout, authFactory, socketFactory)
  {

  	if (!authFactory.getAuth() || authFactory.getUserIdentity().permission != 2)
  		return $location.path('#/')

  	socketFactory.emit('main:subscribe');
  	
		$scope.createSection = function(section)
		{
			socketFactory.emit('sections:create', section);
		};

  })