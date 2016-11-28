import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import Create from '../../common/delegation/create';
import { loadFormRequire, loadNewForm } from 'common/reducers/cmsDelegation';

function fetchData({ cookie, dispatch, state }) {
  dispatch(loadNewForm());
  return dispatch(
    loadFormRequire(cookie, state.account.tenantId, 'export')
  );
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'export', action: 'create' })
export default class ExportAcceptanceCreate extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Create type="export" {...this.props} />;
  }
}
