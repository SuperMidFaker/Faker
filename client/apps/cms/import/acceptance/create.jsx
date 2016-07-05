import React, { PropTypes } from 'react';
import Form from '../../common/acceptance/form';

export default class ImportAcceptanceCreate extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Form type="import" { ...this.props } />;
  }
}
