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
    ieType: 'import',
  })
  );
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'import', action: 'edit' })
export default class ImportAcceptanceEdit extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Edit type="import" {...this.props} />;
  }
}
