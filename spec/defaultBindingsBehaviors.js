
function prepareTestNode() {
    var existingNode = document.getElementById("testNode");
    if (existingNode != null)
        existingNode.parentNode.removeChild(existingNode);
    testNode = document.createElement("div");
    testNode.id = "testNode";
    document.body.appendChild(testNode);
}

function getSelectedValuesFromSelectNode(selectNode) {
    var selectedNodes = ko.utils.arrayFilter(selectNode.childNodes, function (node) { return node.selected; });
    return ko.utils.arrayMap(selectedNodes, function (node) { return ko.selectExtensions.readValue(node); });
}

describe('Binding: Enable/Disable', {
    before_each: prepareTestNode,

    'Enable means the node is enabled only when the value is true': function () {
        var observable = new ko.observable();
        testNode.innerHTML = "<input data-bind='enable:myModelProperty()' />";
        ko.applyBindings({ myModelProperty: observable }, testNode);

        value_of(testNode.childNodes[0].disabled).should_be(true);
        observable(1);
        value_of(testNode.childNodes[0].disabled).should_be(false);
    },

    'Disable means the node is enabled only when the value is false': function () {
        var observable = new ko.observable();
        testNode.innerHTML = "<input data-bind='disable:myModelProperty()' />";
        ko.applyBindings({ myModelProperty: observable }, testNode);

        value_of(testNode.childNodes[0].disabled).should_be(false);
        observable(1);
        value_of(testNode.childNodes[0].disabled).should_be(true);
    },

    'Enable should unwrap observables implicitly': function () {
        var observable = new ko.observable(false);
        testNode.innerHTML = "<input data-bind='enable:myModelProperty' />";
        ko.applyBindings({ myModelProperty: observable }, testNode);
        value_of(testNode.childNodes[0].disabled).should_be(true);
    },

    'Disable should unwrap observables implicitly': function () {
        var observable = new ko.observable(false);
        testNode.innerHTML = "<input data-bind='disable:myModelProperty' />";
        ko.applyBindings({ myModelProperty: observable }, testNode);
        value_of(testNode.childNodes[0].disabled).should_be(false);
    }
});

describe('Binding: Visible', {
    before_each: prepareTestNode,

    'Should display the node only when the value is true': function () {
        var observable = new ko.observable(false);
        testNode.innerHTML = "<input data-bind='visible:myModelProperty()' />";
        ko.applyBindings({ myModelProperty: observable }, testNode);

        value_of(testNode.childNodes[0].style.display).should_be("none");
        observable(true);
        value_of(testNode.childNodes[0].style.display).should_be("");
    },

    'Should unwrap observables implicitly': function () {
        var observable = new ko.observable(false);
        testNode.innerHTML = "<input data-bind='visible:myModelProperty' />";
        ko.applyBindings({ myModelProperty: observable }, testNode);
        value_of(testNode.childNodes[0].style.display).should_be("none");
    }
});

describe('Binding: Text', {
    before_each: prepareTestNode,

    'Should assign the value to the node, HTML-encoding the value': function () {
        var model = { textProp: "'Val <with> \"special\" <i>characters</i>'" };
        testNode.innerHTML = "<span data-bind='text:textProp'></span>";
        ko.applyBindings(model, testNode);
        value_of(testNode.childNodes[0].textContent || testNode.childNodes[0].innerText).should_be(model.textProp);
    },

    'Should assign an empty string as value if the model value is null': function () {
        testNode.innerHTML = "<span data-bind='text:(null)' ></span>";
        ko.applyBindings(null, testNode);
        var actualText = "textContent" in testNode.childNodes[0] ? testNode.childNodes[0].textContent : testNode.childNodes[0].innerText;
        value_of(actualText).should_be("");
    },

    'Should assign an empty string as value if the model value is undefined': function () {
        testNode.innerHTML = "<span data-bind='text:undefined' ></span>";
        ko.applyBindings(null, testNode);
        var actualText = "textContent" in testNode.childNodes[0] ? testNode.childNodes[0].textContent : testNode.childNodes[0].innerText;
        value_of(actualText).should_be("");
    }
});

