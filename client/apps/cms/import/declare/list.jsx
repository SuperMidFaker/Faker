import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import DeclareList from '../../common/declare/list';
import { loadDelgList } from 'common/reducers/cmsDeclare';

function fetchData({ state, dispatch, cookie, params }) {
  const filter = { ...state.cmsDeclare.listFilter, declareType: params.status };
  return dispatch(loadDelgList(cookie, {
    ietype: 'import',
    tenantId: state.account.tenantId,
    filter: JSON.stringify(filter),
    pageSize: state.cmsDeclare.delgList.pageSize,
    current: 1,
  }));
}

@connectFetch()(fetchData)
export default class ImportDeclareList extends React.Component {
  static propTypes = {
    params: PropTypes.object,
  }
  render() {
    return <DeclareList params={this.props.params} ietype="import" />;
  }
}
