import React, { PropTypes } from 'react';
import List from '../../common/manage/manage';

export default class ImportManageList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <List type="import" { ...this.props } />;
  }
}
