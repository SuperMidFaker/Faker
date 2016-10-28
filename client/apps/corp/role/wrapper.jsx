import React, { PropTypes } from 'react';

export default class Wrapper extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };
  render() {
    return (
      <div>
        <div className="main-content">
          {this.props.children}
        </div>
      </div>
    );
  }
}
