(function(undefined) {
    var componentLoadingOperationUniqueId = 0;

    function ComponentDisplayDeferred(element, parentComponentDeferred, replacedDeferred) {
        var subscribable = new ko.subscribable();
        this.subscribable = subscribable;

        this._componentsToComplete = 1;

        this.componentComplete = function () {
            if (subscribable && !--this._componentsToComplete) {
                subscribable['notifySubscribers'](element);
                subscribable = undefined;
                if (parentComponentDeferred) {
                    parentComponentDeferred.componentComplete();
                }
            }
        };
        this.dispose = function (shouldReject) {
            if (subscribable) {
                this._componentsToComplete = 0;
                subscribable = undefined;
                if (parentComponentDeferred) {
                    parentComponentDeferred.componentComplete();
                }
            }
        };

        if (parentComponentDeferred) {
            ++parentComponentDeferred._componentsToComplete;
        }

        if (replacedDeferred) {
            replacedDeferred.dispose();
        }
    }

    ko.bindingHandlers['component'] = {
        'init': function(element, valueAccessor, ignored1, ignored2, bindingContext) {
            var currentViewModel,
                currentLoadingOperationId,
                displayedDeferred,
                disposeAssociatedComponentViewModel = function () {
                    var currentViewModelDispose = currentViewModel && currentViewModel['dispose'];
                    if (typeof currentViewModelDispose === 'function') {
                        currentViewModelDispose.call(currentViewModel);
                    }
                    currentViewModel = null;
                    // Any in-flight loading operation is no longer relevant, so make sure we ignore its completion
                    currentLoadingOperationId = null;
                },
                originalChildNodes = ko.utils.makeArray(ko.virtualElements.childNodes(element));

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                disposeAssociatedComponentViewModel();
                if (displayedDeferred) {
                    displayedDeferred.dispose();
                    displayedDeferred = null;
                }
            });

            ko.computed(function () {
                var value = ko.utils.unwrapObservable(valueAccessor()),
                    componentName, componentParams;

                if (typeof value === 'string') {
                    componentName = value;
                } else {
                    componentName = ko.utils.unwrapObservable(value['name']);
                    componentParams = ko.utils.unwrapObservable(value['params']);
                }

                if (!componentName) {
                    throw new Error('No component name specified');
                }

                displayedDeferred = new ComponentDisplayDeferred(element, bindingContext._componentDisplayDeferred, displayedDeferred);

                var loadingOperationId = currentLoadingOperationId = ++componentLoadingOperationUniqueId;
                ko.components.get(componentName, function(componentDefinition) {
                    // If this is not the current load operation for this element, ignore it.
                    if (currentLoadingOperationId !== loadingOperationId) {
                        return;
                    }

                    // Clean up previous state
                    disposeAssociatedComponentViewModel();

                    // Instantiate and bind new component. Implicitly this cleans any old DOM nodes.
                    if (!componentDefinition) {
                        throw new Error('Unknown component \'' + componentName + '\'');
                    }
                    cloneTemplateIntoElement(componentName, componentDefinition, element);

                    var componentInfo = {
                        'element': element,
                        'templateNodes': originalChildNodes
                    };

                    var componentViewModel = createViewModel(componentDefinition, componentParams, componentInfo),
                        childBindingContext = bindingContext['createChildContext'](componentViewModel, /* dataItemAlias */ undefined, function(ctx) {
                            ctx['$component'] = componentViewModel;
                            ctx['$componentTemplateNodes'] = originalChildNodes;
                            ctx._componentDisplayDeferred = displayedDeferred;
                        });

                    if (componentViewModel && componentViewModel['afterRender']) {
                        displayedDeferred.subscribable.subscribe(componentViewModel['afterRender']);
                    }

                    currentViewModel = componentViewModel;
                    ko.applyBindingsToDescendants(childBindingContext, element);

                    displayedDeferred.componentComplete();
                });
            }, null, { disposeWhenNodeIsRemoved: element });

            return { 'controlsDescendantBindings': true };
        }
    };

    ko.virtualElements.allowedBindings['component'] = true;

    function cloneTemplateIntoElement(componentName, componentDefinition, element) {
        var template = componentDefinition['template'];
        if (!template) {
            throw new Error('Component \'' + componentName + '\' has no template');
        }

        var clonedNodesArray = ko.utils.cloneNodes(template);
        ko.virtualElements.setDomNodeChildren(element, clonedNodesArray);
    }

    function createViewModel(componentDefinition, componentParams, componentInfo) {
        var componentViewModelFactory = componentDefinition['createViewModel'];
        return componentViewModelFactory
            ? componentViewModelFactory.call(componentDefinition, componentParams, componentInfo)
            : componentParams; // Template-only component
    }

})();
