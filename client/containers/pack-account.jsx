import React, { PropTypes } from 'react';
import AmNavBar from '../components/am-navbar';

export default class CorpPack extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };

  render() {
    return (
      <div className="am-wrapper am-nosidebar-left">
        <AmNavBar />
        <div className="am-content">
          {this.props.children}
        </div>
      </div>);
  }
}
