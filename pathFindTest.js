/**
 * Created by John on 12.05.16.
 */
(function () {
    function pathToValue(path, object, def) {
        var clsArray = path.split('.');
        var key = clsArray.shift();
        if (typeof object[key] === 'object') {
            return pathToValue(clsArray.join('.'), object[key], def);
        } else if (object[key] != 'undefined') {
            return object[key];
        } else {
            return def;
        }
    }

    var GrandJs = {
        CreateObject: function (path, options) {
            var cls = pathToValue(path, this, null);
            if (cls != null) {
                return new cls(options);
            } else {
                throw Error('Class not found');
            }
        }
    };

    GrandJs.Validators = {
        email: function (value, options) {

        }
    };

    /**
     *
     * @param rules
     * @constructor
     */
    function Form(rules) {
        this.rules = rules;
        this.errors = {};
    }

    var fn = Form.prototype;

    fn.load = function (data) {
        this.data = data;
        console.log(data);
        return this;
    };

    fn.validate = function () {
        this.rules.forEach(function (item) {
            var fields = item.shift();
            var validateName = item.shift();
            var options = item.length ? item : {};
            var obj = GrandJs.CreateObject('Validators.' + validateName, {});
        });
    };

    GrandJs.Form = Form;

    window.GrandJs = GrandJs;
})();