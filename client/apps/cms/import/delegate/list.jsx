import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import List from '../../common/delegate/list';
import { loadDelegateTable, loadFormRequire } from 'common/reducers/cmsDelegation';


function fetchData({ state, dispatch, cookie }) {
  return Promise.all([dispatch(loadDelegateTable(cookie, {
    ietype: 'import',
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.cmsDelegation.delegateListFilter),
    pageSize: state.cmsDelegation.delegationlist.pageSize,
    currentPage: state.cmsDelegation.delegationlist.current,
  })),
  dispatch(
    loadFormRequire(cookie, state.account.tenantId, 'import')
  )]);
}

@connectFetch()(fetchData)
export default class ImportEntrustList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <List ietype="import" type="import" {...this.props} />;
  }
}
