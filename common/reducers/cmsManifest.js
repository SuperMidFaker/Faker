import { WRAP_TYPE as PackTypes, DELG_EXEMPTIONWAY } from 'common/constants';
import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/manifest/', [
  'LOAD_DELG_MANIFEST', 'LOAD_DELG_MANIFEST_SUCCEED', 'LOAD_DELG_MANIFEST_FAIL',
  'LOAD_MANIFESTTP', 'LOAD_MANIFESTTP_SUCCEED', 'LOAD_MANIFESTTP_FAIL',
  'LOAD_MANIFEST', 'LOAD_MANIFEST_SUCCEED', 'LOAD_MANIFEST_FAIL',
  'LOAD_MANIFEST_BODY', 'LOAD_MANIFEST_BODY_SUCCEED', 'LOAD_MANIFEST_BODY_FAIL',
  'LOAD_CUSTOMS_DECL', 'LOAD_CUSTOMS_DECL_SUCCEED', 'LOAD_CUSTOMS_DECL_FAIL',
  'LOAD_PARAMS', 'LOAD_PARAMS_SUCCEED', 'LOAD_PARAMS_FAIL',
  'LOAD_SEARCHPARAM', 'LOAD_SEARCHPARAM_SUCCEED', 'LOAD_SEARCHPARAM_FAIL',
  'ADD_BILLBODY', 'ADD_BILLBODY_SUCCEED', 'ADD_BILLBODY_FAIL',
  'DEL_BILLBODY', 'DEL_BILLBODY_SUCCEED', 'DEL_BILLBODY_FAIL',
  'EDIT_BILLBODY', 'EDIT_BILLBODY_SUCCEED', 'EDIT_BILLBODY_FAIL',
  'SAVE_MANIFEST_HEAD', 'SAVE_MANIFEST_HEAD_SUCCEED', 'SAVE_MANIFEST_HEAD_FAIL',
  'OPEN_MS_MODAL', 'CLOSE_MS_MODAL',
  'SUBMIT_MERGESPLIT', 'SUBMIT_MERGESPLIT_SUCCEED', 'SUBMIT_MERGESPLIT_FAIL',
  'UPDATE_HEAD_NETWT', 'UPDATE_HEAD_NETWT_SUCCEED', 'UPDATE_HEAD_NETWT_FAIL',
  'RESET_BILL', 'RESET_BILL_SUCCEED', 'RESET_BILL_FAIL',
  'OPEN_AMOUNT_MODEL', 'CLOSE_AMOUNT_MODEL', 'SET_PANE_TABKEY',
  'LOAD_CERT_MARKS', 'LOAD_CERT_MARKS_SUCCEED', 'LOAD_CERT_MARKS_FAIL',
  'SAVE_CERT_MARK', 'SAVE_CERT_MARK_SUCCEED', 'SAVE_CERT_MARK_FAIL',
  'DELETE_CERT_MARK', 'DELETE_CERT_MARK_SUCCEED', 'DELETE_CERT_MARK_FAIL',
  'LOAD_DOCU_MARKS', 'LOAD_DOCU_MARKS_SUCCEED', 'LOAD_DOCU_MARKS_FAIL',
  'SAVE_DOCU_MARK', 'SAVE_DOCU_MARK_SUCCEED', 'SAVE_DOCU_MARK_FAIL',
  'DELETE_DOCU_MARK', 'DELETE_DOCU_MARK_SUCCEED', 'DELETE_DOCU_MARK_FAIL',
  'LOAD_CONTAINERS', 'LOAD_CONTAINERS_SUCCEED', 'LOAD_CONTAINERS_FAIL',
  'SAVE_CONTAINER', 'SAVE_CONTAINER_SUCCEED', 'SAVE_CONTAINER_FAIL',
  'DELETE_CONTAINER', 'DELETE_CONTAINER_SUCCEED', 'DELETE_CONTAINER_FAIL',
  'SAVE_ENTRY_HEAD', 'SAVE_ENTRY_HEAD_SUCCEED', 'SAVE_ENTRY_HEAD_FAIL',
  'REDO_MANIFEST', 'REDO_MANIFEST_SUCCEED', 'REDO_MANIFEST_FAIL',
  'REFRESH_RELBODIES', 'REFRESH_RELBODIES_SUCCEED', 'REFRESH_RELBODIES_FAIL',
  'DELETE_SELECTED_BODIES', 'DELETE_SELECTED_BODIES_SUCCEED', 'DELETE_SELECTED_BODIES_FAIL',
  'RESET_BILLBODY', 'RESET_BILLBODY_SUCCEED', 'RESET_BILLBODY_FAIL',
  'OPEN_RULE_MODEL', 'CLOSE_RULE_MODEL',
  'SAVE_BILL_RULES', 'SAVE_BILL_RULES_SUCCEED', 'SAVE_BILL_RULES_FAIL',
  'RESET_BILLHEAD', 'RESET_BILLHEAD_SUCCEED', 'RESET_BILLHEAD_FAIL',
  'LOCK_MANIFEST', 'LOCK_MANIFEST_SUCCEED', 'LOCK_MANIFEST_FAIL',
  'SET_STEP_VISIBLE', 'BILL_HEAD_CHANGE',
  'FILL_ENTRYNO', 'FILL_ENTRYNO_SUCCEED', 'FILL_ENTRYNO_FAIL',
  'LOAD_BILL_TEMPLATES', 'LOAD_BILL_TEMPLATES_SUCCEED', 'LOAD_BILL_TEMPLATES_FAIL',
  'CREATE_BILL_TEMPLATE', 'CREATE_BILL_TEMPLATE_SUCCEED', 'CREATE_BILL_TEMPLATE_FAIL',
  'DELETE_TEMPLATE', 'DELETE_TEMPLATE_SUCCEED', 'DELETE_TEMPLATE_FAIL',
  'TOGGLE_BILL_TEMPLATE',
  'LOAD_BILL_TEMPLATE_USERS', 'LOAD_BILL_TEMPLATE_USERS_SUCCEED', 'LOAD_BILL_TEMPLATE_USERS_FAIL',
  'ADD_BILL_TEMPLATE_USER', 'ADD_BILL_TEMPLATE_USER_SUCCEED', 'ADD_BILL_TEMPLATE_USER_FAIL',
  'DELETE_BILL_TEMPLATE_USER', 'DELETE_BILL_TEMPLATE_USER_SUCCEED', 'DELETE_BILL_TEMPLATE_USER_FAIL',
  'SAVE_TEMPLATE_DATA', 'SAVE_TEMPLATE_DATA_SUCCEED', 'SAVE_TEMPLATE_DATA_FAIL',
  'COUNT_FIELDS_CHANGE',
  'LOAD_FORM_VALS', 'LOAD_FORM_VALS_SUCCEED', 'LOAD_FORM_VALS_FAIL',
  'SAVE_GENERATED_TEMPLATE', 'SAVE_GENERATED_TEMPLATE_SUCCEED', 'SAVE_GENERATED_TEMPLATE_FAIL',
  'VALIDATE_NAME', 'VALIDATE_NAME_SUCCEED', 'VALIDATE_NAME_FAIL',
  'SHOW_SEND_DECLS_MODAL', 'SHOW_EDIT_BODY_MODAL',
  'VALIDATE_BILL_DATAS', 'VALIDATE_BILL_DATAS_SUCCEED', 'VALIDATE_BILL_DATAS_FAIL',
  'LOAD_BILL_META', 'LOAD_BILL_META_SUCCEED', 'LOAD_BILL_META_FAIL',
  'CHANGE_TEMP_INFO', 'CHANGE_TEMP_INFO_SUCCEED', 'CHANGE_TEMP_INFO_FAIL',
  'SHOW_DECL_ELEMENTS_MODAL', 'HIDE_DECL_ELEMENTS_MODAL',
  'UPDATE_BILLBODY', 'UPDATE_BILLBODY_SUCCEED', 'UPDATE_BILLBODY_FAIL',
]);

