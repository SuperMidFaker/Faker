import { defineMessages } from 'react-intl';

const messages = defineMessages({
  moduleImport: {
    id: 'component.module.import',
    defaultMessage: '进口'
  },
  moduleExport: {
    id: 'component.module.export',
    defaultMessage: '出口'
  },
  moduleTms: {
    id: 'component.module.tms',
    defaultMessage: '运输'
  },
  moduleWms: {
    id: 'component.module.wms',
    defaultMessage: '仓储'
  },
  modulePayable: {
    id: 'component.module.payable',
    defaultMessage: '付汇'
  },
  moduleReceivable: {
    id: 'component.module.receivable',
    defaultMessage: '收汇'
  },
  moduleCost: {
    id: 'component.module.cost',
    defaultMessage: '成本分析'
  },
  moduleKpi: {
    id: 'component.module.kpi',
    defaultMessage: 'KPI绩效'
  },
  userSetting: {
    id: 'component.user.setting',
    defaultMessage: '个人设置'
  },
  pwdSetting: {
    id: 'component.user.pwdsetting',
    defaultMessage: '修改密码'
  },
  userLogout: {
    id: 'component.user.logout',
    defaultMessage: '退出登录'
  },
  appEditorTitle: {
    id: 'component.appEditor.title',
    defaultMessage: '设置开通的应用'
  },
  appEditorNameCol: {
    id: 'component.appEditor.nameCol',
    defaultMessage: '应用名称'
  },
  appEditorSetCol: {
    id: 'component.appEditor.setCol',
    defaultMessage: '开通状态'
  }
});

function formatMsg(intl, msgKey, predefinedMessages) {
  return intl.formatMessage((predefinedMessages || messages)[msgKey]);
}
export default formatMsg;
