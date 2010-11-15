
ko.dependentObservable = function (evaluatorFunction, evaluatorFunctionTarget, options) {
    if (typeof evaluatorFunction != "function")
        throw "Pass a function that returns the value of the dependentObservable";

    var _subscriptionsToDependencies = [];
    function disposeAllSubscriptionsToDependencies() {
        ko.utils.arrayForEach(_subscriptionsToDependencies, function (subscription) {
            subscription.dispose();
        });
        _subscriptionsToDependencies = [];
    }

    function replaceSubscriptionsToDependencies(newDependencies) {
        disposeAllSubscriptionsToDependencies();
        ko.utils.arrayForEach(newDependencies, function (dependency) {
            _subscriptionsToDependencies.push(dependency.subscribe(evaluate));
        });
    };

    var _latestValue, _isFirstEvaluation = true;
    function evaluate() {
        if ((!_isFirstEvaluation) && options && typeof options["disposeWhen"] == "function") {
            if (options["disposeWhen"]()) {
                dependentObservable.dispose();
                return;
            }
        }

        try {
            ko.dependencyDetection.begin();
            _latestValue = evaluatorFunctionTarget ? evaluatorFunction.call(evaluatorFunctionTarget) : evaluatorFunction();
        } finally {
            var distinctDependencies = ko.utils.arrayGetDistinctValues(ko.dependencyDetection.end());
            replaceSubscriptionsToDependencies(distinctDependencies);
        }

        dependentObservable.notifySubscribers(_latestValue);
        _isFirstEvaluation = false;
    }

    function dependentObservable() {
        if (arguments.length > 0)
            throw "Cannot write a value to a dependentObservable. Do not pass any parameters to it";
			
		if (_isFirstEvaluation) {
			evaluate();
		}

        ko.dependencyDetection.registerDependency(dependentObservable);
        return _latestValue;
    }
    dependentObservable.__ko_proto__ = ko.dependentObservable;
    dependentObservable.getDependenciesCount = function () { return _subscriptionsToDependencies.length; }
    dependentObservable.dispose = function () {
        disposeAllSubscriptionsToDependencies();
    };
    dependentObservable.evaluate = function () {
        evaluate();
    };

    ko.subscribable.call(dependentObservable);
    if (!options || !options["deferEvaluation"]) {
		evaluate();
	}
    
    ko.exportProperty(dependentObservable, 'dispose', dependentObservable.dispose);
    ko.exportProperty(dependentObservable, 'evaluate', dependentObservable.evaluate);
    ko.exportProperty(dependentObservable, 'getDependenciesCount', dependentObservable.getDependenciesCount);
    
    return dependentObservable;
};
ko.dependentObservable.__ko_proto__ = ko.observable;

ko.exportSymbol('ko.dependentObservable', ko.dependentObservable);
