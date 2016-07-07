import React, { PropTypes } from 'react';
import Edit from '../../common/acceptance/edit';

export default class ImportAcceptanceEdit extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Edit type="import" { ...this.props } />;
  }
}
