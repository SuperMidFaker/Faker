import React, { PropTypes } from 'react';
import AmNavBar from 'client/components/am-navbar';

export default class AccountPack extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };

  render() {
    return (
      <div className="am-wrapper am-nosidebar-left">
        <AmNavBar />
        <div className="am-content">
          <div className="main-content">
          {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
