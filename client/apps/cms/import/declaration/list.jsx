import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadDelgDecls } from 'common/reducers/cmsDeclare';
import List from '../../common/declaration/list';

function fetchData({ state, dispatch }) {
  return dispatch(loadDelgDecls({
    ietype: 'import',
    tenantId: state.account.tenantId,
    filter: JSON.stringify({ status: 'all' }),
    pageSize: state.cmsDeclare.delgdeclList.pageSize,
    currentPage: state.cmsDeclare.delgdeclList.current,
  }));
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'import' })
export default class ImportDelgDeclsList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <List ietype="import" {...this.props} />;
  }
}
