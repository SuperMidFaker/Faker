import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadBill, loadCmsParams } from 'common/reducers/cmsManifest';
import ManifestEditor from '../../common/manifest/editor';

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadBill(params.billno)));
  promises.push(dispatch(loadCmsParams()));
  return Promise.all(promises);
}
@connect(
  state => ({
    manifestSpinning: state.cmsManifest.manifestLoading,
  }),
  { }
)
@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'delegation', aciton: 'edit' })
export default class ExportManifestMake extends React.Component {
  static propTypes = {
    params: PropTypes.shape({ billno: PropTypes.string.isRequired }),
    manifestSpinning: PropTypes.bool.isRequired,
  }
  render() {
    return <ManifestEditor ietype="export" params={this.props.params} manifestSpinning={this.props.manifestSpinning} />;
  }
}
