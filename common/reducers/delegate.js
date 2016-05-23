import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
import { appendFormAcitonTypes, formReducer, isFormDataLoadedC, loadFormC, assignFormC,
  clearFormC, setFormValueC } from '../../../reusable/domains/redux/form-common';
import { CORP_EDIT_SUCCEED } from './corps';
const actionTypes = createActionTypes('@@welogix/delegate/', [
  'SWITCH_TENANT', 'SEND_LOAD_SUCCEED',
  'SEND', 'SEND_SUCCEED', 'SEND_FAIL',
  'INVALID', 'INVALID_SUCCEED', 'INVALID_FAIL',
  'LOG_LOAD', 'LOG_LOAD_SUCCEED', 'LOG_LOAD_FAIL',
  'MASTER_TENANTS_LOAD', 'MASTER_TENANTS_LOAD_SUCCEED', 'MASTER_TENANTS_LOAD_FAIL',
  'SWITCH_STATUS', 'SWITCH_STATUS_SUCCEED', 'SWITCH_STATUS_FAIL',
  'FILE_UPLOAD', 'FILE_UPLOAD_SUCCEED', 'FILE_UPLOAD_FAIL', 'REMOVEFILE',
  'ID_LOAD_CUSTOMSBROKERS', 'ID_LOAD_CUSTOMSBROKERS_SUCCEED', 'ID_LOAD_CUSTOMSBROKERS_FAIL',
  'delegate_SUBMIT', 'delegate_SUBMIT_SUCCEED', 'delegate_SUBMIT_FAIL',
  'delegate_DELETE', 'delegate_DELETE_SUCCEED', 'delegate_DELETE_FAIL',
  'delegate_EDIT', 'Delegate_EDIT_SUCCEED', 'delegate_EDIT_FAIL',
  'delegate_LOAD', 'delegate_LOAD_SUCCEED', 'delegate_LOAD_FAIL',
  'ID_LOAD_STATUS_SUCCEED', 'ID_LOAD_STATUS_FAIL', 'ID_LOAD_STATUS',
  'ID_LOAD_SELECTOPTIONS', 'ID_LOAD_SELECTOPTIONS_SUCCEED', 'ID_LOAD_SELECTOPTIONS_FAIL',
  'delegate_UnsentUnsent', 'delegate_UnsentUnsent_SUCCEED', 'delegate_UnsentUnsent_FAIL']);
appendFormAcitonTypes('@@welogix/delegate/', actionTypes);