describe('Binding: HTML', {
    before_each: prepareTestNode,

    'Should assign the value to the node without HTML-encoding the value': function () {
        var model = { textProp: "My <span>HTML-containing</span> value" };
        testNode.innerHTML = "<span data-bind='html:textProp'></span>";
        ko.applyBindings(model, testNode);
        value_of(testNode.childNodes[0].innerHTML.toLowerCase()).should_be(model.textProp.toLowerCase());
        value_of(testNode.childNodes[0].childNodes[1].innerHTML).should_be("HTML-containing");
    },

    'Should assign an empty string as value if the model value is null': function () {
        testNode.innerHTML = "<span data-bind='html:(null)' ></span>";
        ko.applyBindings(null, testNode);
        value_of(testNode.childNodes[0].innerHTML).should_be("");
    },

    'Should assign an empty string as value if the model value is undefined': function () {
        testNode.innerHTML = "<span data-bind='html:undefined' ></span>";
        ko.applyBindings(null, testNode);
        value_of(testNode.childNodes[0].innerHTML).should_be("");
    }
});

describe('Binding: Value', {
    before_each: prepareTestNode,

    'Should assign the value to the node': function () {
        testNode.innerHTML = "<input data-bind='value:123' />";
        ko.applyBindings(null, testNode);
        value_of(testNode.childNodes[0].value).should_be(123);
    },

    'Should treat null values as empty strings': function () {
        testNode.innerHTML = "<input data-bind='value:myProp' />";
        ko.applyBindings({ myProp: ko.observable(0) }, testNode);
        value_of(testNode.childNodes[0].value).should_be("0");
    },

    'Should assign an empty string as value if the model value is null': function () {
        testNode.innerHTML = "<input data-bind='value:(null)' />";
        ko.applyBindings(null, testNode);
        value_of(testNode.childNodes[0].value).should_be("");
    },

    'Should assign an empty string as value if the model value is undefined': function () {
        testNode.innerHTML = "<input data-bind='value:undefined' />";
        ko.applyBindings(null, testNode);
        value_of(testNode.childNodes[0].value).should_be("");
    },

    'For observable values, should unwrap the value and update on change': function () {
        var myobservable = new ko.observable(123);
        testNode.innerHTML = "<input data-bind='value:someProp' />";
        ko.applyBindings({ someProp: myobservable }, testNode);
        value_of(testNode.childNodes[0].value).should_be(123);
        myobservable(456);
        value_of(testNode.childNodes[0].value).should_be(456);
    },

    'For writeable observable values, should catch the node\'s onchange and write values back to the observable': function () {
        var myobservable = new ko.observable(123);
        testNode.innerHTML = "<input data-bind='value:someProp' />";
        ko.applyBindings({ someProp: myobservable }, testNode);
        testNode.childNodes[0].value = "some user-entered value";
        ko.utils.triggerEvent(testNode.childNodes[0], "change");
        value_of(myobservable()).should_be("some user-entered value");
    },

    'For non-observable property values, should catch the node\'s onchange and write values back to the property': function () {
        var model = { modelProperty123: 456 };
        testNode.innerHTML = "<input data-bind='value: modelProperty123' />";
        ko.applyBindings(model, testNode);
        value_of(testNode.childNodes[0].value).should_be(456);

        testNode.childNodes[0].value = 789;
        ko.utils.triggerEvent(testNode.childNodes[0], "change");
        value_of(model.modelProperty123).should_be(789);
    },

    'Should be able to write to observable subproperties of an observable, even after the parent observable has changed': function () {
        // This spec represents https://github.com/SteveSanderson/knockout/issues#issue/13
        var originalSubproperty = ko.observable("original value");
        var newSubproperty = ko.observable();
        var model = { myprop: ko.observable({ subproperty : originalSubproperty }) };

        // Set up a text box whose value is linked to the subproperty of the observable's current value
        testNode.innerHTML = "<input data-bind='value: myprop().subproperty' />";
        ko.applyBindings(model, testNode);
        value_of(testNode.childNodes[0].value).should_be("original value");

        model.myprop({ subproperty : newSubproperty }); // Note that myprop (and hence its subproperty) is changed *after* the bindings are applied
        testNode.childNodes[0].value = "Some new value";
        ko.utils.triggerEvent(testNode.childNodes[0], "change");

        // Verify that the change was written to the *new* subproperty, not the one referenced when the bindings were first established
        value_of(newSubproperty()).should_be("Some new value");
        value_of(originalSubproperty()).should_be("original value");
    },

    'Should only register one single onchange handler': function () {
        var notifiedValues = [];
        var myobservable = new ko.observable(123);
        myobservable.subscribe(function (value) { notifiedValues.push(value); });
        value_of(notifiedValues.length).should_be(0);

        testNode.innerHTML = "<input data-bind='value:someProp' />";
        ko.applyBindings({ someProp: myobservable }, testNode);

        // Implicitly observe the number of handlers by seeing how many times "myobservable"
        // receives a new value for each onchange on the text box. If there's just one handler,
        // we'll see one new value per onchange event. More handlers cause more notifications.
        testNode.childNodes[0].value = "ABC";
        ko.utils.triggerEvent(testNode.childNodes[0], "change");
        value_of(notifiedValues.length).should_be(1);

        testNode.childNodes[0].value = "DEF";
        ko.utils.triggerEvent(testNode.childNodes[0], "change");
        value_of(notifiedValues.length).should_be(2);
    },

    'For select boxes, should update selectedIndex when the model changes': function() {
        var observable = new ko.observable('B');
        testNode.innerHTML = "<select data-bind='options:[\"A\", \"B\"], value:myObservable'></select>";
        ko.applyBindings({ myObservable: observable }, testNode);
        value_of(testNode.childNodes[0].selectedIndex).should_be(1);
        observable('A');
        value_of(testNode.childNodes[0].selectedIndex).should_be(0);
    },

    'For select boxes, should display the caption when the model value changes to undefined': function() {
        var observable = new ko.observable('B');
        testNode.innerHTML = "<select data-bind='options:[\"A\", \"B\"], optionsCaption:\"Select...\", value:myObservable'></select>";
        ko.applyBindings({ myObservable: observable }, testNode);
        value_of(testNode.childNodes[0].selectedIndex).should_be(2);
        observable(undefined);
        value_of(testNode.childNodes[0].selectedIndex).should_be(0);
    },

    'For select boxes, should update the model value when the UI is changed (setting it to undefined when the caption is selected)': function () {
        var observable = new ko.observable('B');
        testNode.innerHTML = "<select data-bind='options:[\"A\", \"B\"], optionsCaption:\"Select...\", value:myObservable'></select>";
        ko.applyBindings({ myObservable: observable }, testNode);
        var dropdown = testNode.childNodes[0];

        dropdown.selectedIndex = 1;
        ko.utils.triggerEvent(dropdown, "change");
        value_of(observable()).should_be("A");

        dropdown.selectedIndex = 0;
        ko.utils.triggerEvent(dropdown, "change");
        value_of(observable()).should_be(undefined);
    },

    'For select boxes, should be able to associate option values with arbitrary objects (not just strings)': function() {
        var x = {}, y = {};
        var selectedValue = ko.observable(y);
        testNode.innerHTML = "<select data-bind='options: myOptions, value: selectedValue'></select>";
        var dropdown = testNode.childNodes[0];
        ko.applyBindings({ myOptions: [x, y], selectedValue: selectedValue }, testNode);

        // Check the UI displays the entry corresponding to the chosen value
        value_of(dropdown.selectedIndex).should_be(1);

        // Check that when we change the model value, the UI is updated
        selectedValue(x);
        value_of(dropdown.selectedIndex).should_be(0);

        // Check that when we change the UI, this changes the model value
        dropdown.selectedIndex = 1;
        ko.utils.triggerEvent(dropdown, "change");
        value_of(selectedValue()).should_be(y);
    },

    'For select boxes, should automatically initialize the model property to match the first option value if no option value matches the current model property value': function() {
        // The rationale here is that we always want the model value to match the option that appears to be selected in the UI
        //  * If there is *any* option value that equals the model value, we'd initalise the select box such that *that* option is the selected one
        //  * If there is *no* option value that equals the model value (often because the model value is undefined), we should set the model
        //    value to match an arbitrary option value to avoid inconsistency between the visible UI and the model
        var observable = new ko.observable(); // Undefined by default
        testNode.innerHTML = "<select data-bind='options:[\"A\", \"B\"], value:myObservable'></select>";
        ko.applyBindings({ myObservable: observable }, testNode);
        value_of(observable()).should_be("A");
    },

	'For select boxes, should automatically initialize the model property to match the first option value - event when value is included before options': function(){
        var observable = new ko.observable();
        testNode.innerHTML = "<select data-bind='value: myObservable, options:[\"A\", \"B\"]'></select>";
        ko.applyBindings({ myObservable: observable }, testNode);
        value_of(observable()).should_be("A");
	},

    'For select boxes, model property should be initialized even if included before options in data-bind': function() {
        var observable = new ko.observable("A");
        testNode.innerHTML = "<select data-bind='value: myObservable, options:[\"A\", \"B\"]'></select>";
        ko.applyBindings({ myObservable: observable }, testNode);
        value_of(observable()).should_be("A");
    },

	'For select boxes, model property should be initialized if included before options with optionsValue binding': function(){
        var observable = new ko.observable("A");
        testNode.innerHTML = "<select data-bind='value: myObservable, optionsValue: \"value\", options:[{ \"value\": \"A\" }, { \"value\": \"B\" }]'></select>";
        ko.applyBindings({ myObservable: observable }, testNode);
        value_of(observable()).should_be("A");
	},

    'For select boxes, should reject model values that don\'t match any option value, resetting the model value to whatever is visibly selected in the UI': function() {
        var observable = new ko.observable('B');
        testNode.innerHTML = "<select data-bind='options:[\"A\", \"B\", \"C\"], value:myObservable'></select>";
        ko.applyBindings({ myObservable: observable }, testNode);
        value_of(testNode.childNodes[0].selectedIndex).should_be(1);

        observable('D'); // This change should be rejected, as there's no corresponding option in the UI
        value_of(observable()).should_not_be('D');
    }
})

