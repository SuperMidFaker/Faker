import { defineMessages } from 'react-intl';

const messages = defineMessages({
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
  subcodeColumn: {
    id: 'organization.list.subcodeColumn',
    defaultMessage: '子租户代码'
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
  quotas: {
    id: 'organization.list.quotas',
    defaultMessage: '限额使用'
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
  organSubcode: {
    id: 'organization.edit.organSubcode',
    defaultMessage: '子租户代码'
  },
  organSubcodePlaceholder: {
    id: 'organization.edit.organSubcodePlaceholder',
    defaultMessage: '请输入部门或分支机构代码'
  },
  subcodeMessage: {
    id: 'organization.edit.subcode.message',
    defaultMessage: '子租户代码必填,最多20位长度'
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
  chiefRequired: {
    id: 'organization.edit.chiefRequired',
    defaultMessage: '负责人必填'
  }
});
export default messages;
