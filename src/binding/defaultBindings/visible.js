ko.bindingHandlers['visible'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var isCurrentlyVisible = !(element.style.display == "none");
        if (value && !isCurrentlyVisible) {
            element.style.display = "";
            element.removeAttribute("aria-hidden");
        }
        else if ((!value) && isCurrentlyVisible) {
            element.style.display = "none";
            element.setAttribute("aria-hidden","true");
        }
    }
};