const initialState = {
  manifestLoading: false,
  customsDeclLoading: false,
  template: {},
  billtemplates: [],
  delgBillList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  formRequire: {
    tradeModes: [],
    transModes: [],
    customs: [],
  },
  listFilter: {
    status: 'all',
    sortField: '',
    sortOrder: '',
    filterNo: '',
    clientView: { tenantIds: [], partnerIds: [] },
    viewStatus: 'all',
    acptDate: [],
  },
  billMeta: {
    bill_seq_no: '',
    entries: [],
  },
  billHead: {
  },
  billBodies: [],
  entryHead: {},
  entryBodies: [],
  params: {
    trades: [],
    owners: [],
    agents: [],
    customs: [],
    tradeModes: [],
    transModes: [],
    trxModes: [],
    tradeCountries: [],
    remissionModes: [],
    ports: [],
    districts: [],
    currencies: [],
    packs: PackTypes,
    exemptionWays: DELG_EXEMPTIONWAY,
    units: [],
  },
  visibleMSModal: false,
  visibleAmtModal: false,
  visibleRuleModal: false,
  visibleStepModal: false,
  tabKey: 'container',
  certMarks: [],
  certParams: [],
  docuMarks: [],
  containers: [],
  templates: [],
  billRule: {},
  billHeadFieldsChangeTimes: 0,
  addTemplateModal: {
    visible: false,
    templateName: '',
  },
  visibleAddModal: false,
  templateUsers: [],
  formData: {},
  changeTimes: 0,
  templateValLoading: false,
  sendDeclsModal: {
    visible: false,
    preEntrySeqNo: '',
    delgNo: '',
    agentCustCo: '',
  },
  editBodyVisible: false,
  billDetails: [],
  declElementsModal: {
    visible: false,
    element: '',
    gModel: '',
    id: '',
    disabled: false,
    name: '',
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_DELG_MANIFEST:
      return { ...state, delgBillList: { ...state.delgBillList, loading: true } };
    case actionTypes.LOAD_DELG_MANIFEST_SUCCEED:
      return { ...state,
        delgBillList: { ...state.delgBillList, loading: false, ...action.result.data },
        listFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_MANIFESTTP_SUCCEED:
      return { ...state, formRequire: action.result.data };
    case actionTypes.LOAD_MANIFEST:
      return { ...state, manifestLoading: true, billMeta: initialState.billMeta };
    case actionTypes.LOAD_MANIFEST_FAILED:
      return { ...state, manifestLoading: false };
    case actionTypes.LOAD_MANIFEST_SUCCEED: {
      const ports = [...state.params.ports];
      const destPort = action.result.data.destPort;
      if (destPort &&
        ports.filter(prt => prt.port_code === destPort.port_code).length === 0) {
        ports.push(destPort);
      }
      return {
        ...state,
        billHead: action.result.data.head,
        billMeta: action.result.data.meta,
        billBodies: action.result.data.hbodies,
        params: { ...state.params, ports },
        templates: action.result.data.templates,
        billRule: action.result.data.billRule,
        manifestLoading: false,
      };
    }
    case actionTypes.RESET_BILL_SUCCEED:
      return { ...state, billHead: action.result.data.head, billBodies: [], billMeta: { ...state.billMeta, entries: [] } };
    case actionTypes.RESET_BILLHEAD_SUCCEED:
      return { ...state, billHead: action.result.data.head };
    case actionTypes.LOAD_MANIFEST_BODY_SUCCEED:
      return { ...state, billBodies: action.result.data };
    case actionTypes.UPDATE_HEAD_NETWT_SUCCEED:
      return { ...state, billHead: action.result.data }; // gross_wt float is string TODO
    case actionTypes.LOAD_CUSTOMS_DECL:
      return { ...state, customsDeclLoading: true, billMeta: { ...state.billMeta, ...initialState.billMeta } };
    case actionTypes.LOAD_CUSTOMS_DECL_FAILED:
      return { ...state, customsDeclLoading: false };
    case actionTypes.LOAD_CUSTOMS_DECL_SUCCEED:
      return { ...state,
        entryHead: action.result.data.head,
        entryBodies: action.result.data.hbodies,
        billDetails: action.result.data.billDetails,
        billMeta: { ...state.billMeta, ...action.result.data.meta },
        customsDeclLoading: false };
    case actionTypes.LOAD_PARAMS_SUCCEED: {
      const retParams = action.result.data;
      const retPorts = retParams.ports;
      const newPorts = [...retPorts];
      const originPorts = state.params.ports;
      originPorts.forEach((op) => {
        if (retPorts.filter(rp => rp.port_code === op.port_code).length === 0) {
          newPorts.push(op);
        }
      });
      retParams.ports = newPorts;
      return { ...state, params: { ...state.params, ...retParams } };
    }
    case actionTypes.LOAD_SEARCHPARAM_SUCCEED: {
      const retParam = action.result.data;
      if (retParam.ports) {
        // 合并查找到ports数据至原params中
        const retPorts = retParam.ports;
        const newPorts = [...retPorts];
        const originPorts = state.params.ports;
        originPorts.forEach((op) => {
          if (retPorts.filter(rp => rp.port_code === op.port_code).length === 0) {
            newPorts.push(op);
          }
        });
        retParam.ports = newPorts;
      }
      return { ...state, params: { ...state.params, ...retParam } };
    }
    case actionTypes.SAVE_MANIFEST_HEAD_SUCCEED:
      return { ...state, billHead: action.data.head, billHeadFieldsChangeTimes: 0 }; // float become string
    case actionTypes.OPEN_MS_MODAL:
      return { ...state, visibleMSModal: true };
    case actionTypes.CLOSE_MS_MODAL:
      return { ...state, visibleMSModal: false };
    case actionTypes.OPEN_AMOUNT_MODEL:
      return { ...state, visibleAmtModal: true };
    case actionTypes.CLOSE_AMOUNT_MODEL:
      return { ...state, visibleAmtModal: false };
    case actionTypes.OPEN_RULE_MODEL:
      return { ...state, visibleRuleModal: true };
    case actionTypes.CLOSE_RULE_MODEL:
      return { ...state, visibleRuleModal: false };
    case actionTypes.SET_STEP_VISIBLE:
      return { ...state, visibleStepModal: action.data };
    case actionTypes.SUBMIT_MERGESPLIT_SUCCEED:
      return { ...state, billMeta: { ...state.billMeta, entries: action.result.data } };
    case actionTypes.REDO_MANIFEST_SUCCEED:
      return { ...state, billMeta: { ...state.billMeta, entries: [] } };
    case actionTypes.SET_PANE_TABKEY:
      return { ...state, tabKey: action.data };
    case actionTypes.LOAD_CERT_MARKS_SUCCEED:
      return { ...state, certMarks: action.result.data.certMarks, certParams: action.result.data.certParams };
    case actionTypes.SAVE_CERT_MARK_SUCCEED:
      return { ...state, certMarks: action.result.data };
    case actionTypes.LOAD_DOCU_MARKS_SUCCEED:
      return { ...state, docuMarks: action.result.data };
    case actionTypes.SAVE_DOCU_MARK_SUCCEED:
      return { ...state, docuMarks: action.result.data };
    case actionTypes.LOAD_CONTAINERS_SUCCEED:
      return { ...state, containers: action.result.data };
    case actionTypes.SAVE_CONTAINER_SUCCEED:
      return { ...state, containers: action.result.data };
    case actionTypes.SAVE_BILL_RULES_SUCCEED:
      return { ...state, billRule: action.payload.rules };
    case actionTypes.LOCK_MANIFEST_SUCCEED:
      return { ...state,
        billHead: { ...state.billHead,
          locking_login_id: action.data.loginId,
          locking_name: action.data.loginName } };
    case actionTypes.BILL_HEAD_CHANGE:
      return { ...state, billHeadFieldsChangeTimes: state.billHeadFieldsChangeTimes + 1 };
    case actionTypes.FILL_ENTRYNO_SUCCEED:
      return { ...state, entryHead: { ...state.entryHead, entry_id: action.data.entryNo } };
    case actionTypes.LOAD_BILL_TEMPLATES_SUCCEED:
      return { ...state, billtemplates: action.result.data };
    case actionTypes.CREATE_BILL_TEMPLATE_SUCCEED: {
      const retData = action.result.data;
      if (retData.i_e_type === 0) {
        retData.ietype = 'import';
      } else if (retData.i_e_type === 1) {
        retData.ietype = 'export';
      }
      return { ...state, template: { ...state.template, ...retData } };
    }
    case actionTypes.TOGGLE_BILL_TEMPLATE: {
      return { ...state, addTemplateModal: { ...state.addTemplateModal, ...action.data } };
    }
    case actionTypes.LOAD_BILL_TEMPLATE_USERS_SUCCEED:
      return { ...state, templateUsers: action.result.data };
    case actionTypes.COUNT_FIELDS_CHANGE:
      return { ...state, changeTimes: state.changeTimes + 1 };
    case actionTypes.LOAD_FORM_VALS:
      return { ...state, templateValLoading: true };
    case actionTypes.LOAD_FORM_VALS_SUCCEED: {
      const retData = action.result.data.template;
      if (retData.i_e_type === 0) {
        retData.ietype = 'import';
      } else if (retData.i_e_type === 1) {
        retData.ietype = 'export';
      }
      return { ...state,
        template: { ...state.template, ...retData },
        formData: action.result.data.formData,
        templateUsers: action.result.data.users,
        templateValLoading: false };
    }
    case actionTypes.LOAD_FORM_VALS_FAIL:
      return { ...state, templateValLoading: false };
    case actionTypes.SHOW_SEND_DECLS_MODAL:
      return { ...state, sendDeclsModal: { ...state.sendDeclsModal, ...action.data } };
    case actionTypes.SHOW_EDIT_BODY_MODAL:
      return { ...state, editBodyVisible: action.data };
    case actionTypes.LOAD_BILL_META_SUCCEED:
      return { ...state, billMeta: { ...state.billMeta, ...action.result.data.meta } };
    case actionTypes.CHANGE_TEMP_INFO_SUCCEED:
      return { ...state, template: { ...state.template, ...action.data.change } };
    case actionTypes.SHOW_DECL_ELEMENTS_MODAL:
      return { ...state,
        declElementsModal: { ...state.declElementsModal,
          visible: true,
          element: action.element,
          id: action.id,
          gModel: action.gModel,
          disabled: action.disabled,
          name: action.name } };
    case actionTypes.HIDE_DECL_ELEMENTS_MODAL:
      return { ...state, declElementsModal: { ...state.declElementsModal, visible: false } };
    default:
      return state;
  }
}

export function loadDelgBill(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELG_MANIFEST,
        actionTypes.LOAD_DELG_MANIFEST_SUCCEED,
        actionTypes.LOAD_DELG_MANIFEST_FAIL,
      ],
      endpoint: 'v1/cms/manifests',
      method: 'get',
      params,
    },
  };
}