describe('Binding: Options', {
    before_each: prepareTestNode,

    // Todo: when the options list is populated, this should trigger a change event so that observers are notified of the new value (i.e., the default selection)

    'Should only be applicable to SELECT nodes': function () {
        var threw = false;
        testNode.innerHTML = "<input data-bind='options:{}' />";
        try { ko.applyBindings({}, testNode); }
        catch (ex) { threw = true; }
        value_of(threw).should_be(true);
    },

    'Should set the SELECT node\'s options set to match the model value': function () {
        var observable = new ko.observableArray(["A", "B", "C"]);
        testNode.innerHTML = "<select data-bind='options:myValues'><option>should be deleted</option></select>";
        ko.applyBindings({ myValues: observable }, testNode);
        var displayedOptions = ko.utils.arrayMap(testNode.childNodes[0].childNodes, function (node) { return node.innerHTML; });
        value_of(displayedOptions).should_be(["A", "B", "C"]);
    },

    'Should accept optionsText and optionsValue params to display subproperties of the model values': function() {
        var modelValues = new ko.observableArray([
            { name: 'bob', id: ko.observable(6) }, // Note that subproperties can be observable
            { name: ko.observable('frank'), id: 13 }
        ]);
        testNode.innerHTML = "<select data-bind='options:myValues, optionsText: \"name\", optionsValue: \"id\"'><option>should be deleted</option></select>";
        ko.applyBindings({ myValues: modelValues }, testNode);
        var displayedText = ko.utils.arrayMap(testNode.childNodes[0].childNodes, function (node) { return node.innerHTML; });
        var displayedValues = ko.utils.arrayMap(testNode.childNodes[0].childNodes, function (node) { return node.value; });
        value_of(displayedText).should_be(["bob", "frank"]);
        value_of(displayedValues).should_be([6, 13]);
    },

    'Should accept function in optionsText param to display subproperties of the model values': function() {
        var modelValues = new ko.observableArray([
            { name: 'bob', job: 'manager' },
            { name: 'frank', job: 'coder' }
        ]);
        testNode.innerHTML = "<select data-bind='options:myValues, optionsText: function (v) { return v[\"name\"] + \" (\" + v[\"job\"] + \")\"; }, optionsValue: \"id\"'><option>should be deleted</option></select>";
        ko.applyBindings({ myValues: modelValues }, testNode);
        var displayedText = ko.utils.arrayMap(testNode.childNodes[0].childNodes, function (node) { return node.innerHTML; });
        value_of(displayedText).should_be(["bob (manager)", "frank (coder)"]);
    },

    'Should update the SELECT node\'s options if the model changes': function () {
        var observable = new ko.observableArray(["A", "B", "C"]);
        testNode.innerHTML = "<select data-bind='options:myValues'><option>should be deleted</option></select>";
        ko.applyBindings({ myValues: observable }, testNode);
        observable.splice(1, 1);
        var displayedOptions = ko.utils.arrayMap(testNode.childNodes[0].childNodes, function (node) { return node.innerHTML; });
        value_of(displayedOptions).should_be(["A", "C"]);
    },

    'Should retain as much selection as possible when changing the SELECT node\'s options': function () {
        var observable = new ko.observableArray(["A", "B", "C"]);
        testNode.innerHTML = "<select data-bind='options:myValues' multiple='multiple'><option>A</option><option selected='selected'>B</option><option selected='selected'>X</option></select>";
        ko.applyBindings({ myValues: observable }, testNode);
        value_of(getSelectedValuesFromSelectNode(testNode.childNodes[0])).should_be(["B"]);
    },

    'Should place a caption at the top of the options list and display it when the model value is undefined': function() {
        testNode.innerHTML = "<select data-bind='options:[\"A\", \"B\"], optionsCaption: \"Select one...\"'></select>";
        ko.applyBindings({}, testNode);
        var displayedOptions = ko.utils.arrayMap(testNode.childNodes[0].childNodes, function (node) { return node.innerHTML; });
        value_of(displayedOptions).should_be(["Select one...", "A", "B"]);
    }
});

