import React, { PropTypes } from 'react';
import Menu from '../../common/manage/manageMenu';

export default class ImportManageMenu extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  }
  render() {
    return <Menu type="import" { ...this.props } />;
  }
}
