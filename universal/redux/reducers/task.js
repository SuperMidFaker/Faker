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
const actionTypes = createActionTypes('@@welogix/task/', [
  'TASK_LOAD', 'TASK_LOAD_SUCCEED', 'TASK_LOAD_FAIL',
  'SOURCE_LOAD', 'SOURCE_LOAD_SUCCEED', 'SOURCE_LOAD_FAIL'
]);
appendFormAcitonTypes('@@welogix/task/', actionTypes);

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
  tasklist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: []
  },
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
        tasklist: action.result.data.tasklist
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
      // todo deal with submit fail submit loading
    default:
      return formReducer(actionTypes, state, action, {}, 'tasklist') || state;
  }
}

export function loadSelectSource() {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SOURCE_LOAD, actionTypes.SOURCE_LOAD_SUCCEED, actionTypes.SOURCE_LOAD_FAIL],
      endpoint: 'v1/import/tasks/loadSource',
      method: 'get'
    }
  };
}

export function loadTask(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.TASK_LOAD, actionTypes.TASK_LOAD_SUCCEED, actionTypes.TASK_LOAD_FAIL],
      endpoint: 'v1/import/tasks',
      method: 'get',
      params,
      cookie
    }
  };
}

export function assignForm(taskState, key) {
  return assignFormC(key, taskState, 'tasklist', actionTypes);
}

export function isFormDataLoaded(taskState, key) {
  return isFormDataLoadedC(key, taskState, 'tasklist');
}

export function clearForm() {
  return clearFormC(actionTypes);
}

export function setFormValue(field, newValue) {
  return setFormValueC(actionTypes, field, newValue);
}

export function loadForm(cookie, key) {
  return loadFormC(cookie, 'v1/import/task', {
    pid: key
  }, actionTypes);
}