export function loadManifestTableParams() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MANIFESTTP,
        actionTypes.LOAD_MANIFESTTP_SUCCEED,
        actionTypes.LOAD_MANIFESTTP_FAIL,
      ],
      endpoint: 'v1/cms/manifests/table/params',
      method: 'get',
    },
  };
}

export function loadContainers(delgNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CONTAINERS,
        actionTypes.LOAD_CONTAINERS_SUCCEED,
        actionTypes.LOAD_CONTAINERS_FAIL,
      ],
      endpoint: 'v1/cms/manifest/containers',
      method: 'get',
      params: { delgNo },
    },
  };
}

export function saveContainer(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_CONTAINER,
        actionTypes.SAVE_CONTAINER_SUCCEED,
        actionTypes.SAVE_CONTAINER_FAIL,
      ],
      endpoint: 'v1/cms/manifest/container/save',
      method: 'post',
      data: datas,
    },
  };
}

export function delContainer(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_CONTAINER,
        actionTypes.DELETE_CONTAINER_SUCCEED,
        actionTypes.DELETE_CONTAINER_FAIL,
      ],
      endpoint: 'v1/cms/manifest/container/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function loadCertMarks(preEntrySeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CERT_MARKS,
        actionTypes.LOAD_CERT_MARKS_SUCCEED,
        actionTypes.LOAD_CERT_MARKS_FAIL,
      ],
      endpoint: 'v1/cms/manifest/certMark',
      method: 'get',
      params: { preEntrySeqNo },
    },
  };
}

