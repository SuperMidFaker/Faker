import {
  CLIENT_API
} from '../../../reusable/redux-middlewares/api';
import {
  createActionTypes
} from '../../../reusable/common/redux-actions';
import {
  appendFormAcitonTypes,
  formReducer,
  isFormDataLoadedC,
  loadFormC,
  assignFormC,
  clearFormC,
  setFormValueC
} from '../../../reusable/domains/redux/form-common';
const initialState = {
  loaded: false, // used by isLoad action
  loading: false,
  formData: {},
  selectedIndex: -1,
  editIndex: -1,
  tenant: {
    id: -1,
    parentId: -1
  },
  idlist: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: []
  },
  statusList: { // 初始化状态显示数量
    notAcceptCount: 0,
    acceptCount: 0,
    invalidCount: 0,
    revokedCount: 0
  },
  customsBrokerList: [],
  selectOptions: {
    customsInfoList: [],
    declareWayList: [],
    tradeModeList: [],
    shortNameList:[]
 }
};
// 定义操作状态 每个操作默认有三个状态 [进行时、成功、失败],在每个action提交的时候,type数组必须按照该类型排序
const actions = [
  'ID_LOAD', 'ID_LOAD_SUCCEED', 'ID_LOAD_FAIL', 'ID_SUBMIT', 'ID_SUBMIT_SUCCEED', 'ID_SUBMIT_FAIL', 'ID_BEGIN_EDIT', 'ID_EDIT',
  'ID_UPDATE', 'ID_UPDATE_SUCCEED', 'ID_UPDATE_FAIL', 'ID_DELETE', 'ID_DELETE_SUCCEED', 'ID_DELETE_FAIL', 'ID_EDIT_CANCEL', 'ID_LOAD_STATUS_SUCCEED',
  'ID_LOAD_STATUS_FAIL', 'ID_LOAD_STATUS',
  'ID_LOAD_CUSTOMSBROKERS', 'ID_LOAD_CUSTOMSBROKERS_SUCCEED', 'ID_LOAD_CUSTOMSBROKERS_FAIL',
  'ID_LOAD_SELECTOPTIONS', 'ID_LOAD_SELECTOPTIONS_SUCCEED', 'ID_LOAD_SELECTOPTIONS_FAIL',
  'FILE_UPLOAD', 'FILE_UPLOAD_SUCCEED', 'FILE_UPLOAD_FAIL',
  'IMPORT_EDIT', 'IMPORT_EDIT_SUCCEED', 'IMPORT_EDIT_FAIL'
];
const domain = '@@welogix/exportaccept/';
const actionTypes = createActionTypes(domain, actions);
appendFormAcitonTypes(domain, actionTypes);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.ID_LOAD:
      return {...state,
        loading: true,
        needUpdate: false
      };
    case actionTypes.ID_LOAD_SUCCEED:
      return {...state,
        loaded: true,
        loading: false,
        idlist: action.result.data
      };
    case actionTypes.ID_LOAD_FAIL:
      return {...state,
        loaded: true,
        loading: false,
        idlist: initialState.idlist
      };
    case actionTypes.FILE_UPLOAD_SUCCEED:
      {
        const form = {...state.formData
        };
        form[action.field] = action.result.data;
        return {...state,
          formData: form
        };
      }

    case actionTypes.ID_SUBMIT_SUCCEED:
      {
        const idlist = {...state.idlist
        };
        const statusList = {...state.statusList
        };
        if ((idlist.current - 1) * idlist.pageSize <= idlist.totalCount // '=' because of totalCount 0
          && idlist.current * idlist.pageSize > idlist.totalCount) {
          idlist.data.push(action.result.data);
        }
        idlist.totalCount++;
        statusList.revokedCount++;
        return {...state,
          idlist,
          statusList
        };
      }
    case actionTypes.ID_UPDATE_SUCCEED:
      {
        const idDataArray = [...state.idlist.data];
        idDataArray[state.editIndex] = action.data.exportaccept;
        return {...state,
          idlist: {...state.idlist,
            data: idDataArray
          },
          formData: {},
          editIndex: -1
        };
      }
    case actionTypes.ID_DELETE_SUCCEED:
      return {...state,
        needUpdate: true,
        idlist: {...state.idlist,
          totalCount: state.idlist.totalCount - 1
        }
      };
    case actionTypes.ID_BEGIN_EDIT:
      return {...state,
        formData: action.data.item,
        editIndex: action.data.index
      };
    case actionTypes.ID_EDIT:
      return {...state,
        formData: {...state.formData,
          [action.data.name]: action.data.value
        }
      };
    case actionTypes.ID_EDIT_CANCEL:
      return {...state,
        formData: {},
        editIndex: -1
      };
    case actionTypes.ID_LOAD_STATUS:
      return {...state,
        statusList: initialState.statusList
      };
    case actionTypes.ID_LOAD_STATUS_SUCCEED:
      return {...state,
        statusList: {...state.statusList,
          invalidCount: action.result.data.invalidCount,
          revokedCount: action.result.data.revokedCount,
          notAcceptCount: action.result.data.notAcceptCount,
          acceptCount: action.result.data.acceptCount
        }
      };
    case actionTypes.ID_LOAD_STATUS_FAIL:
      return {...state,
        statusList: initialState.statusList
      };
    case actionTypes.ID_LOAD_CUSTOMSBROKERS_SUCCEED:
      return {...state,
        customsBrokerList: action.result.data
      };
    case actionTypes.ID_LOAD_SELECTOPTIONS_SUCCEED:
      return {...state,
        selectOptions: {...state.selectOptions,
          customsInfoList: action.result.data.customsInfoList,
          declareWayList: action.result.data.declareWayList,
          tradeModeList: action.result.data.tradeModeList,
          shortNameList:action.result.data.shortNameList
        }
      };
    case actionTypes.IMPORT_EDIT_SUCCEED:
      {
        if (state.selectedIndex !== -1) {
          const idlist = {...state.idlist
          };
          idlist.data[state.selectedIndex] = action.data.exportaccept;
          return {...state,
            selectedIndex: -1,
            idlist
          };
        } else {
          return {...state
          };
        }
      }
    default:
      return formReducer(actionTypes, state, action, {}, 'idlist') || state;
      }
}

