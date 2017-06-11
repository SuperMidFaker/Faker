import React from 'react';
import PropTypes from 'prop-types';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadDelgBill, loadManifestTableParams } from 'common/reducers/cmsManifest';
import { loadPartnersByTypes } from 'common/reducers/partner';
import ManifestList from '../../common/manifest/list';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

function fetchData({ state, dispatch }) {
  const proms = [
    dispatch(loadManifestTableParams()),
    dispatch(loadPartnersByTypes(state.account.tenantId, [PARTNER_ROLES.CUS, PARTNER_ROLES.DCUS], PARTNER_BUSINESSE_TYPES.clearance)),
    dispatch(loadDelgBill({
      ietype: 'import',
      tenantId: state.account.tenantId,
      loginId: state.account.loginId,
      filter: JSON.stringify({ ...state.cmsManifest.listFilter, clientView: { tenantIds: [], partnerIds: [] } }),
      pageSize: state.cmsManifest.delgBillList.pageSize,
      currentPage: state.cmsManifest.delgBillList.current,
    }))];
  return Promise.all(proms);
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'import' })
export default class ImportManifestList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <ManifestList ietype="import" {...this.props} />;
  }
}