export function saveCertMark(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_CERT_MARK,
        actionTypes.SAVE_CERT_MARK_SUCCEED,
        actionTypes.SAVE_CERT_MARK_FAIL,
      ],
      endpoint: 'v1/cms/manifest/certMark/save',
      method: 'post',
      data: datas,
    },
  };
}

export function delbillCertmark(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_CERT_MARK,
        actionTypes.DELETE_CERT_MARK_SUCCEED,
        actionTypes.DELETE_CERT_MARK_FAIL,
      ],
      endpoint: 'v1/cms/manifest/certMark/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function loadDocuMarks(entryId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DOCU_MARKS,
        actionTypes.LOAD_DOCU_MARKS_SUCCEED,
        actionTypes.LOAD_DOCU_MARKS_FAIL,
      ],
      endpoint: 'v1/cms/manifest/docuMark',
      method: 'get',
      params: { entryId },
    },
  };
}

export function saveDocuMark(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_DOCU_MARK,
        actionTypes.SAVE_DOCU_MARK_SUCCEED,
        actionTypes.SAVE_DOCU_MARK_FAIL,
      ],
      endpoint: 'v1/cms/manifest/docuMark/save',
      method: 'post',
      data: datas,
    },
  };
}

export function delDocumark(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_DOCU_MARK,
        actionTypes.DELETE_DOCU_MARK_SUCCEED,
        actionTypes.DELETE_DOCU_MARK_FAIL,
      ],
      endpoint: 'v1/cms/manifest/docuMark/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function setPaneTabkey(tabkey) {
  return {
    type: actionTypes.SET_PANE_TABKEY,
    data: tabkey,
  };
}

