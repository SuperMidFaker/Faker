import React, { Component } from 'react';
import { connect } from 'react-redux';
import NodeList from '../components/NodeList.jsx';
import connectFetch from 'reusable/decorators/connect-fetch';
import { loadNodeList } from '../../../../../universal/redux/reducers/transportResources';
import { addUniqueKeys } from '../utils/dataMapping';

function fetchData({dispatch, state}) {
  return dispatch(loadNodeList(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({nodes: state.transportResources.nodes, selectedMenuItemKey: state.transportResources.selectedMenuItemKey}))
export default class NodeListContainer extends Component {
  handleDeleteBtnClick = () => {
    console.log('delete clicked');
  }
  render() {
    const { nodes, selectedMenuItemKey } = this.props;
    const dataSource = addUniqueKeys(nodes);
    return (
      <NodeList dataSource={dataSource}
                visible={selectedMenuItemKey === '2'}
                onDeleteBtnClick={this.handleDeleteBtnClick} />
    );
  }
}
