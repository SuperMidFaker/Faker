import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import Edit from '../../common/acceptance/edit';
import { loadDelg } from 'common/reducers/cmsDelegation';

function fetchData({ cookie, params, dispatch, state }) {
  return dispatch(loadDelg(cookie, {
    delgNo: params.delgNo,
    tenantId: state.account.tenantId,
    ieType: 'export',
  })
  );
}

@connectFetch()(fetchData)
export default class ExportAcceptanceEdit extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Edit type="export" {...this.props} />;
  }
}