export function loadBill(billSeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MANIFEST,
        actionTypes.LOAD_MANIFEST_SUCCEED,
        actionTypes.LOAD_MANIFEST_FAIL,
      ],
      endpoint: 'v1/cms/manifest/bill',
      method: 'get',
      params: { billSeqNo },
    },
  };
}

export function loadBillBody(billSeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MANIFEST_BODY,
        actionTypes.LOAD_MANIFEST_BODY_SUCCEED,
        actionTypes.LOAD_MANIFEST_BODY_FAIL,
      ],
      endpoint: 'v1/cms/manifest/bill/body',
      method: 'get',
      params: { billSeqNo },
    },
  };
}

export function loadBillMeta(billSeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILL_META,
        actionTypes.LOAD_BILL_META_SUCCEED,
        actionTypes.LOAD_BILL_META_FAIL,
      ],
      endpoint: 'v1/cms/manifests/billMeta/load',
      method: 'get',
      params: { billSeqNo },
    },
  };
}

export function loadEntry(billSeqNo, preEntrySeqNo, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CUSTOMS_DECL,
        actionTypes.LOAD_CUSTOMS_DECL_SUCCEED,
        actionTypes.LOAD_CUSTOMS_DECL_FAIL,
      ],
      endpoint: 'v1/cms/manifest/entry',
      method: 'get',
      params: { billSeqNo, preEntrySeqNo, tenantId },
    },
  };
}

