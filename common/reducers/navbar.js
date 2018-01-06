import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/navbar/', [
  'NAVB_SET_TITLE', 'NAVB_GOBACK',
]);

const initialState = {
  navTitle: {
    depth: 1,
    // 第一级为首页,不显示相关导航标题信息
    // 第二级为模块公共信息,显示模块导航栏
    // 第三级为当前编辑页面内容信息与返回图标
    text: '',
    moduleName: '',
    jumpOut: false,
    stack: 0, // depth 3 link jumps
  },
  backed: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.NAVB_SET_TITLE: {
      let { stack } = state.navTitle;
      if (state.navTitle.depth === 3 && action.navInfo.depth === 3) {
        if (!state.backed) {
          stack++; // 页面回退时stack不变
        }
      } else if (action.navInfo.depth === 2) {
        stack = 1;
      }
      return { ...state, navTitle: { ...state.navTitle, ...action.navInfo, stack }, backed: false };
    }
    case actionTypes.NAVB_GOBACK: {
      return {
        ...state,
        navTitle: { ...state.navTitle, stack: state.navTitle.stack - 1 },
        backed: true,
      };
    }
    default:
      return state;
  }
}

export function setNavTitle(navInfo) {
  return {
    type: actionTypes.NAVB_SET_TITLE,
    navInfo,
  };
}

export function goBackNav() {
  return { type: actionTypes.NAVB_GOBACK };
}
