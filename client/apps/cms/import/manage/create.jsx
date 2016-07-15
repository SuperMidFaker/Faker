import React, { PropTypes } from 'react';
import Create from '../../common/manage/create';

export default class ImportManageCreate extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Create type="import" {...this.props} />;
  }
}
