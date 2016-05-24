import {
  CLIENT_API
} from '../requester';
import {
  createActionTypes
} from 'client/common/redux-actions';
import {
  appendFormAcitonTypes,
  formReducer,
  isFormDataLoadedC,
  loadFormC,
  assignFormC,
  clearFormC,
  setFormValueC
} from './form-common';
const actionTypes = createActionTypes('@@welogix/exporttask/', [
  'TASK_LOAD', 'TASK_LOAD_SUCCEED', 'TASK_LOAD_FAIL',
  'SOURCE_LOAD', 'SOURCE_LOAD_SUCCEED', 'SOURCE_LOAD_FAIL',
  'LIST_LOAD', 'LIST_LOAD_SUCCEED', 'LIST_LOAD_FAIL'
]);
appendFormAcitonTypes('@@welogix/exporttask/', actionTypes);

export const TASK_EDIT_SUCCEED = actionTypes.TASK_EDIT_SUCCEED;
const initialState = {
  loaded: false,
  loading: false,
  selectedIndex: -1,
  tenant: {
    id: -1,
    parentId: -1
  },
  formData: {
    key: -1
  },
  exporttasklist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: []
  },
  billlist:[],
  statusList: { // 初始化状态显示数量
    statusValue: 1,
    haveOrderCount: 0,
    closeOrderCount: 0
  },
  selectSource: {
    CustomsRel: [],
    Trade: [],
    Transac: [],
    Transf: [],
    Country: [],
    Levytype: [],
    District: [],
    Curr: [],
    Port: []
  }
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TASK_LOAD:
      return {...state,
        loading: true
      };
    case actionTypes.TASK_LOAD_SUCCEED:
      return {...state,
        loaded: true,
        loading: false,
        statusList: {...state.statusList,
          statusValue: action.params.currentStatus || '1',
          haveOrderCount: action.result.data.statusList.haveOrderCount,
          closeOrderCount: action.result.data.statusList.closeOrderCount
        },
        exporttasklist: action.result.data.exporttasklist
      };
    case actionTypes.TASK_LOAD_FAIL:
      return {...state,
        loading: false
      };
    case actionTypes.SOURCE_LOAD_SUCCEED:
      return {...state,
        selectSource: {...state.selectSource,
          CustomsRel: action.result.data.CustomsRel,
          Trade: action.result.data.Trade,
          Transac: action.result.data.Transac,
          Transf: action.result.data.Transf,
          Country: action.result.data.Country,
          Levytype: action.result.data.Levytype,
          District: action.result.data.District,
          Curr: action.result.data.Curr,
          Port: action.result.data.Port
        }
      };
    case actionTypes.LIST_LOAD_SUCCEED:
    return {...state,
      billlist:action.result.data
    };
      // todo deal with submit fail submit loading
    default:
      return formReducer(actionTypes, state, action, {}, 'exporttasklist') || state;
  }
}

export function loadSelectSource() {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SOURCE_LOAD, actionTypes.SOURCE_LOAD_SUCCEED, actionTypes.SOURCE_LOAD_FAIL],
      endpoint: 'v1/export/exporttasks/loadSource',
      method: 'get'
    }
  };
}

export function loadExportTask(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.TASK_LOAD, actionTypes.TASK_LOAD_SUCCEED, actionTypes.TASK_LOAD_FAIL],
      endpoint: 'v1/export/exporttasks',
      method: 'get',
      params,
      cookie
    }
  };
}

export function getBillList(params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LIST_LOAD, actionTypes.LIST_LOAD_SUCCEED, actionTypes.LIST_LOAD_FAIL],
      endpoint: 'v1/export/exporttasks/billlist',
      method: 'get',
      params
    }
  };
}

export function assignForm(exporttaskState, key) {
  return assignFormC(key, exporttaskState, 'exporttasklist', actionTypes);
}

export function isFormDataLoaded(exporttaskState, key) {
  return isFormDataLoadedC(key, exporttaskState, 'exporttasklist');
}

export function clearForm() {
  return clearFormC(actionTypes);
}

export function setFormValue(field, newValue) {
  return setFormValueC(actionTypes, field, newValue);
}

export function loadForm(cookie, key) {
  return loadFormC(cookie, 'v1/export/exporttask', {
    del_id: key
  }, actionTypes);
}