describe('Binding: Selected Options', {
    before_each: prepareTestNode,

    'Should only be applicable to SELECT nodes': function () {
        var threw = false;
        testNode.innerHTML = "<input data-bind='selectedOptions:[]' />";
        try { ko.applyBindings({}, testNode); }
        catch (ex) { threw = true; }
        value_of(threw).should_be(true);
    },

    'Should set selection in the SELECT node to match the model': function () {
        var bObject = {};
        var values = new ko.observableArray(["A", bObject, "C"]);
        var selection = new ko.observableArray([bObject]);
        testNode.innerHTML = "<select multiple='multiple' data-bind='options:myValues, selectedOptions:mySelection'></select>";
        ko.applyBindings({ myValues: values, mySelection: selection }, testNode);

        value_of(getSelectedValuesFromSelectNode(testNode.childNodes[0])).should_be([bObject]);
        selection.push("C");
        value_of(getSelectedValuesFromSelectNode(testNode.childNodes[0])).should_be([bObject, "C"]);
    },

    'Should update the model when selection in the SELECT node changes': function () {
        function setMultiSelectOptionSelectionState(optionElement, state) {
            // Workaround an IE 6 bug (http://benhollis.net/experiments/browserdemos/ie6-adding-options.html)
            if (/MSIE 6/i.test(navigator.userAgent))
                optionElement.setAttribute('selected', state);
            else
                optionElement.selected = state;
        }

        var cObject = {};
        var values = new ko.observableArray(["A", "B", cObject]);
        var selection = new ko.observableArray(["B"]);
        testNode.innerHTML = "<select multiple='multiple' data-bind='options:myValues, selectedOptions:mySelection'></select>";
        ko.applyBindings({ myValues: values, mySelection: selection }, testNode);

        value_of(selection()).should_be(["B"]);
        setMultiSelectOptionSelectionState(testNode.childNodes[0].childNodes[0], true);
        setMultiSelectOptionSelectionState(testNode.childNodes[0].childNodes[1], false);
        setMultiSelectOptionSelectionState(testNode.childNodes[0].childNodes[2], true);
        ko.utils.triggerEvent(testNode.childNodes[0], "change");

        value_of(selection()).should_be(["A", cObject]);
        value_of(selection()[1] === cObject).should_be(true); // Also check with strict equality, because we don't want to falsely accept [object Object] == cObject
    }
});