const initialState = {
  loaded: false,
  loading: false,
  needUpdate: false,
  selectedIndex: -1,
  customs_code: [],
  tenant: {
    id: -1,
    parentId: -1
  },
  customs: {
    code: -1
  },
  formData: {},
  delegateist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: []
  },
  customsBrokerList: [],
  selectOptions: {
    customsInfoList: [],
    declareWayList: [],
    tradeModeList: [],
    declareFileList: [],
    declareCategoryList: []
  },
  statusList: { // 初始化状态显示数量
    notSendCount: 0,
    notAcceptCount: 0,
    acceptCount: 0,
    invalidCount: 0
  },
  sendlist: {
    data: []
  },
  loglist: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: []
  }
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CORP_EDIT_SUCCEED:
      // 租户变化时重新加载
      return { ...state, loaded: false };
    case actionTypes.delegate_LOAD:
      return {...state, loading: true, needUpdate: false};
    case actionTypes.delegate_LOAD_SUCCEED:
      return {...state, loaded: true, loading: false,
        delegateist: {...state.delegateist, ...action.result.data}
      };
    case actionTypes.delegate_LOAD_FAIL:
      return {...state, loading: false};
    case actionTypes.delegate_UnsentUnsent:
      return {...state, loading: true, needUpdate: false};
    case actionTypes.delegate_UnsentUnsent_SUCCEED:
      return {...state, loaded: true, loading: false,
        delegateist: {...state.delegateist, ...action.result.data}
      };
      case actionTypes.ID_LOAD_SELECTOPTIONS_SUCCEED:
      return {...state,
        selectOptions: {...state.selectOptions,
          customsInfoList: action.result.data.customsInfoList,
          declareWayList: action.result.data.declareWayList,
          tradeModeList: action.result.data.tradeModeList,
          declareFileList: action.result.data.declareFileList,
          declareCategoryList: action.result.data.declareCategoryList
        }
      };
       case actionTypes.ID_LOAD_CUSTOMSBROKERS_SUCCEED:
      return {...state,
        customsBrokerList: action.result.data
      };
      case actionTypes.REMOVEFILE:
      {
        const selectOptions = {...state.selectOptions
        };
        selectOptions.declareFileList[action.index].fileflag = -1;
        return {...state,
          selectOptions
        };
      }
      case actionTypes.LOG_LOAD_SUCCEED:
      return {...state,
        loaded: true,
        loading: false,
        loglist: action.result.data.loglist
      };
      case actionTypes.SEND_LOAD_SUCCEED:
      return {...state,
        loaded: true,
        loading: false,
        sendlist: {
          data: action.sendlist.data
        }
      };
       case actionTypes.SEND_SUCCEED:
      {
        const delegateist = {...state.delegateist
        };
        const newlist = [];

        delegateist.data.map((item) => {
          if (action.params.sendlist.indexOf(item.key) === -1) {
            newlist.push(item);
          }
        });

        return {...state,
          delegateist: {...state.delegateist,
            data: newlist
          },
          statusList: {...state.statusList,
            notSendCount: state.statusList.notSendCount - (action.params.sendlist.length) * (action.params.status === '0' ? 1 : -1),
            notAcceptCount: state.statusList.notAcceptCount + (action.params.sendlist.length) * (action.params.status === '0' ? 1 : -1)
          }
        };
      }
      case actionTypes.ID_LOAD_STATUS:
      return {...state,
        statusList: initialState.statusList
      };
      case actionTypes.FILE_UPLOAD_SUCCEED:
      {
        const selectOptions = {...state.selectOptions
        };
        selectOptions.declareFileList.push({
          id: -1,
          url: action.result.data,
          doc_name: action.fileName,
          category: action.category,
          fileflag: 0
        });
        selectOptions.declareCategoryList.push({
          category: action.category
        });
        return {...state,
          selectOptions
        };
      }
    case actionTypes.ID_LOAD_STATUS_SUCCEED:
      return {...state,
        statusList: {...state.statusList,
          invalidCount: action.result.data.invalidCount,
          notSendCount: action.result.data.notSendCount,
          notAcceptCount: action.result.data.notAcceptCount,
          acceptCount: action.result.data.acceptCount
        }
      };
    case actionTypes.ID_LOAD_STATUS_FAIL:
      return {...state,
        statusList: initialState.statusList
      };
    case actionTypes.delegate_UnsentUnsent_FAIL:
      return {...state, loading: false};
    case actionTypes.MASTER_TENANTS_LOAD_SUCCEED:
      return {...state, branches: action.result.data,
        tenant: action.result.data.length > 0 ? {
          id: action.result.data[0].key,
          parentId: action.result.data[0].parentId
        } : {}};
     case actionTypes.MASTER_Master_Customs_LOAD_SUCCEED:
      return {...state, customs_code: action.result.data,
        tenant: action.result.data.length > 0 ? {
          id: action.result.data[0].key,
          parentId: action.result.data[0].parentId
        } : {}};
    case actionTypes.SWITCH_TENANT:
      return {...state, tenant: action.tenant};
    case actionTypes.Customs_CodeS:
      return {...state, customs_code: action.customs_code};
    case actionTypes.SWITCH_STATUS_SUCCEED: {
      const delegateist = {...state.delegateist};
      delegateist.data[action.index].status = action.data.status;
      return {...state, delegateist};
    }
    case actionTypes.Delegate_EDIT_SUCCEED: {
      if (state.selectedIndex !== -1) {
          const delegateist = {...state.delegateist
          };
          delegateist.data[state.selectedIndex] = action.data.delegate;
          return {...state,
            selectedIndex: -1,
            delegateist
          };
        } else {
          return {...state
          };
        }
    }
    case actionTypes.delegate_DELETE_SUCCEED: {
      return { ...state, delegateist: {...state.delegateist, totalCount: state.delegateist.totalCount - 1}, needUpdate: true };
    }
    case actionTypes.delegate_SUBMIT_SUCCEED: {
      const delegateist = {...state.delegateist
        };
        const statusList = {...state.statusList
        };
        if ((delegateist.current - 1) * delegateist.pageSize <= delegateist.totalCount // '=' because of totalCount 0
          && delegateist.current * delegateist.pageSize > delegateist.totalCount) {
          delegateist.data.push(action.result.data);
        }
        delegateist.totalCount++;
        statusList.notSendCount++;
        return {...state,
          delegateist,
          statusList
        };
    }
    case actionTypes.INVALID_SUCCEED:
      {
        const delegateist = {...state.delegateist
        };
        const newlist = [];

        delegateist.data.map((item) => {
          if (item.key !== action.params.delegateId) {
            newlist.push(item);
          }
        });

        return {...state,
          delegateist: {...state.delegateist,
            data: newlist
          },
          statusList: {...state.statusList,
            notSendCount: state.statusList.notSendCount - (action.params.curStatus === 0 ? 1 : 0),
            notAcceptCount: state.statusList.notAcceptCount - (action.params.curStatus === 1 ? 1 : 0),
            acceptCount: state.statusList.acceptCount - (action.params.curStatus === 2 ? 1 : 0),
            invalidCount: state.statusList.invalidCount + 1
          }
        };
      }
    // todo deal with submit fail submit loading
    default:
      return formReducer(actionTypes, state, action, {}, 'delegateist')
            || state;
  }
}

export function deldelegate(idkey) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.delegate_DELETE, actionTypes.delegate_DELETE_SUCCEED, actionTypes.delegate_DELETE_FAIL],
      endpoint: 'v1/delegate/delete',
      method: 'del',
      data: { idkey }
    }
  };
}

