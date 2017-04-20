import { defineMessages } from 'react-intl';

const messages = defineMessages({
  members: {
    id: 'corp.members',
    defaultMessage: '用户管理',
  },
  addMember: {
    id: 'corp.members.list.fullname',
    defaultMessage: '添加用户',
  },
  fullName: {
    id: 'corp.members.list.fullname',
    defaultMessage: '姓名',
  },
  username: {
    id: 'corp.members.list.username',
    defaultMessage: '用户名',
  },
  phone: {
    id: 'corp.members.list.phone',
    defaultMessage: '手机号',
  },
  email: {
    id: 'corp.members.list.email',
    defaultMessage: '邮箱',
  },
  position: {
    id: 'corp.members.list.position',
    defaultMessage: '职位',
  },
  role: {
    id: 'corp.members.list.role',
    defaultMessage: '角色',
  },
  searchPlaceholder: {
    id: 'corp.members.list.searchPlaceholder',
    defaultMessage: '搜索姓名/手机号/邮箱',
  },
  affiliatedOrganizations: {
    id: 'corp.members.list.affiliated',
    defaultMessage: '所属组织',
  },
  newUser: {
    id: 'corp.members.list.newUser',
    defaultMessage: '添加用户',
  },
  user: {
    id: 'corp.members.edit.user',
    defaultMessage: '用户',
  },
  fullNamePlaceholder: {
    id: 'corp.members.edit.fullname.placeholder',
    defaultMessage: '请输入真实姓名',
  },
  fullNameMessage: {
    id: 'corp.members.edit.fullname.message',
    defaultMessage: '2位以上中英文',
  },
  password: {
    id: 'corp.members.edit.password',
    defaultMessage: '登录密码',
  },
  passwordPlaceholder: {
    id: 'corp.members.edit.password.placeholder',
    defaultMessage: '首次登录时会提示更改密码',
  },
  passwordMessage: {
    id: 'corp.members.edit.password.message',
    defaultMessage: '至少6位字符',
  },
  phonePlaceholder: {
    id: 'corp.members.edit.phone.placeholder',
    defaultMessage: '可作登录帐号使用',
  },
  emailPlaceholder: {
    id: 'corp.members.edit.email.placeholder',
    defaultMessage: '绑定后可作登录帐号使用',
  },
  nonTenantEdit: {
    id: 'corp.members.edit.nonTenant',
    defaultMessage: '未选择所属租户,无法修改',
  },
});

export default messages;
