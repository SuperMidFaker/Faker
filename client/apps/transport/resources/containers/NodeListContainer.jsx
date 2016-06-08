import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import NodeList from '../components/NodeList.jsx';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadNodeList, setNodeType, removeNode } from 'common/reducers/transportResources';

function fetchData({dispatch, state}) {
  return dispatch(loadNodeList(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  nodes: state.transportResources.nodes,
  nodeType: state.transportResources.nodeType,
}), { setNodeType, removeNode })
export default class NodeListContainer extends Component {
  static propTypes = {
    nodes: PropTypes.array.isRequired,                // 节点数组,包括发货地、收获地和中转地
    loading: PropTypes.bool.isRequired,               // 表示组件是否正在获取数据
    nodeType: PropTypes.number.isRequired,            // 当前选中的节点类型
    setNodeType: PropTypes.func.isRequired,           // 改变节点类型的action creator
    removeNode: PropTypes.func.isRequired,            // 移除某个节点时的action creator
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleDeleteBtnClick = (nodeId) => {
    this.props.removeNode(nodeId);
  }
  handleAddNoteBtnClick = () => {
    this.context.router.push('/transport/resources/add_node');
  }
  handleNodeTypeChange = (currentNodeType) => {
    this.props.setNodeType(currentNodeType);
  }
  render() {
    const { nodes, nodeType } = this.props;
    const toDisplayNodes = nodes.filter(node => node.type === nodeType);
    return (
      <NodeList dataSource={toDisplayNodes}
                nodeType={nodeType}
                onAddNoteBtnClick={this.handleAddNoteBtnClick}
                onRadioButtonChange={this.handleNodeTypeChange}
                onDeleteBtnClick={this.handleDeleteBtnClick} />
    );
  }
}
