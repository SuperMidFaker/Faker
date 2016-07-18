import React, { PropTypes } from 'react';
import List from '../../common/manage/manage';

export default class ExportManageList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <List type="export" {...this.props} />;
  }
}
