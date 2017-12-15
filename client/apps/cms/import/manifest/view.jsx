import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadBill, loadCmsParams } from 'common/reducers/cmsManifest';
import ManifestEditor from '../../common/manifest/editor';

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadBill(params.billno)));
  promises.push(dispatch(loadCmsParams()));
  return Promise.all(promises);
}
@connect(state => ({
  manifestSpinning: state.cmsManifest.manifestLoading,
}))
@connectFetch()(fetchData)
export default class ImportManifestView extends React.Component {
  static propTypes = {
    params: PropTypes.object,
    manifestSpinning: PropTypes.bool.isRequired,
  }
  render() {
    return <ManifestEditor ietype="import" params={this.props.params} manifestSpinning={this.props.manifestSpinning} readonly />;
  }
}