describe('Binding: Submit', {
    before_each: prepareTestNode,

    'Should invoke the supplied function on submit and prevent default action, using model as \'this\' param and the form node as a param to the handler': function () {
        var firstParamStored;
        var model = { wasCalled: false, doCall: function (firstParam) { this.wasCalled = true; firstParamStored = firstParam; } };
        testNode.innerHTML = "<form data-bind='submit:doCall' />";
        var formNode = testNode.childNodes[0];
        ko.applyBindings(model, testNode);
        ko.utils.triggerEvent(testNode.childNodes[0], "submit");
        value_of(model.wasCalled).should_be(true);
        value_of(firstParamStored).should_be(formNode);
    }
});

describe('Binding: Click', {
    before_each: prepareTestNode,

    'Should invoke the supplied function on click, using model as \'this\' param': function () {
        var model = { wasCalled: false, doCall: function () { this.wasCalled = true; } };
        testNode.innerHTML = "<button data-bind='click:doCall'>hey</button>";
        ko.applyBindings(model, testNode);
        ko.utils.triggerEvent(testNode.childNodes[0], "click");
        value_of(model.wasCalled).should_be(true);
    },

    'Should prevent default action': function () {
        testNode.innerHTML = "<a href='http://www.example.com/' data-bind='click: function() { }'>hey</button>";
        ko.applyBindings(null, testNode);
        ko.utils.triggerEvent(testNode.childNodes[0], "click");
        // Assuming we haven't been redirected to http://www.example.com/, this spec has now passed
    },

    'Should let click events bubble to parent elements by default': function() {
        var model = {
            innerWasCalled: false, innerDoCall: function () { this.innerWasCalled = true; },
            outerWasCalled: false, outerDoCall: function () { this.outerWasCalled = true; }
        };
        testNode.innerHTML = "<div data-bind='click:outerDoCall'><button data-bind='click:innerDoCall'>hey</button></div>";
        ko.applyBindings(model, testNode);
        ko.utils.triggerEvent(testNode.childNodes[0].childNodes[0], "click");
        value_of(model.innerWasCalled).should_be(true);
        value_of(model.outerWasCalled).should_be(true);
    },

    'Should be able to prevent bubbling using the clickBubble:false option': function() {
        var model = {
            innerWasCalled: false, innerDoCall: function () { this.innerWasCalled = true; },
            outerWasCalled: false, outerDoCall: function () { this.outerWasCalled = true; }
        };
        testNode.innerHTML = "<div data-bind='click:outerDoCall'><button data-bind='click:innerDoCall, clickBubble:false'>hey</button></div>";
        ko.applyBindings(model, testNode);
        ko.utils.triggerEvent(testNode.childNodes[0].childNodes[0], "click");
        value_of(model.innerWasCalled).should_be(true);
        value_of(model.outerWasCalled).should_be(false);
    }
});

