import React, { PropTypes } from 'react';
import DeclareView from '../../common/declare/view';

export default class ImportDeclareView extends React.Component {
  static propTypes = {
    params: PropTypes.object,
  }
  render() {
    return <DeclareView params={this.props.params} ietype="import" />;
  }
}
