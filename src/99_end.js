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