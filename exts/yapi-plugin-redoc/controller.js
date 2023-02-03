const baseController = require('controllers/base.js');
const interfaceModel = require('models/interface.js');
const yapi = require('yapi.js');
const index = require('./index')

class redocController extends baseController {

  constructor(ctx) {
    super(ctx);
  }

  /**
   * oauth2回调
   * @param {*} ctx 
   */
  async redocRender(ctx) {
    try {
      // 获取code和state  
      let id = ctx.params.id;
      if (isNaN(id)) {
        ctx.status = 404;
        ctx.body = "<h3>API ID is not existed</h3>"
        return
      }
      let item = await yapi.getInst(interfaceModel).get(id)
      if (!item) {
        ctx.status = 404;
        ctx.body = "<h3>API ID is not existed</h3>"
        return
      }
      if (!item.api_opened || item.status != 'done') {
        ctx.status = 403;
        ctx.body = "<h3>API Doc is incomplete or non-public.</h3>"
        return
      }
      ctx.body = yapi.commons.body = `<!DOCTYPE html>
      <html>
        <head>
          <title>`+ item.title + ` - Redoc</title>
          <!-- needed for adaptive design -->
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
          <style>
            body {
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          <redoc spec-url='//`+ index.options.host + `/api/plugin/exportSwagger?type=Online&iid=` + id + `' disable-search></redoc>
          <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"> </script>
        </body>
      </html>`

    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 400, err.message);
    }
  }
}

module.exports = redocController;