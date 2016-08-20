angular
	.module('wuutApp')
	.controller('SectionController', 
	function($scope, $stateParams, $timeout, authFactory, socketFactory, pageFactory, nprogressFactory)
	{
		pageFactory.resetHistory();

		$scope.link = $stateParams.section;
		$scope.route = $stateParams;
		$scope.authStatus = authFactory.getAuth();
		nprogressFactory.start();
		$scope.isLoading =  true;
		$scope.showInput = false;

		var isLastPage = false;
		var needToReplace = false;
		subscirbe();

		function subscirbe()
		{
			socketFactory.emit('section:subscribe', {'section': encodeURIComponent($stateParams.section)});	
			socketFactory.on('section:update', function(section)
			{
				var updatedDiscussions = section.discussions;

				nprogressFactory.set(0.3);
				console.log('section:update');
				console.log(updatedDiscussions);

				if (section.hasNew && $scope.discussions)
				{
					nprogressFactory.done(); 
					for (var i = 0; i < $scope.discussions.length; i++)
						if (updatedDiscussions[0]._id === $scope.discussions[i]._id)
						{
							$scope.discussions[i].lastMessageDate = updatedDiscussions[0].lastMessageDate;
							return $scope.discussions[i].diff = ($scope.discussions[i].diff)? $scope.discussions[i].diff+1: 1;
						}

						$scope.discussions.unshift(updatedDiscussions[0]);		
						$scope.discussions[0].new = true;
						return;
				}

				if (!$scope.discussions || needToReplace){
					needToReplace = false;
					$scope.discussions = updatedDiscussions;
				}
				else
				{
					for (var k in updatedDiscussions)
						$scope.discussions.push(updatedDiscussions[k]);						
				}
				
				isLastPage = (updatedDiscussions.length < 10)? true: false;

				if ($scope.isLoading){
					nprogressFactory.set(0.5);
					$timeout(function()
					{
						nprogressFactory.done(); 
						$timeout(function(){$scope.isLoading = false}, 700)
					}, 700);
				}
				else
					nprogressFactory.done(); 
			});				

			socketFactory.on('section:error', function(error)
			{ 
				$scope.error = error;
				console.log(error);
				$timeout(function()
				{
					nprogressFactory.done(); 
					$timeout(function(){$scope.isLoading = false}, 700)
				}, 700);

			});	
		}

		$scope.createDiscussion = function(discussion)
		{
			socketFactory.emit('discussion:create', discussion);
		};

		$scope.getDiscussions = function()
		{
			if (isLastPage) return;
			console.log('loading new discussions');
			socketFactory.emit('section:loadMore', pageFactory.getPages().section);
			pageFactory.changeSectionPage();
		};

		$scope.changeProgressParent = function(value)
		{
			ngprogressFactory.changeParent(value);
		}

		$scope.$on('authStateChange', function()
		{
			$timeout(function(){$scope.authStatus = authFactory.getAuth()}, 800);
		});

		$scope.$on('socketStateChange', function()
		{
			needToReplace = true;
			$timeout(function(){
				subscirbe();
			}, 1300); // sockets cant init subscribtions without a timer, but this is bad solution(?)
		});
		
		$scope.$on('$destroy', function (event) {
      socketFactory.removeAllListeners();
    });
	});
