import React from 'react';
import PropTypes from 'prop-types';
import withPrivilege from 'client/common/decorators/withPrivilege';
import Create from '../../common/delegation/create';

@withPrivilege({ module: 'clearance', feature: 'export', action: 'create' })
export default class ExportAcceptanceCreate extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Create type="export" {...this.props} />;
  }
}
