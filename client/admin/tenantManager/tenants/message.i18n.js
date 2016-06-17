import { defineMessages } from 'react-intl';

const messages = defineMessages({
	nameColumn: {
	id: 'tenants.list.name',
	defaultMessage: '公司名称'
  },
	subcodeColumn: {
    id: 'tenants.list.subCode',
    defaultMessage: '子租户代码'
  },
  contactColumn: {
    id: 'tenants.list.contact',
    defaultMessage: '联系人'
  },
  phoneColumn: {
    id: 'tenants.list.phone',
    defaultMessage: '手机号'
  },
  emailColumn: {
    id: 'tenants.list.email',
    defaultMessage: '邮箱'
  },
	aspectColumn: {
    id: 'tenants.list.aspect',
    defaultMessage: '企业视角'
  },
  remarkColumn: {
    id: 'tenants.list.remark',
    defaultMessage: '公司介绍'
  },
  namePlaceholder: {
    id: 'tenants.edit.namePlaceholder',
    defaultMessage: '请输入公司名称'
  },
  contactPlaceholder: {
    id: 'tenants.edit.contactPlaceholder',
    defaultMessage: '请输入联系人姓名'
  },
  phonePlaceholder: {
    id: 'tenants.edit.phonePlaceholder',
    defaultMessage: '请输入电话号码'
  },
  emailPlaceholder: {
    id: 'tenants.edit.emailPlaceholder',
    defaultMessage: '请输入有效邮箱'
  },
  dragHint: {
    id: 'corp.info.logo.dragtip',
    defaultMessage: '请拖拽或选择文件来改变'
  },
  imgUploadHint: {
    id: 'corp.info.logo.uploadhint',
    defaultMessage: '建议使用PNG或GIF格式的透明图片'
  },
  searchPlaceholder: {
    id: 'personnel.list.searchPlaceholder',
    defaultMessage: '搜索姓名/手机号/邮箱'
  }
});
export default messages;
