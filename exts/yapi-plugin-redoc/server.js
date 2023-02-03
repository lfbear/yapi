const controller = require('./controller');

module.exports = function (options) {
  this.bindHook('add_router', function (addRouter) {
    addRouter({
      controller: controller,
      method: 'get',
      path: 'redoc/:id',
      action: 'redocRender'
    });
  });
}