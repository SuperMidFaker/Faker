import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import NodeList from '../components/NodeList';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadNodeList, setNodeType, removeNode, toggleNodeModal } from 'common/reducers/transportResources';
import { loadPartners } from 'common/reducers/shipment';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';

function fetchData({ dispatch, state }) {
  const promises = [
    dispatch(loadNodeList(state.account.tenantId)),
    dispatch(loadPartners(state.account.tenantId, [PARTNER_ROLES.CUS], [PARTNER_BUSINESSE_TYPES.transport])),
  ];
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@connect(state => ({
  tenantId: state.account.tenantId,
  loaded: state.transportResources.loaded,
  loading: state.transportResources.loading,
  nodes: state.transportResources.nodes,
  nodeType: state.transportResources.nodeType,
  partners: state.shipment.partners,
}), {
  setNodeType, removeNode, toggleNodeModal, loadNodeList,
})
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
export default class NodeListContainer extends Component {
  static propTypes = {
    loaded: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    nodes: PropTypes.array.isRequired, // 节点数组,包括发货地、收获地和中转地
    nodeType: PropTypes.number.isRequired, // 当前选中的节点类型
    setNodeType: PropTypes.func.isRequired, // 改变节点类型的action creator
    removeNode: PropTypes.func.isRequired, // 移除某个节点时的action creator
    toggleNodeModal: PropTypes.func.isRequired,
    loadNodeList: PropTypes.func.isRequired,
    partners: PropTypes.array.isRequired,
  }
  state = {
    searchText: '',
    filters: {},
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loaded && !nextProps.loading) {
      this.props.loadNodeList(nextProps.tenantId);
    }
  }
  handleDeleteBtnClick = (nodeId) => {
    this.props.removeNode(nodeId);
  }
  handleAddNoteBtnClick = () => {
    this.props.toggleNodeModal(true, 'add');
  }
  handleNodeTypeChange = (currentNodeType) => {
    this.props.setNodeType(currentNodeType);
  }
  handleSearch = (searchText) => {
    this.setState({ searchText });
  }
  handleTableChange = (pagination, filters) => {
    this.setState({ filters });
  }
  render() {
    const { nodes, nodeType } = this.props;
    const toDisplayNodes = nodes.filter(node => node.type === nodeType).filter((item) => {
      if (this.state.searchText) {
        const reg = new RegExp(this.state.searchText);
        return reg.test(item.name) || reg.test(item.province) || reg.test(item.city) || reg.test(item.district) || reg.test(item.addr) ||
        reg.test(item.contact) || reg.test(item.mobile) || reg.test(item.email);
      } else {
        return true;
      }
    }).filter((item) => {
      const flts = this.state.filters.ref_partner_name;
      if (flts) {
        if (flts.length > 0 && !flts.find(flt => flt === String(item.ref_partner_id))) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    });
    return (
      <NodeList dataSource={toDisplayNodes}
        nodeType={nodeType}
        onAddNoteBtnClick={this.handleAddNoteBtnClick}
        onRadioButtonChange={this.handleNodeTypeChange}
        onDeleteBtnClick={this.handleDeleteBtnClick}
        onSearch={this.handleSearch}
        searchText={this.state.searchText}
        partners={this.props.partners}
        handleTableChange={this.handleTableChange}
      />
    );
  }
}
