const axios = require('axios');

/**
 * 企业微信机器人消息推送封装
 */
class WecomRobotSender {
    constructor(url) {
        this.url = url;
    }

    async sendMarkdown(text, project, target, members) {
        //拼接需要at的人
        let mentioned = ''
        members.forEach(e => {
            mentioned += '<@' + e + '> '
        })
        if (mentioned.length > 0) {
            mentioned = "\n<font color='comment'>请项目组员: " + mentioned + ' 关注</font>'
        }
        //组合mardown内容
        let desc = "\n接口归属项目: " + project + "\n接口文档地址: " + target
        let payload = {
            msgtype: 'markdown',
            markdown: {
                'content': '**' + text + '**' + desc + mentioned
            }
        };

        let result = await this.send(payload);
        return result;
    }

    async sendTestMessage() {
        const title = '测试 - YAPI企业微信推送机器人';
        const text = '这是一条测试消息，当看到这条消息时，证明该机器人配置可以正常使用。';
        return await this.sendMarkdown(title, text);
    }

    async send(data) {
        return await axios.post(this.url, data);
    }
}

module.exports = WecomRobotSender
