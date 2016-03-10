import { defineMessages } from 'react-intl';

const messages = defineMessages({
  fullName: {
    id: 'personnel.list.fullname',
    defaultMessage: '姓名'
  },
  username: {
    id: 'personnel.list.username',
    defaultMessage: '用户名'
  },
  phone: {
    id: 'personnel.list.phone',
    defaultMessage: '手机号'
  },
  email: {
    id: 'personnel.list.email',
    defaultMessage: '邮箱'
  },
  position: {
    id: 'personnel.list.position',
    defaultMessage: '职位'
  },
  role: {
    id: 'personnel.list.role',
    defaultMessage: '角色'
  },
  searchPlaceholder: {
    id: 'personnel.list.searchPlaceholder',
    defaultMessage: '搜索姓名/手机号/邮箱'
  },
  affiliatedOrganizations: {
    id: 'personnel.list.affiliated',
    defaultMessage: '所属组织'
  },
  newUser: {
    id: 'personnel.list.newUser',
    defaultMessage: '添加用户'
  },
  user: {
    id: 'personnel.edit.user',
    defaultMessage: '用户'
  },
  fullNamePlaceholder: {
    id: 'personnel.edit.fullname.placeholder',
    defaultMessage: '请输入真实姓名'
  },
  fullNameMessage: {
    id: 'personnel.edit.fullname.message',
    defaultMessage: '2位以上中英文'
  },
  passord: {
    id: 'personnel.edit.password',
    defaultMessage: '登录密码'
  },
  passordPlaceholder: {
    id: 'personnel.edit.password.placeholder',
    defaultMessage: '首次登录时会提示更改密码'
  },
  passordMessage: {
    id: 'personnel.edit.password.message',
    defaultMessage: '至少6位字符'
  },
});

export default messages;
