import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadAcceptanceTable, loadFormRequire } from 'common/reducers/cmsDelegation';
import DelegationList from '../../common/delegation/list';

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadAcceptanceTable({
    ietype: 'export',
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    filter: JSON.stringify(state.cmsDelegation.listFilter),
    pageSize: state.cmsDelegation.delegationlist.pageSize,
    currentPage: state.cmsDelegation.delegationlist.current,
  })));
  promises.push(dispatch(
    loadFormRequire(state.account.tenantId, 'export')
  ));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'export' })
export default class ExportDelegationList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <DelegationList ietype="export" {...this.props} />;
  }
}
