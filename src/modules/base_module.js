(function (app, $) {
    "use strict";
    var eventSplitter = /\s+/;

    var eventsApi = function ($obj, name, ctx, callback) {
        var names = name.split(eventSplitter);
        if (names.length == 2) {
            var event = names[0], selector = names[1];
            $obj.on(event, selector, $.proxy(ctx[callback], ctx));
        } else if (names.length == 1) {
            var selfEvent = names[0];
            $obj.bind(selfEvent, $.proxy(ctx[callback], ctx));
        }
    };

    function BaseModule($el, config) {
        this.$el = $el;
        if(config){
            this.config = config;
        }
        this._construct.apply(this, arguments);
        this._bindEvents();
    }

    BaseModule.prototype = {
        constructor: BaseModule,
        name: 'Base module',
        initClass: 'module_init',
        events: function () {
            return {}
        },
        setId: function (id) {
            this._id = id;
        },
        init: function ($el) {
            this.$el.addClass(this.initClass);
        },
        _construct: function () {

        },
        _bindEvents: function () {
            var events = {};
            if (typeof this.events == 'object') {
                events = this.events;
            } else if (typeof this.events == 'function') {
                events = this.events();
            }
            //function, object
            for (var event in events) {
                eventsApi(this.$el, event, this, events[event]);
            }
        }
    };

    app.createModule('module.base', BaseModule, [], {});

})(app, jQuery);