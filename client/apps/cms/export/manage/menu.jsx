import React, { PropTypes } from 'react';
import Menu from '../../common/manage/manageMenu';

export default class ExportManageMenu extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  }
  render() {
    return <Menu type="export" {...this.props} />;
  }
}
