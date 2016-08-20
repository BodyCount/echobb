angular
	.module('wuutApp')
	.controller('SectionsController', 
	function($scope, $stateParams, $timeout, socketFactory, nprogressFactory)
	{
		$scope.message = "Add section";
		$scope.currentState = 'index';
		nprogressFactory.start();
		$scope.isLoading = true;

		subscribe();

		function subscribe()
		{
			socketFactory.emit('main:subscribe');
			
	    socketFactory.on('sections:update', function(sections)
			{
				nprogressFactory.set(0.3);
				console.log('sections:update');
				console.log(sections);
				$scope.sections = sections;
				
				if ($scope.isLoading){
					nprogressFactory.set(0.6);
					$timeout(function(){
						nprogressFactory.done();						
						$timeout(function(){$scope.isLoading = false;}, 700);
					}, 700);
				}
				else
					nprogressFactory.done();	
			});

			socketFactory.on('sections:error', function(error)
			{
				$scope.error = error;
			});			
		}

    $scope.$on('socketStateChange', function()
		{
			$timeout(function(){subscribe();}, 1300); // sockets cant init subscribtions without a timer, but this is bad solution(?)
		});

		$scope.$on('$destroy', function (event) {
      socketFactory.removeAllListeners();
    });




	});
