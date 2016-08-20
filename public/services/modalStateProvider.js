angular
	.module('wuutApp')
	.provider('modalState', function modalStateProvider() {

		var stateProviderRef;
		var previousState = {state: null, name: null}

		this.setStateProviderRef = function(stateProvider){
			stateProviderRef = stateProvider;
		}

		this.$get = function($uibModal){
			return {
				createModalState: function($state, currentState, params){
					previousState.state = $state;
					previousState.name = currentState;

					var stateName = currentState+'.modal';

					if (!$state.get(stateName))
						stateProviderRef.state(stateName, {
							views:{
								'modal':{
									templateUrl: 'static/views/modal-view.html',
									controller: 'ModalController'										
								}},
							params: {state:null, profile:null}
						});
					
					$state.go(stateName, params);
				},

				destroyModalState: function(){
					previousState.state.go(previousState.name);		
				}
			}
		};
	});
