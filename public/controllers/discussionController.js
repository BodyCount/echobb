angular
  .module('wuutApp')
  .controller('DiscussionController', 
  function($scope, $stateParams, $timeout, authFactory, socketFactory, pageFactory, nprogressFactory)
  {

    $stateParams.section = encodeURIComponent($stateParams.section);
    pageFactory.resetHistory();
    $scope.route = $stateParams;
    $scope.authStatus = authFactory.getAuth();

    var needToReplace = false;

    nprogressFactory.start();
    $scope.isLoading =  true;

    subscribe();

    function subscribe()
    {
      socketFactory.emit('discussion:subscribe', {'route': $stateParams});

      socketFactory.on('discussion:update', function(discussionData)
      {
        var updatedDiscussion = discussionData.discussion;
        nprogressFactory.set(0.3);
        console.log('discussion:update');
        console.log(discussionData);

        if (!updatedDiscussion)
          if ($scope.isLoading)
            return $timeout(function()
                  {
                    nprogressFactory.done(); 
                    $timeout(function(){$scope.isLoading = false}, 700)
                  }, 700);         

        if (discussionData.hasNew && $scope.discussion)
        {
          nprogressFactory.done(); 
          updatedDiscussion.replies[updatedDiscussion.replies.length - 1].new = true;
          return $scope.discussion.replies.push(updatedDiscussion.replies[updatedDiscussion.replies.length - 1]);
        }


        if (!$scope.discussion || needToReplace)
        {
          needToReplace = false;
          $scope.message = updatedDiscussion.replies[0]; //т.к. первый эллемент массива реплаев это тред меседж, переносим его в отдельную переменную и удаляем из массива.
          updatedDiscussion.replies.splice(0,1);        
          $scope.discussion = updatedDiscussion;
        }
        else
        {
          for (var k in updatedDiscussion.replies)
            $scope.discussion.replies.push(updatedDiscussion.replies[k]);            
        }

        isLastPage = (!updatedDiscussion)? true: false;

        if ($scope.isLoading)
        {
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

      socketFactory.on('discussion:error', function(error)
      {
        $scope.error = error;
        $timeout(function()
        {
          nprogressFactory.done(); 
          $timeout(function(){$scope.isLoading = false}, 700)
        }, 700);
      });    

    }

    $scope.createReply = function(reply)
    {
      console.log(reply);
      socketFactory.emit('reply:create', reply);
    };

    $scope.getReplies = function()
    {
      if (isLastPage) return;
      socketFactory.emit('discussion:loadMore', pageFactory.getPages().discussion);
      pageFactory.changeDiscussionPage();
    };


    $scope.$on('authStateChange', function()
    {
        $timeout(function(){
          $scope.authStatus = authFactory.getAuth();
        }, 1200);
    });

    $scope.$on('socketStateChange', function()
    {
      needToReplace = true;
      $timeout(function(){subscribe();}, 1300); // sockets cant init subscribtions without a timer, but this is bad solution(?)
    });

    $scope.$on('$destroy', function (event) {
      socketFactory.removeAllListeners();
    });
  });
