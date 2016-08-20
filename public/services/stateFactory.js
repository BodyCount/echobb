angular
	.module('wuutApp')
	.factory('stateFactory', function () {
    return { 
      addState: function($stateProvider, name, state) { 
        $stateProvider.state(name, state);
      }
  	}
  });