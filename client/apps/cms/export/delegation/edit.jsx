import React from 'react';
import PropTypes from 'prop-types';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import Edit from '../../common/delegation/edit';
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
@withPrivilege({ module: 'clearance', feature: 'export', action: 'edit' })
export default class ExportAcceptanceEdit extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Edit type="export" {...this.props} />;
  }
}
