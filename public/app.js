angular.module('wuutApp', ['ui.router', 'ui.bootstrap'])
	.config(function($stateProvider, $urlRouterProvider, $locationProvider, modalStateProvider) {

		$stateProvider
			.state('main', {
				url: '/',
				views: {
					"nav-bar": {
						templateUrl: 'static/views/nav-bar.html',
						controller: 'NavbarController'},
					"container": {				
						templateUrl: 'static/views/sections-view.html',
						controller: 'SectionsController'},
					"footer": {
						templateUrl: 'static/views/footer.html'
					}
				}
			})
			.state('section', {
				url: '/s/:section',
				views: {
					"nav-bar": {
						templateUrl: 'static/views/nav-bar.html',
						controller: 'NavbarController'},
					"container": {				
						templateUrl: 'static/views/section-view.html',
						controller: 'SectionController'},
					"footer": {
						templateUrl: 'static/views/footer.html'
					}
				}
			})
			.state('discussion', {
				url: '/s/:section/:discussion',
				views: {
					"nav-bar": {
						templateUrl: 'static/views/nav-bar.html',
						controller: 'NavbarController'},
					"container": {				
						templateUrl: 'static/views/discussion-view.html',
						controller: 'DiscussionController'},
					"footer": {
						templateUrl: 'static/views/footer.html'
					}
				}
			})
			.state('adminPanel', {
				url: '/admin',
				views: {
					"nav-bar": {
						templateUrl: 'static/views/nav-bar.html',
						controller: 'NavbarController'},
					"container": {			
							templateUrl: 'static/views/admin-panel-view.html',
							controller: 'AdminPanelController'
						},
					"footer": {
						templateUrl: 'static/views/footer.html'
					}
				}
			})
			.state('modal', {
				views:{
					'modal':{
						templateUrl: 'static/views/modal-view.html',
						controller: 'ModalController'										
					}},
				params: {state:null, profile:null}
			})
			.state('auth', {
				parent: 'modal'
			})
			.state('profile', {
				parent: 'modal'
			});

		$urlRouterProvider.otherwise("/");

		modalStateProvider.setStateProviderRef($stateProvider);

	})
	.run(function ($rootScope, $state, $stateParams, modalState) {

	    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    	  if (toState.name === 'modal'){
      		event.preventDefault();
      		modalState.createModalState($state, fromState.name, toParams)
      	}
      });
  	}
	)
	.directive('onScrollEnd', function($window, $document){
		return function($scope, element, attrs){
 			var elt = element[0];
      angular.element($window).bind("scroll", function() {
      	var currentPos = $window.scrollY + $window.innerHeight //bottom pos of scroll
      		, scrollHeight = $document[0].body.scrollHeight
      		, indent = scrollHeight * 0.2;

				if (currentPos >= (scrollHeight - indent))
					$scope[attrs.onScrollEnd]();
      });
		}
	})
	.filter('capitalize', function() {
	  return function(input) {
	  	if (input)
	    return input.charAt(0).toUpperCase() + input.slice(1);
	   }
	})
	.filter('moment', function() {
	  return function(input, displayFormat) {
	  	if (input){
	  		if (displayFormat === 'calendar')
	  			return moment(input).calendar();
	  		if (displayFormat === 'fromNow')
	  			return moment(input).fromNow();
	  	}
	    
	   }		
	})
	.filter('usericon', function() {
		return function(input) {
			if (input){
	   	 return input.charAt(0).toUpperCase()
			}
		}
	});
