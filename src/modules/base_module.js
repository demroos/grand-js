(function (app, $) {
    "use strict";
    var eventSplitter = /\s+/;

    var eventsApi = function ($obj, name, ctx, callback) {
        var names = name.split(eventSplitter);
        if (names.length == 2) {
            var event = names[0], selector = names[1];
            $obj.on(event, selector, $.proxy(ctx[callback], ctx));
        }
        if (names.length == 1) {
            var selfevent = names[0];
            $obj.bind(selfevent, $.proxy(ctx[callback], ctx));
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
        mixins: [],
        events: {},
        setId: function(id){
            this._id = id;
        },
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