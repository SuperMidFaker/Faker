import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import Create from '../../common/delegate/create';
import { loadFormRequire, loadNewForm } from 'common/reducers/cmsDelegation';

function fetchData({ cookie, dispatch, state }) {
  const promises = [dispatch(loadNewForm()), dispatch(loadFormRequire(cookie, state.account.tenantId, 'import', 'CCB'))];
  return Promise.all(promises);
}

@connectFetch()(fetchData)
export default class ImportDelegateCreate extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Create type="import" {...this.props} />;
  }
}
