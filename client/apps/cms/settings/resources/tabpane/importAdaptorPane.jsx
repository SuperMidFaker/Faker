import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LineFileAdaptorPane from 'client/components/LineFileAdaptorPane';
import { LINE_FILE_ADAPTOR_MODELS } from 'common/constants';

const impModels = [LINE_FILE_ADAPTOR_MODELS.CMS_MANIFEST_BODY];

@connect(state => ({
  customer: state.cmsResources.customer,
}))
export default class ImportAdaptorPane extends Component {
  static propTyps = {
    customer: PropTypes.shape({ id: PropTypes.number }).isRequired,
  }
  render() {
    return <LineFileAdaptorPane owner={this.props.customer} impModels={impModels} />;
  }
}
