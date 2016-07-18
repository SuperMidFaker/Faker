import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadAcceptanceTable } from 'common/reducers/cmsDelegation';
import List from '../../common/acceptance/list';

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadAcceptanceTable(cookie, {
    ietype: 'export',
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.cmsDelegation.listFilter),
    pageSize: state.cmsDelegation.delegationlist.pageSize,
    currentPage: state.cmsDelegation.delegationlist.current,
  }));
}

@connectFetch()(fetchData)
export default class ExportAcceptanceList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <List ietype="export" {...this.props} />;
  }
}
