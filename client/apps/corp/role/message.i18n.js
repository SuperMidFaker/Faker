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
  createTitle: {
    id: 'role.create.title',
    defaultMessage: '添加角色',
  },
  namePlaceholder: {
    id: 'role.edit.organPlaceholder',
    defaultMessage: '输入角色名称',
  },
  organSubcodePlaceholder: {
    id: 'role.edit.organSubcodePlaceholder',
    defaultMessage: '请输入部门或分支机构代码',
  },
  nameMessage: {
    id: 'role.edit.nameMessage',
    defaultMessage: '2位以上中英文',
  },
  unallowDefaultName: {
    id: 'role.form.name.unallow.default',
    defaultMessage: '角色名称不能为与默认角色重名',
  },
  featureName: {
    id: 'role.form.feature.name',
    defaultMessage: '功能名称',
  },
  allFull: {
    id: 'role.form.feature.full',
    defaultMessage: '全部',
  },
  actionName: {
    id: 'role.form.action.name',
    defaultMessage: '动作列表',
  },
});
export default messages;