describe('Binding: CSS class name', {
    before_each: prepareTestNode,

    'Should give the element the specific CSS class only when the specified value is true': function () {
        var observable1 = new ko.observable();
        var observable2 = new ko.observable(true);
        testNode.innerHTML = "<div class='unrelatedClass1 unrelatedClass2' data-bind='css: { myRule: someModelProperty, anotherRule: anotherModelProperty }'>Hallo</div>";
        ko.applyBindings({ someModelProperty: observable1, anotherModelProperty: observable2 }, testNode);

        value_of(testNode.childNodes[0].className).should_be("unrelatedClass1 unrelatedClass2 anotherRule");
        observable1(true);
        value_of(testNode.childNodes[0].className).should_be("unrelatedClass1 unrelatedClass2 anotherRule myRule");
        observable2(false);
        value_of(testNode.childNodes[0].className).should_be("unrelatedClass1 unrelatedClass2 myRule");
    }
});

describe('Binding: CSS style', {
    before_each: prepareTestNode,

    'Should give the element the specified CSS style value': function () {
        var myObservable = new ko.observable("red");
        testNode.innerHTML = "<div data-bind='style: { backgroundColor: colorValue }'>Hallo</div>";
        ko.applyBindings({ colorValue: myObservable }, testNode);

        value_of(testNode.childNodes[0].style.backgroundColor).should_be_one_of(["red", "#ff0000"]); // Opera returns style color values in #rrggbb notation, unlike other browsers
        myObservable("green");
        value_of(testNode.childNodes[0].style.backgroundColor).should_be_one_of(["green", "#008000"]);
        myObservable(undefined);
        value_of(testNode.childNodes[0].style.backgroundColor).should_be("");
    }
});

