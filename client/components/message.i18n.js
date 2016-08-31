import { defineMessages } from 'react-intl';

const messages = defineMessages({
  moduleOrders: {
    id: 'component.module.orders',
    defaultMessage: '订单中心',
  },
  moduleTransport: {
    id: 'component.module.transport',
    defaultMessage: '国内运输',
  },
  moduleClearance: {
    id: 'component.module.clearance',
    defaultMessage: '进出口清关',
  },
  moduleForwarding: {
    id: 'component.module.forwarding',
    defaultMessage: '国际货运',
  },
  moduleInventory: {
    id: 'component.module.inventory',
    defaultMessage: '库存管理',
  },
  moduleTracking: {
    id: 'component.module.tracking',
    defaultMessage: '全程追踪',
  },
  moduleDatacenter: {
    id: 'component.module.datacenter',
    defaultMessage: '数据中心',
  },
  moduleIntegration: {
    id: 'component.module.integration',
    defaultMessage: '整合中心',
  },
  userSetting: {
    id: 'component.user.setting',
    defaultMessage: '个人设置',
  },
  pwdSetting: {
    id: 'component.user.pwdsetting',
    defaultMessage: '修改密码',
  },
  userLogout: {
    id: 'component.user.logout',
    defaultMessage: '退出登录',
  },
  userLanguage: {
    id: 'component.user.language',
    defaultMessage: '语言设置',
  },
  chinese: {
    id: 'root.chinese',
    defaultMessage: '中文',
  },
  english: {
    id: 'root.english',
    defaultMessage: '英文',
  },
  defaultCascaderRegion: {
    id: 'component.region.default.cascader.region',
    defaultMessage: '省/市/区',
  },
  selectCountry: {
    id: 'component.region.select.country',
    defaultMessage: '选择国家或地区',
  },
  emptyPartnerInfo: {
    id: 'component.partner.empty.info',
    defaultMessage: '合作伙伴名称和代码不能为空',
  },
  partnerExist: {
    id: 'cooperation.partner.new.exist',
    defaultMessage: '已经邀请或者建立合作伙伴',
  },
  offlinePartnerExist: {
    id: 'cooperation.offline.partner.new.exist',
    defaultMessage: '已经添加为线下合作伙伴',
  },
  sendInvitation: {
    id: 'component.partner.send.invitation',
    defaultMessage: '发送邀请',
  },
  iknow: {
    id: 'component.partner.iknow',
    defaultMessage: '知道了',
  },
  newPartner: {
    id: 'component.partner.new',
    defaultMessage: '添加合作伙伴',
  },
  partner: {
    id: 'component.partner',
    defaultMessage: '合作伙伴:',
  },
  companyNamePlaceholder: {
    id: 'component.company.name.placeholder',
    defaultMessage: '请输入公司名称',
  },
  partnerCode: {
    id: 'component.partner.code',
    defaultMessage: '企业代码:',
  },
  partnerCodePlaceholder: {
    id: 'component.partner.code.placeholder',
    defaultMessage: '合作伙伴企业代码或客户代码',
  },
  partnership: {
    id: 'component.partnership',
    defaultMessage: '伙伴关系:',
  },
  customer: {
    id: 'component.customer',
    defaultMessage: '客户',
  },
  provider: {
    id: 'component.provider',
    defaultMessage: '供应商',
  },
  invitationForOffline: {
    id: 'component.invitation.forOffline',
    defaultMessage: '对方还不是平台用户,请填写邮箱/手机号发送邀请',
  },
  contactPlaceholder: {
    id: 'component.contact.placeholder',
    defaultMessage: '输入邮箱/手机号码',
  },
  invitationSent: {
    id: 'component.invitation.sent',
    defaultMessage: '已发送邀请',
  },
  invitationSentNotice: {
    id: 'component.invitation.sent.notice',
    defaultMessage: `对方是{isPlatformTenant, select,
      true {平台}
      false {线下}
    }用户,已发送合作伙伴邀请`,
  },
  contactMissing: {
    id: 'component.partner.contact.missing',
    defaultMessage: '请输入联系方式',
  },
  invitePartner: {
    id: 'component.partner.invite',
    defaultMessage: '邀请合作伙伴',
  },
  fillPartnerContact: {
    id: 'component.partner.fill.contact',
    defaultMessage: '请填写邀请合作伙伴"{partnerName}"的联系方式',
  },
  appEditorTitle: {
    id: 'component.appEditor.title',
    defaultMessage: '设置开通的应用',
  },
  appEditorNameCol: {
    id: 'component.appEditor.nameCol',
    defaultMessage: '应用名称',
  },
  appEditorSetCol: {
    id: 'component.appEditor.setCol',
    defaultMessage: '开通状态',
  },
  detail: {
    id: 'corp.messageList.detail',
    defaultMessage: '详情',
  },
});

export default messages;
