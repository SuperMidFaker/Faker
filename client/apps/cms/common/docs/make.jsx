import React, { PropTypes } from 'react';
import EntryBill from './entryBill';

export default class DeclareMake extends React.Component {
  static propTypes = {
    ietype: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
  }

  render() {
    const { ietype, params } = this.props;
    return <EntryBill ietype={ietype} params={params} />;
  }
}
