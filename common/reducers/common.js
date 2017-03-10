import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/common/', [
  'MAKE_EXCEL', 'MAKE_EXCEL_SUCCEED', 'MAKE_EXCEL_FAIL',
]);

const initialState = {

};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_FORMREQUIRE:
      // force formData change to rerender after formrequire load
      return { ...state };
    default:
      return { ...state };
  }
}

// 上传数据生成excel 返回 {filename}, 通过window.open(`${API_ROOTS.default}v1/common/excel/${filename}}) 下载生成好的excel
// sheets: [{name, data[][] }], filename: String
export function makeExcel(sheets, filename) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.MAKE_EXCEL,
        actionTypes.MAKE_EXCEL_SUCCEED,
        actionTypes.MAKE_EXCEL_FAIL,
      ],
      endpoint: 'v1/common/make/excel',
      method: 'post',
      data: { sheets, filename },
    },
  };
}
