import { defineMessages } from 'react-intl';

const messages = defineMessages({
  moduleImport: {
    id: 'admin.module.import',
    defaultMessage: '进口报关',
  },
  moduleExport: {
    id: 'admin.module.export',
    defaultMessage: '出口报关',
  },
  moduleTransport: {
    id: 'admin.module.transport',
    defaultMessage: '国内运输',
  },
  moduleForwarding: {
    id: 'admin.module.forwarding',
    defaultMessage: '货代协同',
  },
  moduleInventory: {
    id: 'admin.module.inventory',
    defaultMessage: '库存管理',
  },
  moduleTracking: {
    id: 'admin.module.tracking',
    defaultMessage: '全程追踪',
  },
  moduleDatacenter: {
    id: 'admin.module.datacenter',
    defaultMessage: '数据中心',
  },
  moduleIntegration: {
    id: 'admin.module.integration',
    defaultMessage: '整合中心',
  },
  userSetting: {
    id: 'admin.user.setting',
    defaultMessage: '个人设置',
  },
  pwdSetting: {
    id: 'admin.user.pwdsetting',
    defaultMessage: '修改密码',
  },
  userLogout: {
    id: 'admin.user.logout',
    defaultMessage: '退出登录',
  },
  defaultCascaderRegion: {
    id: 'admin.region.default.cascader.region',
    defaultMessage: '省/市/区',
  },
  selectCountry: {
    id: 'admin.region.select.country',
    defaultMessage: '选择国家或地区',
  },
  emptyPartnerInfo: {
    id: 'admin.partner.empty.info',
    defaultMessage: '合作伙伴名称和代码不能为空',
  },
  partnerExist: {
    id: 'admin.partner.new.exist',
    defaultMessage: '已经邀请或者建立合作伙伴',
  },
  offlinePartnerExist: {
    id: 'admin.offline.partner.new.exist',
    defaultMessage: '已经添加为线下合作伙伴',
  },
  sendInvitation: {
    id: 'admin.partner.send.invitation',
    defaultMessage: '发送邀请',
  },
  iknow: {
    id: 'admin.partner.iknow',
    defaultMessage: '知道了',
  },
  newPartner: {
    id: 'admin.partner.new',
    defaultMessage: '添加合作伙伴',
  },
  partner: {
    id: 'admin.partner',
    defaultMessage: '合作伙伴:',
  },
  companyNamePlaceholder: {
    id: 'admin.company.name.placeholder',
    defaultMessage: '请输入公司名称',
  },
  partnerCode: {
    id: 'admin.partner.code',
    defaultMessage: '企业代码:',
  },
  partnerCodePlaceholder: {
    id: 'admin.partner.code.placeholder',
    defaultMessage: '合作伙伴企业代码或客户代码',
  },
  partnership: {
    id: 'admin.partnership',
    defaultMessage: '伙伴关系:',
  },
  customer: {
    id: 'admin.customer',
    defaultMessage: '客户',
  },
  provider: {
    id: 'admin.provider',
    defaultMessage: '供应商',
  },
  invitationForOffline: {
    id: 'admin.invitation.forOffline',
    defaultMessage: '对方还不是平台用户,请填写邮箱/手机号发送邀请',
  },
  contactPlaceholder: {
    id: 'admin.contact.placeholder',
    defaultMessage: '输入邮箱/手机号码',
  },
  invitationSent: {
    id: 'admin.invitation.sent',
    defaultMessage: '已发送邀请',
  },
  invitationSentNotice: {
    id: 'admin.invitation.sent.notice',
    defaultMessage: `对方是{isPlatformTenant, select,
      true {平台}
      false {线下}
    }用户,已发送合作伙伴邀请`,
  },
  contactMissing: {
    id: 'admin.partner.contact.missing',
    defaultMessage: '请输入联系方式',
  },
  invitePartner: {
    id: 'admin.partner.invite',
    defaultMessage: '邀请合作伙伴',
  },
  fillPartnerContact: {
    id: 'admin.partner.fill.contact',
    defaultMessage: '请填写邀请合作伙伴"{partnerName}"的联系方式',
  },
  appEditorTitle: {
    id: 'admin.appEditor.title',
    defaultMessage: '设置开通的应用',
  },
  appEditorNameCol: {
    id: 'admin.appEditor.nameCol',
    defaultMessage: '应用名称',
  },
  appEditorSetCol: {
    id: 'admin.appEditor.setCol',
    defaultMessage: '开通状态',
  },
  detail: {
    id: 'admin.messageList.detail',
    defaultMessage: '详情',
  },
});

export default messages;
