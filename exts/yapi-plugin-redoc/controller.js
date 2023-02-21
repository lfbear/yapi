const baseController = require('controllers/base.js');
const interfaceModel = require('models/interface.js');
const catModel = require('models/interfaceCat.js');
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
      let type = ctx.params.type || 'interface';
      let id = ctx.params.id;
      if (isNaN(id)) {
        ctx.status = 404;
        ctx.body = "<h3>API ID is not existed</h3>"
        return
      }
      let pageTitle = ''
      let srcPath = ''
      let item = {}
      if (type === 'interface') {
        item = await yapi.getInst(interfaceModel).get(id)
        pageTitle = item.title
        srcPath = 'exportInterface'
      } else if (type === 'cat') {
        item = await yapi.getInst(catModel).get(id)
        pageTitle = item.name
        srcPath = 'exportCatInterface'
      } else {
        ctx.status = 404;
        ctx.body = "<h3>Unknown Type</h3>"
        return
      }

      if (!item) {
        ctx.status = 404;
        ctx.body = "<h3>API ID is not existed</h3>"
        return
      }
      if (type === 'interface' && (!item.api_opened || item.status != 'done')) {
        ctx.status = 403;
        ctx.body = "<h3>API Doc is incomplete or non-public.</h3>"
        return
      }

      ctx.body = yapi.commons.body = `<!DOCTYPE html>
      <html>
        <head>
          <title>`+ pageTitle + ` - Redoc</title>
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
          <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
          <script>
              mermaid.initialize({startOnLoad: true});
          </script>
        </head>
        <body>
          <redoc spec-url='//`+ index.options.host + `/api/plugin/` + srcPath + `?id=` + id + `' disable-search></redoc>
          <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"> </script>
          <script>
          let renderedMermaidId = 0;
          const nextId = () => {
              renderedMermaidId++;
              return renderedMermaidId;
          };
          const renderMermaidDiagrams = () => {
              let mermaidNodes = document.querySelectorAll("pre > code.language-mermaid");
              for (const nv of mermaidNodes) {
                  let nextIdz = `+'`mermaid-${nextId()}`;'+`
                  let codz = nv.textContent;
                  mermaid.render(nextIdz, codz, svg => nv.parentNode.outerHTML = svg)
              }
          };
          setTimeout(() => {
            renderMermaidDiagrams();
          }, "500")
          </script>
        </body>
      </html>`

    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 400, err.message);
    }
  }
}

module.exports = redocController;