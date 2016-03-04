/*Copyright (c) 2016 Ewgeniy Kiselev <demroos@yandex.ru>

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be included
 in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
(function ($, w, d) {
    var $d = $(d);
    var app = {
        modules: {},
        waitModules: {},
        objects: {},
        init_modules: {},
        modules_count: 0,
        getCookie: function (name) {
            var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        },
        setCookie: function (name, val, root, time) {
            var opt = {};
            opt.root = root || '/';
            opt.time = time || 60000;
            var date = new Date(new Date().getTime() + opt.time);
            document.cookie = name + "=" + val + "; path=" + opt.root + "; expires=180";
        },
        delCookie: function (name) {
            var date = new Date(0);
            document.cookie = name + "=; path=/; expires=" + date.toUTCString();

        },
        genId: function(){
            return 'id-' + Math.random().toString(36).substr(2, 16);
        },
        /**
         *
         * @param id
         * @returns app.base_objects
         */
        getObject: function (id) {
            if (!id) return false;

            if (typeof app.objects[id] == 'undefined') {
                app.objects[id] = new app.base_objects(id);
            }
            var object = app.objects[id];
            return object;
        },
        inherit: function (Child, Parent) {
            var Inheritance = function () {
            };
            Inheritance.prototype = Parent.prototype;

            Child.prototype = new Inheritance();
            Child.prototype.constructor = this;
            Child.superClass = Parent;
        },
        inheritExt: function (Child, Parent) {
            var Inheritance = function () {
                Parent.apply(this, arguments);
            };
            Inheritance.prototype = Object.create(Parent.prototype);
            for (var k in Child) {
                if (Child.hasOwnProperty(k)) {
                    Inheritance.prototype[k] = Child[k];
                }
            }
            Inheritance.prototype.super = Parent.prototype;
            return Inheritance;
        },
        mixin: function (Class, Mixin) {
            for (var key in Mixin) Class.prototype[key] = Mixin[key];
        },
        extend: function (Class, Mixin) {
            for (var prop in Mixin) {
                Class[prop] = Mixin[prop];
            }
        },
        getWeekDay: function (date) {
            date = date || new Date();
            var days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            var day = date.getDay();

            return days[day];
        },

        getMonthWord: function (date) {
            date = date || new Date();
            var months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря', 'февраля'];
            var month = date.getMonth();

            return months[month];
        },

        addModule: function (name, module) {
            //this.mixin(module, this._mixins.event);
            this.modules[name] = module;
            this.trigger('add_module', {name: name});
            return this;
        },
        initModules: function ($root) {
            var $modules = $root.find('.js');
            var not_init_modules = {};
            app.logger.info('Find ' + $modules.length + ' modules.');
            $modules.each(function () {
                var $this = $(this),
                    module = $this.data('module'),
                    config = $this.data('config'),
                    notInited = (module !== undefined && $this.data(module) == undefined);
                if (notInited) {
                    var item = {};
                    item.$el = $this;
                    item.config = config;
                    if (typeof not_init_modules[module] !== 'undefined') {
                        not_init_modules[module].push(item);
                    } else {
                        not_init_modules[module] = [];
                        not_init_modules[module].push(item);
                    }
                }
            });

            for (var name in not_init_modules) {
                app.waitModule(not_init_modules[name], name);
            }

        },
        waitModule: function (array, module) {
            if (typeof app.waitModules[module] !== 'undefined') {
                if (app.waitModules[module] > 30) {
                    app.logger.info('End time for wait ' + module);
                    return false;
                } else {
                    app.waitModules[module]++;
                }
            } else {
                app.waitModules[module] = 1;
            }
            if (typeof app.modules[module] !== 'undefined') {
                array.forEach(function (item) {
                    var oModule = new app.modules[module](item.$el, item.config);
//                    oModule.addEvent('change', function () {
//                        console.log('Module ' + module + ' is changed.');
//                    });
                    oModule.setId(app.genId());
                    oModule.init();
                    item.$el.data(module, oModule);
                    if (typeof app.init_modules[module] == 'undefined') {
                        app.init_modules[module] = []
                    }
                    app.init_modules[module].push(oModule);
                    app.modules_count++;
                });
                app.logger.info('Initialization modules type <' + module + '> finished. Total ' + app.modules_count);
            } else {
                //console.log('Wait 0.5 sec for load ' + module);
//                setTimeout(function () {
//                    app.waitModule(array, module);
//                }, 500);
                app.on('add_module', function (data) {
                    if (data.name == module) {
                        app.waitModule(array, module);
                    }
                });
            }

        },
        getDomModules: function ($root, name) {
            var modules = [];
            $('.js', $root).each(function () {
                var module = $(this).data(name);
                modules.push(module);
            });
            return modules;
        },
        initComponents: function ($root) {
            $root.find('.js').each(function () {
                var $this = $(this),
                    component = $this.data('component');
                if (component) {
                    $this[component]();
                }
            });
        },
        ajax: function (params) {
            var d = $.Deferred();
            $.ajax(params)
                .done(function (data) {
                    var $data = $(data),
                        $cont = $('<div></div>');
                    $cont.html($data);
                    app.initComponents($cont);
                    app.initModules($cont);
                    d.resolve($data);
                })
                .error(function (e) {
                    d.reject(e);
                });
            return d.promise();
        },
        createModule: function (name, parent, mixins, object) {
            var module = null;
            if (mixins.length > 0) {
                for (var n = 0; n < mixins.length; n++) {
                    app.extend(object, app._mixins[mixins[n]])
                }
            }
            if (typeof parent == 'function') {
                module = app.inheritExt(object, parent)

            } else if (typeof parent == 'string') {
                module = app.inheritExt(object, app.modules[parent])
            }
            if (module != null) {
                app.addModule(name, module);
            }
        },
        logger: {
            info: function (msg) {
                console.log(msg);
            },
            error: function(msg){
                console.log(msg);
            }
        }
    };
    $(d).ready(function () {
        app.initComponents($d);
        app.initModules($d);
    });
    w.app = app;
})(jQuery, window, document);
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

    //MIXINS
    app._mixins = {};
    app._mixins.event = {

        //_eventHandlers: {},

        /**
         * Подписка на событие
         * Использование:
         *  menu.on('select', function(item) { ... }
         */
        on: function (eventName, handler) {
            if (typeof this._eventHandlers == 'undefined') {
                this._eventHandlers = {};
            }
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
            if (typeof this._eventHandlers == 'undefined') {
                this._eventHandlers = {};
            }
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
            if (typeof this._eventHandlers == 'undefined') {
                this._eventHandlers = {};
            }
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
/**
 * Created by John on 26.06.14.
 */
(function (w, d, app) {
    "use strict";
    app.extend(app, app._mixins.event);
    app.on('add_module', function (data) {
        app.logger.info("Loaded module <" + data.name + ">");
    });
})(window, document, app);
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