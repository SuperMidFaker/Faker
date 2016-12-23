import React, { PropTypes } from 'react';
import BillEditor from './BillEditor';

export default class DeclareView extends React.Component {
  static propTypes = {
    ietype: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
  }

  render() {
    const { ietype, params } = this.props;
    return <BillEditor ietype={ietype} params={params} readonly />;
  }
}
