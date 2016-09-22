import { defineMessages } from 'react-intl';

const messages = defineMessages({
  nameColumn: {
    id: 'role.list.nameColumn',
    defaultMessage: '角色名',
  },
  descColumn: {
    id: 'role.list.descColumn',
    defaultMessage: '描述',
  },
  contactColumn: {
    id: 'role.list.contactColumn',
    defaultMessage: '负责人',
  },
  phoneColumn: {
    id: 'role.list.phoneColumn',
    defaultMessage: '手机号',
  },
  emailColumn: {
    id: 'role.list.emailColumn',
    defaultMessage: '邮箱',
  },
  appsColumn: {
    id: 'role.list.appsColumn',
    defaultMessage: '已开通应用',
  },
  quotas: {
    id: 'role.list.quotas',
    defaultMessage: '限额使用',
  },
  editTitle: {
    id: 'role.edit.title',
    defaultMessage: '添加部门或分支机构',
  },
  organName: {
    id: 'role.edit.organName',
    defaultMessage: '名称',
  },
  organPlaceholder: {
    id: 'role.edit.organPlaceholder',
    defaultMessage: '请输入部门或分支机构名称',
  },
  organSubcode: {
    id: 'role.edit.organSubcode',
    defaultMessage: '子租户代码',
  },
  organSubcodePlaceholder: {
    id: 'role.edit.organSubcodePlaceholder',
    defaultMessage: '请输入部门或分支机构代码',
  },
  subcodeMessage: {
    id: 'role.edit.subcode.message',
    defaultMessage: '子租户代码必填,最多20位长度',
  },
  chief: {
    id: 'role.edit.chief',
    defaultMessage: '负责人',
  },
  chiefPlaceholder: {
    id: 'role.edit.chiefPlaceholder',
    defaultMessage: '请输入负责人名称',
  },
  nameMessage: {
    id: 'role.edit.nameMessage',
    defaultMessage: '2位以上中英文',
  },
  username: {
    id: 'role.edit.username',
    defaultMessage: '用户名',
  },
  phone: {
    id: 'role.edit.phone',
    defaultMessage: '手机号',
  },
  chiefRequired: {
    id: 'role.edit.chiefRequired',
    defaultMessage: '负责人必填',
  },
});
export default messages;
