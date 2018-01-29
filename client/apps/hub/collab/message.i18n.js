import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  collab: {
    id: 'network.collab',
    defaultMessage: '协作邀请',
  },
  partnerName: {
    id: 'network.partner.name',
    defaultMessage: '合作伙伴',
  },
  partnerCode: {
    id: 'network.partner.code',
    defaultMessage: '客户代码',
  },
  partnerType: {
    id: 'network.partner.type',
    defaultMessage: '关系',
  },
  tenantType: {
    id: 'network.tenant.type',
    defaultMessage: '类型',
  },
  activate: {
    id: 'network.business.activate',
    defaultMessage: '申请开通',
  },
  accept: {
    id: 'network.business.accept',
    defaultMessage: '接受',
  },
  reject: {
    id: 'network.business.reject',
    defaultMessage: '拒绝',
  },
  revoke: {
    id: 'network.business.revoke',
    defaultMessage: '撤回',
  },
  invite: {
    id: 'network.send.invite',
    defaultMessage: '邀请协作',
  },
  searchPlaceholder: {
    id: 'network.search.placeholder',
    defaultMessage: '搜索合作伙伴',
  },
  newPartner: {
    id: 'network.table.new.partner',
    defaultMessage: '添加合作伙伴',
  },
  invitationSent: {
    id: 'network.invitation.sent',
    defaultMessage: '已发送协作邀请',
  },
  invitationRevoked: {
    id: 'network.invitation.revoked',
    defaultMessage: '已撤回协作邀请',
  },
  acceptFailed: {
    id: 'network.invitation.accept.failed',
    defaultMessage: '接受邀请失败',
  },
  rejectFailed: {
    id: 'network.invitation.reject.failed',
    defaultMessage: '拒绝邀请失败',
  },
  inviteYouToBe: {
    id: 'network.invitation.you.tobe',
    defaultMessage: '邀请你成为',
  },
  provider: {
    id: 'network.invitation.provider',
    defaultMessage: '服务商',
  },
  recvDate: {
    id: 'network.invitation.recvDate',
    defaultMessage: '收到日期',
  },
  newInvitation: {
    id: 'network.invitation.new',
    defaultMessage: '新邀请',
  },
  invitationAccepted: {
    id: 'network.invitation.accepted',
    defaultMessage: '已接受',
  },
  invitationRejected: {
    id: 'network.invitation.rejected',
    defaultMessage: '已拒绝',
  },
  invitationDue: {
    id: 'network.invitation.due',
    defaultMessage: '待定',
  },
  invitationCannceleed: {
    id: 'network.invitation.cancelled',
    defaultMessage: '已取消',
  },
  accept: {
    id: 'network.invitation.accept',
    defaultMessage: '接受',
  },
  reject: {
    id: 'network.invitation.reject',
    defaultMessage: '拒绝',
  },
  selectProviderType: {
    id: 'network.provider.select.type',
    defaultMessage: '请选择供应商类型',
  },
  invitationCodePlaceholder: {
    id: 'network.invitation.code.placeholder',
    defaultMessage: '输入邀请码',
  },
  retrieve: {
    id: 'network.invitation.retrieve',
    defaultMessage: '提取',
  },
  setProviderType: {
    id: 'network.provider.setType',
    defaultMessage: '设置供应商类型',
  },
  cancelInvitationFail: {
    id: 'network.invitation.cancel.failed',
    defaultMessage: '取消邀请失败',
  },
  inviteThemToBe: {
    id: 'network.invitation.them.tobe',
    defaultMessage: '邀请对方成为',
  },
  sentDate: {
    id: 'network.invitation.sentDate',
    defaultMessage: '发出日期',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
