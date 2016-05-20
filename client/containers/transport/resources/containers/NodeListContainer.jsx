import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import NodeList from '../components/NodeList.jsx';
import connectFetch from 'reusable/decorators/connect-fetch';
import { loadNodeList, setNodeType } from '../../../../../universal/redux/reducers/transportResources';
import { addUniqueKeys } from '../utils/dataMapping';

function fetchData({dispatch, state}) {
  return dispatch(loadNodeList(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  nodes: state.transportResources.nodes,
  selectedMenuItemKey: state.transportResources.selectedMenuItemKey,
  nodeType: state.transportResources.nodeType
}), { setNodeType })
export default class NodeListContainer extends Component {
  componentDidMount() {
    this.props.setNodeType(0);
  }
  static propTeyps = {
    nodes: PropTypes.array.isRequired,                // 节点数组,包括发货地、收获地和中转地
    selectedMenuItemKey: PropTypes.string.isRequired, // 当前选中的menuItem key
    nodeType: PropTypes.number.isRequired,            // 当前选中的节点类型
    setNodeType: PropTypes.func.isRequired,           // 改变节点类型的action creator
  }
  handleDeleteBtnClick = () => {
    console.log('delete clicked');
  }
  handleNodeTypeChange = (currentNodeType) => {
    this.props.setNodeType(currentNodeType);
    console.log('node change');
  }
  render() {
    const { nodes, selectedMenuItemKey, nodeType } = this.props;
    const toDisplayNodes = nodes.filter(node => node.type === nodeType);
    const dataSource = addUniqueKeys(toDisplayNodes);
    return (
      <NodeList dataSource={dataSource}
                visible={selectedMenuItemKey === '2'}
                nodeType={nodeType}
                onRadioButtonChange={this.handleNodeTypeChange}
                onDeleteBtnClick={this.handleDeleteBtnClick} />
    );
  }
}
