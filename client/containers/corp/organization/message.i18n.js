import { defineMessages } from 'react-intl';

const messages = defineMessages({
  organTitle: {
    id: 'organization.title',
    defaultMessage: '组织机构'
  },
  deleteTip: {
    id: 'organization.list.deleteTip',
    defaultMessage: '请输入DELETE进行下一步操作'
  },
  deleteWarn: {
    id: 'organization.list.deleteWarn',
    defaultMessage: '点击确定会删除该机构及其下所有帐户信息'
  },
  nameColumn: {
    id: 'organization.list.nameColumn',
    defaultMessage: '部门/分支机构'
  },
  contactColumn: {
    id: 'organization.list.contactColumn',
    defaultMessage: '负责人'
  },
  phoneColumn: {
    id: 'organization.list.phoneColumn',
    defaultMessage: '手机号'
  },
  emailColumn: {
    id: 'organization.list.emailColumn',
    defaultMessage: '邮箱'
  },
  appsColumn: {
    id: 'organization.list.appsColumn',
    defaultMessage: '已开通应用'
  },
  statusColumn: {
    id: 'organization.list.statusColumn',
    defaultMessage: '状态'
  },
  opColumn: {
    id: 'organization.list.opColumn',
    defaultMessage: '操作'
  },
  editTitle: {
    id: 'organization.edit.title',
    defaultMessage: '添加部门或分支机构'
  },
  organName: {
    id: 'organization.edit.organName',
    defaultMessage: '名称'
  },
  organPlaceholder: {
    id: 'organization.edit.organPlaceholder',
    defaultMessage: '请输入部门或分支机构名称'
  },
  chief: {
    id: 'organization.edit.chief',
    defaultMessage: '负责人'
  },
  chiefPlaceholder: {
    id: 'organization.edit.chiefPlaceholder',
    defaultMessage: '请输入负责人名称'
  },
  nameMessage: {
    id: 'organization.edit.nameMessage',
    defaultMessage: '2位以上中英文'
  },
  username: {
    id: 'organization.edit.username',
    defaultMessage: '用户名'
  },
  phone: {
    id: 'organization.edit.phone',
    defaultMessage: '手机号'
  },
  emailError: {
    id: 'organization.edit.emailErr',
    defaultMessage: 'email格式错误'
  },
  chiefRequired: {
    id: 'organization.edit.chiefRequired',
    defaultMessage: '负责人必填'
  }
});

function formatMsg(intl, msgKey, predefinedMessages) {
  return intl.formatMessage((predefinedMessages || messages)[msgKey]);
}
export default formatMsg;