export function loadAccept(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_LOAD, actionTypes.ID_LOAD_SUCCEED, actionTypes.ID_LOAD_FAIL],
      endpoint: 'v1/export/exportaccepts',
      method: 'get',
      cookie,
      params
    }
  };
}


export function submit(exportaccept, username, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_SUBMIT, actionTypes.ID_SUBMIT_SUCCEED, actionTypes.ID_SUBMIT_FAIL],
      endpoint: 'v1/export/exportaccept',
      method: 'post',
      data: {
        exportaccept,
        username,
        tenantId
      }
    }
  };
}

export function updateId(exportaccept) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_UPDATE, actionTypes.ID_UPDATE_SUCCEED, actionTypes.ID_UPDATE_FAIL],
      endpoint: 'v1/export/exportaccept',
      method: 'put',
      data: {
        exportaccept
      }
    }
  };
}

export function delId(idkey) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_DELETE, actionTypes.ID_DELETE_SUCCEED, actionTypes.ID_DELETE_FAIL],
      endpoint: 'v1/export/exportaccept',
      method: 'del',
      data: {
        idkey
      }
    }
  };
}

export function loadStatus(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_LOAD_STATUS, actionTypes.ID_LOAD_STATUS_SUCCEED, actionTypes.ID_LOAD_STATUS_FAIL],
      endpoint: 'v1/export/status',
      method: 'get',
      cookie,
      params
    }
  };
}

export function loadCustomsBrokers(cookie, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_LOAD_CUSTOMSBROKERS, actionTypes.ID_LOAD_CUSTOMSBROKERS_SUCCEED, actionTypes.ID_LOAD_CUSTOMSBROKERS_FAIL],
      endpoint: `v1/export/${tenantId}/customsBrokers`,
      method: 'get',
      cookie
    }
  };
}

export function loadSelectOptions(cookie) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_LOAD_SELECTOPTIONS, actionTypes.ID_LOAD_SELECTOPTIONS_SUCCEED, actionTypes.ID_LOAD_SELECTOPTIONS_FAIL],
      endpoint: `v1/export/getSelectOptions`,
      method: 'get',
      cookie
    }
  };
}

export function assignForm(exportacceptState, idId) {
  return assignFormC(idId, exportacceptState, 'idlist', actionTypes);
}

export function isFormDataLoaded(exportacceptState, idId) {
  return isFormDataLoadedC(idId, exportacceptState, 'idlist');
}

export function loadForm(cookie, idId) {
  return loadFormC(cookie, 'v1/export/exportaccepts', {
    pid: idId
  }, actionTypes);
}

export function clearForm() {
  return clearFormC(actionTypes);
}

export function setFormValue(field, newValue) {
  return setFormValueC(actionTypes, field, newValue);
}

export function uploadFiles(field, file) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.FILE_UPLOAD, actionTypes.FILE_UPLOAD_SUCCEED, actionTypes.FILE_UPLOAD_FAIL],
      endpoint: 'v1/upload/img',
      method: 'post',
      files: file,
      field
    }
  };
}

export function edit(exportaccept, username, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.IMPORT_EDIT, actionTypes.IMPORT_EDIT_SUCCEED, actionTypes.IMPORT_EDIT_FAIL],
      endpoint: 'v1/export/exportaccept',
      method: 'put',
      data: {
        exportaccept,
        username,
        tenantId
      }
    }
  };
}


export function beginEdit(item, index) {
  return {
    type: actionTypes.ID_BEGIN_EDIT,
    data: {
      item,
      index
    }
  };
}


export function cancelEdit() {
  return {
    type: actionTypes.ID_EDIT_CANCEL
  };
}
