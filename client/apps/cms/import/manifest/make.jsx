import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadBill, loadCmsParams } from 'common/reducers/cmsManifest';
import ManifestEditor from '../../common/manifest/editor';

function fetchData({ dispatch, params, state }) {
  const promises = [];
  promises.push(dispatch(loadBill(params.billno, state.account.tenantId, 'import')));
  promises.push(dispatch(loadCmsParams({
    ieType: 'import',
    tenantId: state.account.tenantId,
  })));
  return Promise.all(promises);
}
@connect(
  state => ({
    manifestSpinning: state.cmsManifest.manifestLoading,
  }),
  { }
)
@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'import', aciton: 'create' })
export default class ImportManifestMake extends React.Component {
  static propTypes = {
    params: PropTypes.object,
    manifestSpinning: PropTypes.bool.isRequired,
  }
  render() {
    return <ManifestEditor ietype="import" params={this.props.params} manifestSpinning={this.props.manifestSpinning} />;
  }
}
