import React, { PropTypes } from 'react';
import withPrivilege from 'client/common/decorators/withPrivilege';
import CustomsDeclEditor from '../../common/customs/CustomsDeclEditor';

@withPrivilege({ module: 'clearance', feature: 'import' })
export default class ImportCustomsDelgView extends React.Component {
  static propTypes = {
    params: PropTypes.object,
  }
  render() {
    return <CustomsDeclEditor ietype="import" params={this.props.params} readonly />;
  }
}
