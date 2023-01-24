import WecomRobotView from './views/form';

module.exports = function () {
    this.bindHook('sub_setting_nav', (router) => {
        router.Wecom = {
            name: '企业微信',
            component: WecomRobotView
        }
    })
}