export function loadCmsParams() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARAMS,
        actionTypes.LOAD_PARAMS_SUCCEED,
        actionTypes.LOAD_PARAMS_FAIL,
      ],
      endpoint: 'v1/cms/manifest/params',
      method: 'get',
    },
  };
}

export function loadSearchedParam({ paramType, search }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SEARCHPARAM,
        actionTypes.LOAD_SEARCHPARAM_SUCCEED,
        actionTypes.LOAD_SEARCHPARAM_FAIL,
      ],
      endpoint: 'v1/cms/manifest/paramfilters',
      method: 'get',
      params: { paramType, search },
    },
  };
}

export function addNewBillBody({ body, billSeqNo, loginId, tenantId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_BILLBODY,
        actionTypes.ADD_BILLBODY_SUCCEED,
        actionTypes.ADD_BILLBODY_FAIL,
      ],
      endpoint: 'v1/cms/manifest/billbody/add',
      method: 'post',
      data: { newBody: body, billSeqNo, loginId, tenantId },
    },
  };
}

export function delBillBody(bodyId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_BILLBODY,
        actionTypes.DEL_BILLBODY_SUCCEED,
        actionTypes.DEL_BILLBODY_FAIL,
      ],
      endpoint: 'v1/cms/manifest/billbody/del',
      method: 'post',
      data: { bodyId },
    },
  };
}

export function editBillBody(body) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_BILLBODY,
        actionTypes.EDIT_BILLBODY_SUCCEED,
        actionTypes.EDIT_BILLBODY_FAIL,
      ],
      endpoint: 'v1/cms/manifest/billbody/edit',
      method: 'post',
      data: body,
    },
  };
}

export function updateBillBody(id, model) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_BILLBODY,
        actionTypes.UPDATE_BILLBODY_SUCCEED,
        actionTypes.UPDATE_BILLBODY_FAIL,
      ],
      endpoint: 'v1/cms/manifest/billbody/update',
      method: 'post',
      data: { id, model },
    },
  };
}

export function saveBillHead({ head, ietype, loginId, tenantId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_MANIFEST_HEAD,
        actionTypes.SAVE_MANIFEST_HEAD_SUCCEED,
        actionTypes.SAVE_MANIFEST_HEAD_FAIL,
      ],
      endpoint: 'v1/cms/manifest/billhead',
      method: 'post',
      data: { head, ietype, loginId, tenantId },
    },
  };
}

export function openMergeSplitModal() {
  return {
    type: actionTypes.OPEN_MS_MODAL,
  };
}

export function closeMergeSplitModal() {
  return {
    type: actionTypes.CLOSE_MS_MODAL,
  };
}

export function openAmountModel() {
  return {
    type: actionTypes.OPEN_AMOUNT_MODEL,
  };
}

export function closeAmountModel() {
  return {
    type: actionTypes.CLOSE_AMOUNT_MODEL,
  };
}

export function openRuleModel() {
  return {
    type: actionTypes.OPEN_RULE_MODEL,
  };
}

export function closeRuleModel() {
  return {
    type: actionTypes.CLOSE_RULE_MODEL,
  };
}

export function submitBillMegeSplit({ billSeqNo, mergeOpt, splitOpt, sortOpt }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SUBMIT_MERGESPLIT,
        actionTypes.SUBMIT_MERGESPLIT_SUCCEED,
        actionTypes.SUBMIT_MERGESPLIT_FAIL,
      ],
      endpoint: 'v1/cms/declare/bill/mergesplit',
      method: 'post',
      data: { billSeqNo, mergeOpt, splitOpt, sortOpt },
    },
  };
}

