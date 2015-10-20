(function ($, w, d) {
    var $d = $(d);
    var app = {
        modules: {},
        waitModules: {},
        objects: {},
        init_modules: [],
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
                    config = $this.data('config');
                if (module !== undefined) {
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
        ajax: function (params, success) {
            var set = params;
            set.success = function (data) {
                var $data = $(data),
                    $cont = $('<div></div>');
                $cont.html($data);
                app.initComponents($cont);
                app.initModules($cont);
                var $reshtml = $cont.html();
                if (success) {
                    success($data)
                }
            };
            return $.ajax(set);
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
            }
        }
    };
    $(d).ready(function () {
        app.initComponents($d);
        app.initModules($d);
    });
    w.app = app;
})(jQuery, window, document);