export function edit(delegate, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.delegate_EDIT, actionTypes.Delegate_EDIT_SUCCEED, actionTypes.delegate_EDIT_FAIL],
      endpoint: 'v1/delegate/edit',
      method: 'put',
      data: { delegate, params }
    }
  };
}

export function submit(delegate, tenantId, params, loginId, username) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.delegate_SUBMIT, actionTypes.delegate_SUBMIT_SUCCEED, actionTypes.delegate_SUBMIT_FAIL],
      endpoint: 'v1/delegate/submit',
      method: 'post',
      data: { delegate, tenantId, params, loginId, username }
    }
  };
}
export function isFormDataLoaded(delegateState, persId) {
  return isFormDataLoadedC(persId, delegateState, 'delegateist');
}

export function loadForm(cookie, persId) {
  return loadFormC(cookie, 'v1/delegate/delegate', {pid: persId}, actionTypes);
}

export function assignForm(delegateState, persId) {
  return assignFormC(persId, delegateState, 'delegateist', actionTypes);
}

export function clearForm() {
  return clearFormC(actionTypes);
}

export function setFormValue(field, newValue) {
  return setFormValueC(actionTypes, field, newValue);
}
export function loadSend(sendlist) {
  return {
    type: actionTypes.SEND_LOAD_SUCCEED,
    sendlist
  };
}

export function loaddelegate(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.delegate_LOAD, actionTypes.delegate_LOAD_SUCCEED, actionTypes.delegate_LOAD_FAIL],
      endpoint: 'v1/delegate/delegate',
      method: 'get',
      params,
      cookie
    }
  };
}

export function loadTenantsByMaster(cookie, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.MASTER_TENANTS_LOAD, actionTypes.MASTER_TENANTS_LOAD_SUCCEED, actionTypes.MASTER_TENANTS_LOAD_FAIL],
      endpoint: `v1/delegate/${tenantId}/tenants`,
      method: 'get',
      cookie
    }
  };
}

export function loadSelectOptions(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_LOAD_SELECTOPTIONS, actionTypes.ID_LOAD_SELECTOPTIONS_SUCCEED, actionTypes.ID_LOAD_SELECTOPTIONS_FAIL],
      endpoint: `v1/delegate/getSelectOptions`,
      method: 'get',
      cookie,
      params
    }
  };
}

export function switchTenant(tenant) {
  return {
    type: actionTypes.SWITCH_TENANT,
    tenant
  };
}
export function switchStatus(index, pid, status) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SWITCH_STATUS, actionTypes.SWITCH_STATUS_SUCCEED, actionTypes.SWITCH_STATUS_FAIL],
      endpoint: 'v1/delegate/status',
      method: 'put',
      index,
      data: { status, pid }
    }
  };
}
  export function UnsentUnsent(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.delegate_UnsentUnsent, actionTypes.delegate_UnsentUnsent_SUCCEED, actionTypes.delegate_UnsentUnsent_FAIL],
      endpoint: 'v1/delegate/UnsentUnsent',
      method: 'put',
      params,
      cookie
    }
  };
}
export function loadStatus(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_LOAD_STATUS, actionTypes.ID_LOAD_STATUS_SUCCEED, actionTypes.ID_LOAD_STATUS_FAIL],
      endpoint: 'v1/delegate/StatusG',
      method: 'get',
      cookie,
      params
    }
  };
}
export function uploadFiles(file, fileName, category) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.FILE_UPLOAD, actionTypes.FILE_UPLOAD_SUCCEED, actionTypes.FILE_UPLOAD_FAIL],
      endpoint: 'v1/upload/img',
      method: 'post',
      files: file,
      fileName,
      category
    }
  };
}
export function removeFile(index) {
  return {
    type: actionTypes.REMOVEFILE,
    index
  };
}
export function sendDelegate(params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SEND, actionTypes.SEND_SUCCEED, actionTypes.SEND_FAIL],
      endpoint: 'v1/delegate/senddelegate',
      method: 'put',
      params
    }
  };
}
export function loadCustomsBrokers(cookie, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_LOAD_CUSTOMSBROKERS, actionTypes.ID_LOAD_CUSTOMSBROKERS_SUCCEED, actionTypes.ID_LOAD_CUSTOMSBROKERS_FAIL],
      endpoint: `v1/delegate/${tenantId}/customsBrokers`,
      method: 'get',
      cookie
    }
  };
}
export function loadLogs(params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOG_LOAD, actionTypes.LOG_LOAD_SUCCEED, actionTypes.LOG_LOAD_FAIL],
      endpoint: 'v1/delegate/exportdelegatelogs',
      method: 'get',
      params
    }
  };
}
export function invalidDelegate(params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.INVALID, actionTypes.INVALID_SUCCEED, actionTypes.INVALID_FAIL],
      endpoint: 'v1/delegate/invalidDelegate',
      method: 'put',
      params
    }
  };
}