export function updateHeadNetWt(billSeqNo, netWt) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_HEAD_NETWT,
        actionTypes.UPDATE_HEAD_NETWT_SUCCEED,
        actionTypes.UPDATE_HEAD_NETWT_FAIL,
      ],
      endpoint: 'v1/cms/declare/bill/update/headNetWt',
      method: 'post',
      data: { billSeqNo, netWt },
    },
  };
}

export function resetBill(headId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RESET_BILL,
        actionTypes.RESET_BILL_SUCCEED,
        actionTypes.RESET_BILL_FAIL,
      ],
      endpoint: 'v1/cms/manifest/bill/reset',
      method: 'post',
      data: headId,
    },
  };
}

export function resetBillHead(headId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RESET_BILLHEAD,
        actionTypes.RESET_BILLHEAD_SUCCEED,
        actionTypes.RESET_BILLHEAD_FAIL,
      ],
      endpoint: 'v1/cms/manifest/bill/reset/head',
      method: 'post',
      data: { headId },
    },
  };
}

export function saveEntryHead(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_ENTRY_HEAD,
        actionTypes.SAVE_ENTRY_HEAD_SUCCEED,
        actionTypes.SAVE_ENTRY_HEAD_FAIL,
      ],
      endpoint: 'v1/cms/manifest/entry/head/save',
      method: 'post',
      data: datas,
    },
  };
}

export function redoManifest(delgNo, billSeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REDO_MANIFEST,
        actionTypes.REDO_MANIFEST_SUCCEED,
        actionTypes.REDO_MANIFEST_FAIL,
      ],
      endpoint: 'v1/cms/manifest/redo',
      method: 'post',
      data: { delgNo, billSeqNo },
    },
  };
}

export function refreshRelatedBodies(billSeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REFRESH_RELBODIES,
        actionTypes.REFRESH_RELBODIES_SUCCEED,
        actionTypes.REFRESH_RELBODIES_FAIL,
      ],
      endpoint: 'v1/cms/manifest/billbody/related/refresh',
      method: 'post',
      data: { bill_seq_no: billSeqNo },
    },
  };
}

export function deleteSelectedBodies(bodyIds) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_SELECTED_BODIES,
        actionTypes.DELETE_SELECTED_BODIES_SUCCEED,
        actionTypes.DELETE_SELECTED_BODIES_FAIL,
      ],
      endpoint: 'v1/cms/manifest/delete/bodies',
      method: 'post',
      data: bodyIds,
    },
  };
}

export function resetBillBody(billSeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RESET_BILLBODY,
        actionTypes.RESET_BILLBODY_SUCCEED,
        actionTypes.RESET_BILLBODY_FAIL,
      ],
      endpoint: 'v1/cms/manifest/bill/reset/body',
      method: 'post',
      data: { bill_seq_no: billSeqNo },
    },
  };
}

export function saveBillRules(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_BILL_RULES,
        actionTypes.SAVE_BILL_RULES_SUCCEED,
        actionTypes.SAVE_BILL_RULES_FAIL,
      ],
      endpoint: 'v1/cms/manifest/bill/rules/save',
      method: 'post',
      data: datas,
      payload: { rules: datas.rules },
    },
  };
}

export function setStepVisible(val) {
  return {
    type: actionTypes.SET_STEP_VISIBLE,
    data: val,
  };
}

export function billHeadChange(values) {
  return {
    type: actionTypes.BILL_HEAD_CHANGE,
    data: values,
  };
}

export function lockManifest(locker) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOCK_MANIFEST,
        actionTypes.LOCK_MANIFEST_SUCCEED,
        actionTypes.LOCK_MANIFEST_FAIL,
      ],
      endpoint: 'v1/cms/manifest/lock',
      method: 'post',
      data: locker,
    },
  };
}

export function fillEntryId({ entryNo, entryHeadId, billSeqNo, delgNo }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILL_ENTRYNO,
        actionTypes.FILL_ENTRYNO_SUCCEED,
        actionTypes.FILL_ENTRYNO_FAIL,
      ],
      endpoint: 'v1/cms/fill/declno',
      method: 'post',
      data: { entryNo, entryHeadId, billSeqNo, delgNo },
    },
  };
}

export function loadBillemplates(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILL_TEMPLATES,
        actionTypes.LOAD_BILL_TEMPLATES_SUCCEED,
        actionTypes.LOAD_BILL_TEMPLATES_FAIL,
      ],
      endpoint: 'v1/cms/settings/billtemplates/load',
      method: 'get',
      params,
    },
  };
}

