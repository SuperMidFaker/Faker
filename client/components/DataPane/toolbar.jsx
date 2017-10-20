import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class Toolbar extends Component {
  static defaultProps = {
    baseCls: 'welo-data-pane',
  }
  static propTypes = {
    total: PropTypes.node,
  }
  render() {
    const { baseCls } = this.props;
    return (
      <div className={`${baseCls}-toolbar`}>
        {this.props.children}
      </div>
    );
  }
}
