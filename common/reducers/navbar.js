import { createActionTypes } from '../../client/common/redux-actions';
const actionTypes = createActionTypes('@@welogix/navbar/', [
  'NAVB_SET_TITLE'
]);

const initialState = {
  navTitle: {
    depth: 1,
    // 第一级为首页,不显示相关导航标题信息
    // 第二级为模块公共信息,显示模块标题和图标
    // 第三级为当前编辑页面内容信息与返回图标
    text: '',
    moduleName: '',
    withModuleLayout: false,
    goBackFn: null
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.NAVB_SET_TITLE:
      return { ...state, navTitle: { ...state.navTitle, ...action.navInfo } };
    default:
      return state;
  }
}

export function setNavTitle(navInfo) {
  return {
    type: actionTypes.NAVB_SET_TITLE,
    navInfo
  };
}