export function createBillTemplate(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_BILL_TEMPLATE,
        actionTypes.CREATE_BILL_TEMPLATE_SUCCEED,
        actionTypes.CREATE_BILL_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/cms/settings/billtemplate/create',
      method: 'post',
      data: datas,
    },
  };
}

export function deleteTemplate(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_TEMPLATE,
        actionTypes.DELETE_TEMPLATE_SUCCEED,
        actionTypes.DELETE_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/cms/settings/billtemplate/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function toggleBillTempModal(visible, operation, templateName) {
  return {
    type: actionTypes.TOGGLE_BILL_TEMPLATE,
    data: { visible, operation, templateName },
  };
}

export function loadBillTemplateUsers(templateId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILL_TEMPLATE_USERS,
        actionTypes.LOAD_BILL_TEMPLATE_USERS_SUCCEED,
        actionTypes.LOAD_BILL_TEMPLATE_USERS_FAIL,
      ],
      endpoint: 'v1/cms/settings/billtemplate/users',
      method: 'get',
      params: { templateId },
    },
  };
}

export function addBillTemplateUser(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_BILL_TEMPLATE_USER,
        actionTypes.ADD_BILL_TEMPLATE_USER_SUCCEED,
        actionTypes.ADD_BILL_TEMPLATE_USER_FAIL,
      ],
      endpoint: 'v1/cms/settings/billtemplate/user/add',
      method: 'post',
      data: datas,
    },
  };
}

export function deleteBillTemplateUser(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_BILL_TEMPLATE_USER,
        actionTypes.DELETE_BILL_TEMPLATE_USER_SUCCEED,
        actionTypes.DELETE_BILL_TEMPLATE_USER_FAIL,
      ],
      endpoint: 'v1/cms/settings/billtemplate/user/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function saveTemplateData(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_TEMPLATE_DATA,
        actionTypes.SAVE_TEMPLATE_DATA_SUCCEED,
        actionTypes.SAVE_TEMPLATE_DATA_FAIL,
      ],
      endpoint: 'v1/cms/settings/template/formdata/save',
      method: 'post',
      data: datas,
    },
  };
}

export function countFieldsChange(values) {
  return {
    type: actionTypes.COUNT_FIELDS_CHANGE,
    data: values,
  };
}

export function loadTemplateFormVals(templateId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FORM_VALS,
        actionTypes.LOAD_FORM_VALS_SUCCEED,
        actionTypes.LOAD_FORM_VALS_FAIL,
      ],
      endpoint: 'v1/cms/settings/template/form/values/load',
      method: 'get',
      params: { templateId },
    },
  };
}

export function createGeneratedTemplate(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_GENERATED_TEMPLATE,
        actionTypes.SAVE_GENERATED_TEMPLATE_SUCCEED,
        actionTypes.SAVE_GENERATED_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/cms/settings/template/generated/create',
      method: 'post',
      data: datas,
    },
  };
}

export function validateTempName(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.VALIDATE_NAME,
        actionTypes.VALIDATE_NAME_SUCCEED,
        actionTypes.VALIDATE_NAME_FAIL,
      ],
      endpoint: 'v1/cms/settings/template/validate/name',
      method: 'get',
      params,
    },
  };
}

export function showSendDeclsModal({ visible = true, preEntrySeqNo = '', delgNo = '', agentCustCo }) {
  return {
    type: actionTypes.SHOW_SEND_DECLS_MODAL,
    data: { visible, preEntrySeqNo, delgNo, agentCustCo },
  };
}

export function showEditBodyModal(val) {
  return {
    type: actionTypes.SHOW_EDIT_BODY_MODAL,
    data: val,
  };
}

export function validateBillDatas(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.VALIDATE_BILL_DATAS,
        actionTypes.VALIDATE_BILL_DATAS_SUCCEED,
        actionTypes.VALIDATE_BILL_DATAS_FAIL,
      ],
      endpoint: 'v1/cms/manifest/bill/datas/validate',
      method: 'post',
      data: datas,
    },
  };
}

export function changeTempInfo(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHANGE_TEMP_INFO,
        actionTypes.CHANGE_TEMP_INFO_SUCCEED,
        actionTypes.CHANGE_TEMP_INFO_FAIL,
      ],
      endpoint: 'v1/cms/manifest/template/info/change',
      method: 'post',
      data,
    },
  };
}

export function showDeclElementsModal(element, id, gModel, disabled, name) {
  return {
    type: actionTypes.SHOW_DECL_ELEMENTS_MODAL,
    element,
    id,
    gModel,
    disabled,
    name,
  };
}

export function hideDeclElementsModal() {
  return {
    type: actionTypes.HIDE_DECL_ELEMENTS_MODAL,
  };
}
