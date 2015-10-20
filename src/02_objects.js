/**
 * Created by John on 26.06.14.
 */
(function (w, d, app) {
    "use strict";
    var defaultopt = {
        success_cb: function () {

        },
        error_cb: function () {

        }
    };

    function base_object(id, type) {
        this.id = id;
        this.data = {};
        this.events = {};
        var object = this;

        function set(name, value) {
            object.data[name] = value;
        }

        function setData(data) {
            object.data = data;
        }

        function save(success, error) {
            var scb = success || defaultopt.success_cb;
            var ecb = error || defaultopt.error_cb;
            var data = {data: {}};
            data.data[object.id] = object.data;
            $.ajax({
                url: '/manager/saveObject/' + object.id + '.json',
                data: data,
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    if (typeof data.save !== 'undefined' && data.save == 1) {
                        app.notification.add('Сохранение успешно', 'success');
                        object.trigger('save', object.data);
                    } else {
                        app.notification.add('Сохранение не успешно', 'error');
                        object.trigger('error.save', arguments);
                    }
                    scb(data);
                },
                error: function (xhr, textStatus) {
                    ecb();
                }
            });
        }

        this.addEvent = function (name, func) {
            if (typeof object.events == 'undefined') {
                object.events = {};
            }
            if (typeof object.events[name] != 'undefined') {
                var event = object.events[name];
                if (typeof event.funcs == 'undefined') {
                    event.funcs = [];
                }
                event.funcs.push(func);
            } else {
                object.events[name] = {
                    funcs: []
                };
                object.events[name].funcs.push(func);
            }
        };

        this.trigger = function (event, data) {
            if (typeof object.events[event] !== 'undefined') {
                object.events[event].funcs.forEach(function (func) {
                    var nData = data || {};
                    func(nData);
                });
            } else {
                app.logger.info('Event <' + event + '> not found');
            }
        };

        return {
            set: set,
            save: save,
            setData: setData,
            addEvent: object.addEvent,
            trigger: object.trigger
        }
    }

    app.base_objects = base_object;

    //base module
    function Base_module($el, config) {
        this.events = {};
    }

    Base_module.prototype.addEvent = function (name, func) {
        if (typeof this.events == 'undefined') {
            this.events = {};
        }
        if (typeof this.events[name] != 'undefined') {
            var event = this.events[name];
            if (typeof event.funcs == 'undefined') {
                event.funcs = [];
            }
            event.funcs.push(func);
        } else {
            this.events[name] = {
                funcs: []
            };
            this.events[name].funcs.push(func);
        }
    };

    Base_module.prototype.trigger = function (event, data) {
        if (this.events[event] != undefined) {
            this.events[event].funcs.forEach(function (func) {
                var nData = data || {};
                func(nData);
            });
        }
    };

    app.Base_module = Base_module;
    //MIXINS
    app._mixins = {};
    app._mixins.event = {

        _eventHandlers: {},

        /**
         * Подписка на событие
         * Использование:
         *  menu.on('select', function(item) { ... }
         */
        on: function (eventName, handler) {
            if (!this._eventHandlers[eventName]) {
                this._eventHandlers[eventName] = [];
            }
            this._eventHandlers[eventName].push(handler);
        },

        /**
         * Прекращение подписки
         *  menu.off('select',  handler)
         */
        off: function (eventName, handler) {
            var handlers = this._eventHandlers[eventName];
            if (!handlers) return;
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i] == handler) {
                    handlers.splice(i--, 1);
                }
            }
        },

        /**
         * Генерация события с передачей данных
         *  this.trigger('select', item);
         */
        trigger: function (eventName /*, ... */) {

            if (!this._eventHandlers[eventName]) {
                return; // обработчиков для события нет
            }

            // вызвать обработчики
            var handlers = this._eventHandlers[eventName];
            for (var i = 0; i < handlers.length; i++) {
                handlers[i].apply(this, [].slice.call(arguments, 1));
            }

        }
    };

    //BEM
    var getModClass = function (cls, name, value) {
        return cls + "_" + name + "_" + value;
    };

    app._mixins.bem = {
        addMod: function (name, value) {
            var cls = getModClass(this.class, name, value);
            this.$el.addClass(cls);
        },
        delMod: function (name, value) {
            var cls = getModClass(this.class, name, value);
            this.$el.removeClass(cls);
        }
    };
})(window, document, app);