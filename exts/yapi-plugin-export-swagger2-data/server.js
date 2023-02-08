const exportSwaggerController = require('./controller');

module.exports = function () {
    this.bindHook('add_router', function (addRouter) {
        addRouter({
            controller: exportSwaggerController,
            method: 'get',
            path: 'exportSwagger',
            action: 'exportProject'
        });
        addRouter({
            controller: exportSwaggerController,
            method: 'get',
            path: 'exportInterface',
            action: 'exportInterface'
        });
        addRouter({
            controller: exportSwaggerController,
            method: 'get',
            path: 'exportCatInterface',
            action: 'exportCatInterface'
        });
    })
}