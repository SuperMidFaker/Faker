import React, { PropTypes } from 'react';
import DeclareMake from '../../common/declare/make';

export default class ImportDeclareMake extends React.Component {
  static propTypes = {
    params: PropTypes.object,
  }
  render() {
    return <DeclareMake params={this.props.params} ietype="import" />;
  }
}
