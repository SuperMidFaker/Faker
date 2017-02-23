import React, { PropTypes } from 'react';
import withPrivilege from 'client/common/decorators/withPrivilege';
import Create from '../../common/delegation/create';

@withPrivilege({ module: 'clearance', feature: 'import', action: 'create' })
export default class ImportAcceptanceCreate extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Create type="import" {...this.props} />;
  }
}
