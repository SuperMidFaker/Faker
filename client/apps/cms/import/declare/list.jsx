import React, { PropTypes } from 'react';
import DeclareList from '../../common/declare/list';

export default class ImportDeclareList extends React.Component {
  static propTypes = {
    params: PropTypes.object,
  }
  render() {
    return <DeclareList params={this.props.params} ietype="import" />;
  }
}
