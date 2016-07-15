import React, { PropTypes } from 'react';

export default class Dashboard extends React.Component {
  static propTypes = {
    children: PropTypes.object,
  };
  render() {
    return this.props.children;
  }
}
