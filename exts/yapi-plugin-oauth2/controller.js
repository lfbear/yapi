const baseController = require('controllers/base.js');
const yapi = require('yapi.js');
const request = require('request');
const index = require('./index')

class oauth2Controller extends baseController {

  constructor(ctx) {
    super(ctx);
  }

  /**
   * oauth2回调
   * @param {*} ctx 
   */
  async oauth2Callback(ctx) {
    try {
      // 获取code和state  
      let oauthcode = ctx.request.query.code;
      if (!oauthcode) {
        return (ctx.body = yapi.commons.resReturn(null, 400, 'code不能为空'));
      }
      let oauthstate = ctx.request.query.state;
      if (!oauthstate) {
        return (ctx.body = yapi.commons.resReturn(null, 400, 'state不能为空'));
      }
      let ops = index.options;
      // 通过code获取token

      let postData = {
        "client_id": ops.appId,
        "client_secret": ops.appSecret,
        "code": oauthcode,
        "grant_type": "authorization_code",
        "redirect_uri": ops.redirectUri,
      }
      let tokenURL = ops.hostscheme + "://" + ops.hostname + ops.tokenPath
      let tokenResult = await this.requestInfo(tokenURL, postData).then
        (function (res) {
          ctx.redirect('/api/user/login_by_token?token=' + res.access_token);
        }).catch(function (rej) {
          return {
            status_code: rej.statuscode,
            message: rej.statusMessage
          };
        });
      return ctx.body = yapi.commons.resReturn(tokenResult, 401, "授权失败");
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 400, err.message);
    }
  }

  /**
   * post请求封装
   * @param {*} url 
   * @param {*} data
   */
  requestInfo(url, data) {
    return new Promise((resolve, reject) => {
      let options = {
        url: url,
        form: data
      }
      request.post(options, (err, res, body) => {
        if (err) {
          console.log("http error: ", err)
          reject({ message: 'request error' });
        } else {
          let res_json = JSON.parse(body)
          if (res.statusCode != 200) {
            reject({ statuscode: res.statusCode, statusMessage: res_json.error });
          } else {
            resolve(res_json);
          }
        }
      })
    });
  }
}

module.exports = oauth2Controller;