(function (app, $) {
    "use strict";
    var eventSplitter = /\s+/;

    var eventsApi = function ($obj, name, ctx, callback) {
        var names = name.split(eventSplitter);
        if (names.length == 2) {
            var event = names[0], selector = names[1];
            $obj.on(event, selector, $.proxy(ctx[callback], ctx));
        }
    };

    function BaseModule($el) {
        this.$el = $el;
        this._construct(arguments);
        this._bindEvents();
    }

    BaseModule.prototype = {
        constructor: BaseModule,
        name: 'Base module',
        initClass: 'module_init',
        events: {},
        init: function ($el) {
            this.$el.addClass(this.initClass);
        },
        _construct: function () {

        },
        _bindEvents: function () {
            for (var event in this.events) {
                eventsApi(this.$el, event, this, this.events[event]);
            }
        }
    };

    app.createModule('module.base', BaseModule, [], {});

})(app, jQuery);