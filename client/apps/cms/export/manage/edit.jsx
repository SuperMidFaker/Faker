import React, { PropTypes } from 'react';
import Edit from '../../common/manage/edit';

export default class ExportManageCreate extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Edit type="export" {...this.props} />;
  }
}
