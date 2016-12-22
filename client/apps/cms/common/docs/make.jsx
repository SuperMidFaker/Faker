import React, { PropTypes } from 'react';
import BillEditor from './BillEditor';

export default class DeclareMake extends React.Component {
  static propTypes = {
    ietype: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
  }

  render() {
    const { ietype, params } = this.props;
    return <BillEditor ietype={ietype} params={params} />;
  }
}
