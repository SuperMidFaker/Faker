import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  corpSettings: {
    id: 'corp.settings',
    defaultMessage: '企业设置',
  },
  corpInfo: {
    id: 'corp.info',
    defaultMessage: '企业信息',
  },
  corpMembers: {
    id: 'corp.members',
    defaultMessage: '用户与部门',
  },
  corpRole: {
    id: 'corp.role',
    defaultMessage: '角色权限',
  },
  corpData: {
    id: 'corp.data',
    defaultMessage: '数据监控',
  },
  corpLogs: {
    id: 'corp.logs',
    defaultMessage: '操作日志',
  },
  updateSuccess: {
    id: 'corp.info.updateSuccess',
    defaultMessage: '更新成功',
  },
  formValidateErr: {
    id: 'corp.info.form.validate.error',
    defaultMessage: '表单检验存在错误',
  },
  companyName: {
    id: 'corp.info.companyName',
    defaultMessage: '企业名称',
  },
  companyNameTip: {
    id: 'corp.info.companyName.tip',
    defaultMessage: '请与营业执照名称一致',
  },
  companyNameRequired: {
    id: 'corp.info.companyName.required',
    defaultMessage: '公司名称必填',
  },
  companyShortName: {
    id: 'corp.info.companyShortName',
    defaultMessage: '企业简称',
  },
  shortNameMessage: {
    id: 'corp.info.shortName.message',
    defaultMessage: '公司简称必须2位以上中英文',
  },
  location: {
    id: 'corp.info.location',
    defaultMessage: '所在地',
  },
  fullAddress: {
    id: 'corp.info.full.address',
    defaultMessage: '详细地址',
  },
  enterpriseCode: {
    id: 'corp.info.enterprise.code',
    defaultMessage: '统一社会信用代码',
  },
  applyChange: {
    id: 'corp.info.apply.change',
    defaultMessage: '申请修改',
  },
  tradeCategory: {
    id: 'corp.info.trade.category',
    defaultMessage: '所属行业',
  },
  companyAbout: {
    id: 'corp.info.company.about',
    defaultMessage: '企业简介',
  },
  companyWebsite: {
    id: 'corp.info.company.website',
    defaultMessage: '企业网址',
  },
  contact: {
    id: 'corp.info.company.contact',
    defaultMessage: '联系人',
  },
  contactRequired: {
    id: 'corp.info.company.contact.required',
    defaultMessage: '联系人名称必填',
  },
  phone: {
    id: 'corp.info.company.phone',
    defaultMessage: '手机号',
  },
  position: {
    id: 'corp.info.company.position',
    defaultMessage: '职位',
  },
  dragHint: {
    id: 'corp.info.logo.dragtip',
    defaultMessage: '请拖拽或选择文件来改变',
  },
  imgUploadHint: {
    id: 'corp.info.logo.uploadhint',
    defaultMessage: '建议使用PNG或GIF格式的透明图片',
  },
  loginSubdomain: {
    id: 'corp.info.comany.subdomain',
    defaultMessage: '登录入口域',
  },
  basicInfo: {
    id: 'corp.info.basic',
    defaultMessage: '基本信息',
  },
  brandInfo: {
    id: 'corp.info.brand',
    defaultMessage: '品牌设置',
  },
  members: {
    id: 'corp.members',
    defaultMessage: '用户与部门',
  },
  addMember: {
    id: 'corp.members.add',
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
  email: {
    id: 'corp.members.list.email',
    defaultMessage: '邮箱',
  },
  department: {
    id: 'corp.members.list.department',
    defaultMessage: '部门',
  },
  role: {
    id: 'corp.members.list.role',
    defaultMessage: '角色',
  },
  status: {
    id: 'corp.members.list.status',
    defaultMessage: '状态',
  },
  accountNormal: {
    id: 'corp.members.normal',
    defaultMessage: '正常',
  },
  accountDisabled: {
    id: 'corp.members.disabled',
    defaultMessage: '停用',
  },
  tenantOwner: {
    id: 'corp.tenant.role.owner',
    defaultMessage: '拥有者',
  },
  tenantManager: {
    id: 'corp.tenant.role.manager',
    defaultMessage: '管理员',
  },
  tenantMember: {
    id: 'corp.tenant.role.member',
    defaultMessage: '成员',
  },
  tenantAnalyst: {
    id: 'corp.tenant.role.analyst',
    defaultMessage: '分析师',
  },
  tenantBilling: {
    id: 'corp.tenant.role.billing',
    defaultMessage: '结算人员',
  },
  opCol: {
    id: 'corp.members.list.op.col',
    defaultMessage: '操作',
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
    defaultMessage: '新建用户',
  },
  newDeptMember: {
    id: 'corp.members.list.new.dept.member',
    defaultMessage: '添加到部门',
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
  createRole: {
    id: 'corp.role.create.role',
    defaultMessage: '新建角色',
  },
  configPrivileges: {
    id: 'corp.role.config.privileges',
    defaultMessage: '配置权限',
  },
  roleInfo: {
    id: 'corp.role.info',
    defaultMessage: '角色信息',
  },
  isManagerLevel: {
    id: 'corp.role.is.manager.level',
    defaultMessage: '是否管理层',
  },
  privilege: {
    id: 'corp.role.privilege',
    defaultMessage: '权限',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
