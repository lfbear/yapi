const yapi = require('yapi.js');
const BaseController = require('controllers/base.js');
const WecomRobotModel = require('./WecomRobotModel');
const WecomRobotSender = require('./utils/wecom');

class WecomRobotsController extends BaseController {
  constructor(ctx) {
    super(ctx);
    this.Model = yapi.getInst(WecomRobotModel);
  }

  /**
   * 获取企业微信机器人信息
   * @interface wecom_robots/get
   * @method get
   * @returns {Object}
   */
  async show(ctx) {
    try {
      const projectId = ctx.request.query.project_id;
      if (!projectId) {
        return (ctx.body = yapi.commons.resReturn(null, 400, '项目ID不能为空'));
      }
      let model = await this.Model.getByProejctId(projectId);
      return (ctx.body = yapi.commons.resReturn(model))
    } catch (err) {
      return (ctx.body = yapi.commons.resReturn(null, 400, err.message));
    }
  }

  /**
   * 测试企业微信机器人是否正确
   * @interface wecom_robots/up
   * @method post
   * @returns {Object}
   */
  async test(ctx) {
    try {
      const url = ctx.request.body.url;
      if (!url) {
        return (ctx.body = yapi.commons.resReturn(null, 400, '企业微信机器人 Webhook 不能为空'));
      }
      let sender = new WecomRobotSender(url);
      let result = await sender.sendTestMessage();
      if (result && result.data && result.data.errcode === 0) {
        return (ctx.body = yapi.commons.resReturn(null));
      }
      return (ctx.body = yapi.commons.resReturn(null, 400, '测试失败'));
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 400, err.message);
    }
  }

  /**
   * 保存企业微信机器人信息
   * @interface wecom_robots/up
   * @method post
   * @returns {Object}
   */
  async update(ctx) {
    try {
      let params = ctx.request.body;
      params = yapi.commons.handleParams(params, {
        project_id: 'number',
      });

      if ((await this.checkAuth(params.project_id, 'project', 'edit')) !== true) {
        return (ctx.body = yapi.commons.resReturn(null, 405, '没有权限'));
      }

      const projectId = params.project_id;
      const hooks = params.hooks;

      if (!projectId) {
        return (ctx.body = yapi.commons.resReturn(null, 400, '项目ID不能为空'));
      }

      if (!this.$tokenAuth) {
        let auth = await this.checkAuth(projectId, 'project', 'edit');
        if (!auth) {
          return (ctx.body = yapi.commons.resReturn(null, 400, '没有权限'));
        }
      }

      let model = await this.Model.getByProejctId(projectId);
      let result = await this.createOrUpdate(projectId, hooks);
      ctx.body = yapi.commons.resReturn(result);

      // 更新日志
      let logData = {
        type: 'wecom_robots',
        project_id: projectId,
        current: {
          hooks: hooks
        },
        old: model ? { hooks: model.hooks } : { hooks: [] }
      };
      yapi.commons.saveLog({
        content: `**${this.getUsername()}** 更新了企业微信机器人的配置信息`,
        type: 'system',
        uid: this.getUid(),
        username: this.getUsername(),
        typeid: projectId,
        data: logData
      });
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 400, err.message);
    }
  }

  async createOrUpdate(projectId, hooks) {
    const uid = this.getUid();
    let model = await this.Model.getByProejctId(projectId);
    let payload = {
      project_id: projectId,
      hooks: hooks,
      updated_by_uid: uid,
      updated_at: yapi.commons.time()
    };
    if (!model) {
      let data = Object.assign(payload, {
        created_by_uid: uid,
        created_at: yapi.commons.time()
      });
      return await this.Model.save(data);
    } else {
      return await this.Model.update(model._id, payload);
    }
  }
}

module.exports = WecomRobotsController;
