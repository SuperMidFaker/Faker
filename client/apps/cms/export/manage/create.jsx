import React, { PropTypes } from 'react';
import Create from '../../common/manage/create';

export default class ExportManageCreate extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Create type="export" {...this.props} />;
  }
}
