var FormMonitorElements;

var FormMonitor = Class.create({
    initialize: function(options) {
	this._make_handlers();
	this.options = Object.extend(this.defaults(), options || {});
	this._form = $(this.options.form);
	this._elements = {};
	this._form.select(this.options.inputs)
	    .map(function(element) {
		var handler = this.options.typemap[element.type]
		    || this.options.typemap["default"];
		var data = {
		    element: element,
		    changed: false,
		    handler: handler
		};
		handler.start(data, this);
		element.observe("focus", this.onfocus);
		element.observe("blur", this.onblur);
		return data;
	    }.bind(this))
	    .each(function(data) {
		this._elements[data.element.identify()] = data;
	    }.bind(this));

	this._submits = this._form.select(this.options.submits);
	this._submits.each(function(submit) { submit.disable() });
	if (this.options.onsubmit != null) {
	    this._form.observe("submit", this.onsubmit);
	}
	if (this.options.onleave != null)
	{ } // nothing yet
	this.changes = 0;
    },
    defaults: function() {
	return Object.extend({}, {
	    inputs: "input:not([type=hidden]), select, textarea",
	    submits: "input[type=submit]",
	    typemap: FormMonitorElements,
	    onchanged: null,
	    onunchanged: null,
	    onsubmit: null,
	    onleave: null
	});
    },
    _make_handlers: function() {
	this.onfocus = function(ev) {
	    var entry = this._elements[ev.target.identify()];
	    entry.handler.onfocus(entry, this);
	}.bind(this);
	this.onblur = function(ev) {
	    var entry = this._elements[ev.target.identify()];
	    entry.handler.onfocus(entry, this);
	}.bind(this);
	this.onchange = function(ev) {
	    // handles anything that might cause a change
	    var entry = this._elements[ev.target.identify()];
	    var new_changed = entry.handler.changed(entry);
	    var old_changes = this.changes;
	    if (new_changed && !entry.changed) {
		++this.changes;
	    }
	    else if (!new_changed && entry.changed) {
		--this.changes;
	    }
	    entry.changed = new_changed;
	    if (this.options.onchanged != null && old_changes == 0
		&& this.changes != 0) {
		this.options.onchanged(this);
	    }
	    else if (this.options.onunchanged != null && old_changes != 0
		     && this.changes == 0) {
		this.options.onunchanged(this);
	    }
	}.bind(this);
	this.onsubmit = function(ev) {
	    this.options.onsubmit(ev, this);
	}.bind(this);
	this.onleave = function(ev) {
	    this.options.onsubmit(ev, this);
	}.bind(this);
    },
    form: function() {
	return this._form;
    },
    submits: function() {
	return this._submits;
    },
    changed: function() {
	return this.changes != 0;
    }
});

FormMonitor.Element = {};
FormMonitor.Element.Value = Class.create({
    start: function(data, monitor) {
	data.value = data.element.defaultValue;
    },
    changed: function(data) {
	return data.value != data.element.value;
    },
    onfocus: function(data, monitor) {
	data.element.observe("change", monitor.onchange);
	data.element.observe("keyup", monitor.onchange);
    },
    onblur: function(data, monitor) {
	data.element.stopObserving("change", monitor.onchange);
	data.element.stopObserving("keyup", monitor.onchange);
    },
});

FormMonitor.Element.Button = Class.create({
    start: function(data, monitor) {
	data.element.observe("click", monitor.onchange);
	data.checked = data.element.defaultChecked;
    },
    changed: function(data) {
	return data.checked != data.element.checked;
    },
    onfocus: function() {},
    onblur: function() {}
});

FormMonitor.Element.SelectOne = Class.create({
    start: function(data, monitor) {
	data.element.observe("click", monitor.onchange);
	data.selection = data.element.selectedIndex;
    },
    changed: function(data) {
	return data.selection != data.element.selectedIndex;
    },
    onfocus: function(data, monitor) {
	data.element.observe("change", monitor.onchange);
	data.element.observe("keyup", monitor.onchange);
    },
    onblur: function(data, monitor) {
	data.element.stopObserving("change", monitor.onchange);
	data.element.stopObserving("keyup", monitor.onchange);
    }
});

FormMonitor.Element.SelectMultiple = Class.create({
    start: function(data, monitor) {
	data.element.observe("click", monitor.onchange);
	data.selection = data.element.getValue();
    },
    changed: function(data) {
	var new_value = data.element.getValue();
	if (data.selection.length != new_value.length) {
	    return true;
	}

	for (var i = 0; i < new_value.length; ++i) {
	    if (new_value[i] != data.selection[i]) {
		return true;
	    }
	}
	return false;
    },
    onfocus: function(data, monitor) {},
    onblur: function(data, monitor) {}
});

FormMonitorElements = (function() {
    var button = new FormMonitor.Element.Button();
    return {
        default: new FormMonitor.Element.Value(),
	checkbox: button,
	radio: button,
	"select-one": new FormMonitor.Element.SelectOne(),
	"select-multiple": new FormMonitor.Element.SelectMultiple()
    };
})();

var FormsMonitor = Class.create({
    initialize: function(options) {
	this.options = Object.extend(this.defaults(), options || {});
	this.forms = $$(this.options.forms).map(function(form) {
	    return new FormMonitor(Object.extend({ form: form }, this.options));
	}.bind(this));
    },
    defaults: function() {
	return Object.extend({}, {
	    forms: "form"
	});
    }
});

// use FormsMonitor to control submit and changes
var ChangeMonitor = Class.create({
    initialize: function(options) {
	this.options = Object.extend(this.defaults(), options);
	this.monitor = new FormsMonitor(this.options);
    },
    defaults: function() {
	return {
	    onchanged: function(monitor) {
		monitor.submits().each(function(submit) {
		    submit.enable();
		});
	    },
	    onunchanged: function(monitor) {
		monitor.submits().each(function(submit) {
		    submit.disable();
		});
	    },
	    onleave: function(monitor) {
	    },
	    onsubmit: function(ev, monitor) {
	    }
	};
    }
});