describe('Binding: Unique Name', {
    before_each: prepareTestNode,

    'Should apply a different name to each element': function () {
        testNode.innerHTML = "<div data-bind='uniqueName: true'></div><div data-bind='uniqueName: true'></div>";
        ko.applyBindings({}, testNode);

        value_of(testNode.childNodes[0].name.length > 0).should_be(true);
        value_of(testNode.childNodes[1].name.length > 0).should_be(true);
        value_of(testNode.childNodes[0].name == testNode.childNodes[1].name).should_be(false);
    }
});

describe('Binding: Checked', {
    before_each: prepareTestNode,

    'Should be able to control a checkbox\'s checked state': function () {
        var myobservable = new ko.observable(true);
        testNode.innerHTML = "<input type='checkbox' data-bind='checked:someProp' />";

        ko.applyBindings({ someProp: myobservable }, testNode);
        value_of(testNode.childNodes[0].checked).should_be(true);

        myobservable(false);
        value_of(testNode.childNodes[0].checked).should_be(false);
    },

    'Should update observable properties on the underlying model when the checkbox change event fires': function () {
        var myobservable = new ko.observable(false);
        testNode.innerHTML = "<input type='checkbox' data-bind='checked:someProp' />";
        ko.applyBindings({ someProp: myobservable }, testNode);

        testNode.childNodes[0].checked = true;
        ko.utils.triggerEvent(testNode.childNodes[0], "change");
        value_of(myobservable()).should_be(true);
    },

    'Should only notify observable properties on the underlying model *once* even if the checkbox change/click events fire multiple times': function () {
        var myobservable = new ko.observable();
        var timesNotified = 0;
        myobservable.subscribe(function() { timesNotified++ });
        testNode.innerHTML = "<input type='checkbox' data-bind='checked:someProp' />";
        ko.applyBindings({ someProp: myobservable }, testNode);

        // Multiple events only cause one notification...
        testNode.childNodes[0].checked = true;
        ko.utils.triggerEvent(testNode.childNodes[0], "change");
        ko.utils.triggerEvent(testNode.childNodes[0], "change");
        value_of(timesNotified).should_be(1);

        // ... until the checkbox value actually changes
        testNode.childNodes[0].checked = false;
        ko.utils.triggerEvent(testNode.childNodes[0], "change");
        value_of(timesNotified).should_be(2);
    },

    'Should update non-observable properties on the underlying model when the checkbox change event fires': function () {
        var model = { someProp: false };
        testNode.innerHTML = "<input type='checkbox' data-bind='checked:someProp' />";
        ko.applyBindings(model, testNode);

        testNode.childNodes[0].checked = true;
        ko.utils.triggerEvent(testNode.childNodes[0], "change");
        value_of(model.someProp).should_be(true);
    },

    'Should update observable properties on the underlying model when the checkbox is clicked': function () {
        var myobservable = new ko.observable(false);
        testNode.innerHTML = "<input type='checkbox' data-bind='checked:someProp' />";
        ko.applyBindings({ someProp: myobservable }, testNode);

        ko.utils.triggerEvent(testNode.childNodes[0], "click");
        value_of(myobservable()).should_be(true);
    },

    'Should update non-observable properties on the underlying model when the checkbox is clicked': function () {
        var model = { someProp: false };
        testNode.innerHTML = "<input type='checkbox' data-bind='checked:someProp' />";
        ko.applyBindings(model, testNode);

        ko.utils.triggerEvent(testNode.childNodes[0], "click");
        value_of(model.someProp).should_be(true);
    },

    'Should make a radio button checked if and only if its value matches the bound model property': function () {
        var myobservable = new ko.observable("another value");
        testNode.innerHTML = "<input type='radio' value='This Radio Button Value' data-bind='checked:someProp' />";

        ko.applyBindings({ someProp: myobservable }, testNode);
        value_of(testNode.childNodes[0].checked).should_be(false);

        myobservable("This Radio Button Value");
        value_of(testNode.childNodes[0].checked).should_be(true);
    },

    'Should set an observable model property to this radio button\'s value when checked': function () {
        var myobservable = new ko.observable("another value");
        testNode.innerHTML = "<input type='radio' value='this radio button value' data-bind='checked:someProp' />";
        ko.applyBindings({ someProp: myobservable }, testNode);

        ko.utils.triggerEvent(testNode.childNodes[0], "click");
        value_of(myobservable()).should_be("this radio button value");
    },

    'Should only notify observable properties on the underlying model *once* even if the radio button change/click events fire multiple times': function () {
        var myobservable = new ko.observable("original value");
        var timesNotified = 0;
        myobservable.subscribe(function() { timesNotified++ });
        testNode.innerHTML = "<input type='radio' value='this radio button value' data-bind='checked:someProp' /><input type='radio' value='different value' data-bind='checked:someProp' />";
        ko.applyBindings({ someProp: myobservable }, testNode);

        // Multiple events only cause one notification...
        ko.utils.triggerEvent(testNode.childNodes[0], "click");
        ko.utils.triggerEvent(testNode.childNodes[0], "change");
        ko.utils.triggerEvent(testNode.childNodes[0], "click");
        ko.utils.triggerEvent(testNode.childNodes[0], "change");
        value_of(timesNotified).should_be(1);

        // ... until you click something with a different value
        ko.utils.triggerEvent(testNode.childNodes[1], "click");
        value_of(timesNotified).should_be(2);
    },

    'Should set a non-observable model property to this radio button\'s value when checked': function () {
        var model = { someProp: "another value" };
        testNode.innerHTML = "<input type='radio' value='this radio button value' data-bind='checked:someProp' />";
        ko.applyBindings(model, testNode);

        ko.utils.triggerEvent(testNode.childNodes[0], "click");
        value_of(model.someProp).should_be("this radio button value");
    },

    'When a checkbox is bound to an array, the checkbox should control whether its value is in that array': function() {
        var model = { myArray: ["Existing value", "Unrelated value"] };
        testNode.innerHTML = "<input type='checkbox' value='Existing value' data-bind='checked:myArray' />"
                           + "<input type='checkbox' value='New value'      data-bind='checked:myArray' />";
        ko.applyBindings(model, testNode);

        value_of(model.myArray).should_be(["Existing value", "Unrelated value"]);

        // Checkbox initial state is determined by whether the value is in the array
        value_of(testNode.childNodes[0].checked).should_be(true);
        value_of(testNode.childNodes[1].checked).should_be(false);
        // Checking the checkbox puts it in the array
        ko.utils.triggerEvent(testNode.childNodes[1], "click");
        value_of(model.myArray).should_be(["Existing value", "Unrelated value", "New value"]);
        // Unchecking the checkbox removes it from the array
        ko.utils.triggerEvent(testNode.childNodes[1], "click");
        value_of(model.myArray).should_be(["Existing value", "Unrelated value"]);
    },

    'When a checkbox is bound to an observable array, the checkbox checked state responds to changes in the array': function() {
        var model = { myObservableArray: ko.observableArray(["Unrelated value"]) };
        testNode.innerHTML = "<input type='checkbox' value='My value' data-bind='checked:myObservableArray' />";
        ko.applyBindings(model, testNode);

        value_of(testNode.childNodes[0].checked).should_be(false);

        // Put the value in the array; observe the checkbox reflect this
        model.myObservableArray.push("My value");
        value_of(testNode.childNodes[0].checked).should_be(true);

        // Remove the value from the array; observe the checkbox reflect this
        model.myObservableArray.remove("My value");
        value_of(testNode.childNodes[0].checked).should_be(false);
    }
});
