angular
  .module('wuutApp')
  .controller('ModalController', function($scope, $stateParams, $timeout, $uibModal, modalState)
  {
  	console.log("Params from modalController:");
  	console.log($stateParams);

  	var stateData = {
			auth:{
				template: 'static/views/auth-view.html',
				controller: 'AuthController'
			},
			profile: {
				template: 'static/views/profile-view.html',
				controller: 'ProfileController',
				params: null
			}
		};

		var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: stateData[$stateParams.state].template,
      controller: stateData[$stateParams.state].controller,
      size: 'sm'
     });

		 modalInstance.result.then(null, function () {
		    modalState.destroyModalState();
		  });
  });