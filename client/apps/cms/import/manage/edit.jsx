import React, { PropTypes } from 'react';
import Edit from '../../common/manage/edit';

export default class ImportManageCreate extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Edit type="import" { ...this.props } />;
  }
}
