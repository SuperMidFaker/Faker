import React, { PropTypes } from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadBill, loadCmsParams } from 'common/reducers/cmsManifest';
import ManifestEditor from '../../common/manifest/editor';

function fetchData({ dispatch, params, state }) {
  const promises = [];
  promises.push(dispatch(loadBill(params.billno, state.account.tenantId, 'export')));
  promises.push(dispatch(loadCmsParams({
    ieType: 'export',
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
@withPrivilege({ module: 'clearance', feature: 'export' })
export default class ExportManifestView extends React.Component {
  static propTypes = {
    params: PropTypes.object,
    manifestSpinning: PropTypes.bool.isRequired,
  }
  render() {
    return <Spin spinning={this.props.manifestSpinning}><ManifestEditor ietype="export" params={this.props.params} readonly /></Spin>;
  }
}
