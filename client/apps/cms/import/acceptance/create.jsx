import React, { PropTypes } from 'react';
import Create from '../../common/acceptance/create';

export default class ImportAcceptanceCreate extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Create type="import" { ...this.props } />;
  }
}
