import React, { PropTypes } from 'react';
import List from '../../common/acceptance/list';

export default class ImportAcceptanceList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <List type="import" {...this.props} />;
  }
}
