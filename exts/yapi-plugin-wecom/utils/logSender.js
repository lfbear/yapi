const yapi = require("yapi.js");
const WecomRobotModel = require("../wecomRobotModel");
const ProjectModel = require("models/project");
const GroupModel = require("models/group")
const WecomRobotSender = require("./wecom");
const { HTMLParser, HTMLNodeToTextTranslater } = require("./html");
const Config = require("./config");

class SendLogViaDingDingSender {
  constructor(log) {
    this.log = log;
    this.dingdingModel = null;
  }

  //该方法仅支持project类型的通知
  async send() {
    if (!this.log || !this.log.content || this.log.content.length == 0) {
      yapi.commons.log("yapi-plugin-wecom: 没有推送内容，跳过通知。");
      return;
    }

    await this.retrieveModels();

    if (this.isNotNeedNotify()) {
      yapi.commons.log("yapi-plugin-wecom: 该项目未配置企业微信推送，跳过通知。");
      return;
    }

    if (this.log.data.current.status == 'undone' && this.log.data.old.status == 'undone') {
      yapi.commons.log("yapi-plugin-wecom: 未发布状态的接口不进行通知");
      return;
    }
    let node = HTMLParser.parse(this.log.content);
    this.addHostForNode(node);
    const text = new HTMLNodeToTextTranslater().translate(node);
    const projectInfo = await this.getProjectInfo(this.log.typeid);
    const projectName = projectInfo.name;
    const members = await this.getProjectMembers(projectInfo);
    let target = ''
    if (this.log.data.interface_id) {
      target = '/interface/api/' + this.log.data.interface_id
    } else {
      target = '/' + this.log.data.type
    }
    const targetURL = Config.instance.host + '/project/' + this.log.typeid + target

    //const markdown = new HTMLNodeToMarkdownTranslater().translate(node);
    this.dingdingModel.hooks.forEach((url) => {
      const sender = new WecomRobotSender(url);
      sender.sendMarkdown(text, projectName, targetURL, members);
      yapi.commons.log(`yapi-plugin-wecom: 已推送。text=${text}`);
    });
  }

  addHostForNode(node) {
    if (!node) {
      return;
    }
    if (node.type == "a") {
      let href = `${Config.instance.host}${node.getAttribute("href")}`;
      node.setAttribute("href", href);
    }
    node.children &&
      node.children.forEach((child) => {
        this.addHostForNode(child);
      });
  }

  async retrieveModels() {
    await this.retrieveDingDingModel();
  }

  async retrieveDingDingModel() {
    let Model = yapi.getInst(WecomRobotModel);
    this.dingdingModel = await Model.getByProejctId(this.log.typeid);
  }

  isNotNeedNotify() {
    return !(this.dingdingModel && this.dingdingModel.hooks && this.dingdingModel.hooks.length > 0);
  }

  async getProjectInfo(projectId) {
    try {
      let model = yapi.getInst(ProjectModel);
      let proj = await model.get(projectId);
      return proj;
    } catch (e) {
      yapi.commons.log(`yapi-plugin-wecom: 获取项目信息失败。 error = ${e.message || ''}`)
    }
  }

  async getGroupInfo(groupId) {
    try {
      let model = yapi.getInst(GroupModel);
      let group = await model.get(groupId);
      return group;
    } catch (e) {
      yapi.commons.log(`yapi-plugin-wecom: 获取组信息失败。 error = ${e.message || ''}`)
    }
  }

  async getProjectMembers(projectInfo) {
    let projectMembers = []
    projectInfo.members.forEach(e => {
      if (e.email_notice) {
        projectMembers.push(this.transToMembersWecomID(e.email))
      }
    });
    let groupInfo = await this.getGroupInfo(projectInfo.group_id)
    groupInfo.members.forEach(e => {
      projectMembers.push(this.transToMembersWecomID(e.email))
    });
    return Array.from(new Set(projectMembers));
  }

  transToMembersWecomID(email) {
    let wecomId = email.replace('@snaplii.com', '').replace('.', '')
    const customMap = {
      'jimtang': 'jim.tee',
      'joseph.cui': 'AiFeng',
      'lucy.jin': 'Lucyjin',
    }
    if (customMap.hasOwnProperty(wecomId)) {
      return customMap[wecomId]
    } else {
      return wecomId
    }
  }
}

module.exports = {
  SendLogViaDingDingSender,
};
