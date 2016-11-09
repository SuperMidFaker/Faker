import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadCiqTable } from 'common/reducers/cmsDelegation';
import CiqList from '../../common/delegation/ciqList';

function fetchData({ state, dispatch }) {
  return dispatch(loadCiqTable({
    ietype: 'export',
    tenantId: state.account.tenantId,
    filter: JSON.stringify({ status: 'all' }),
    pageSize: state.cmsDelegation.ciqlist.pageSize,
    currentPage: state.cmsDelegation.ciqlist.current,
  }));
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'import' })
export default class ImportAcceptanceList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <CiqList ietype="export" {...this.props} />;
  }
}
