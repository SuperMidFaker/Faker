import React, { Component } from 'react';
import NodeList from '../components/NodeList.jsx';

export default class NodeListContainer extends Component {
  handleDeleteBtnClick = () => {
    console.log('delete clicked');
  }
  render() {
    return (
      <NodeList dataSource={[{name: 'node 1'}]} onDeleteBtnClick={this.handleDeleteBtnClick} />
    );
  }
}