import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadAcceptanceTable } from 'common/reducers/cmsDelegation';
import List from '../../common/delegation/list';

function fetchData({ state, dispatch }) {
  return dispatch(loadAcceptanceTable({
    ietype: 'import',
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.cmsDelegation.listFilter),
    pageSize: state.cmsDelegation.delegationlist.pageSize,
    currentPage: state.cmsDelegation.delegationlist.current,
  }));
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'import' })
export default class ImportAcceptanceList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <List ietype="import" {...this.props} />;
  }
}
