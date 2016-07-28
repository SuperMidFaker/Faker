import React, { Component, PropTypes } from 'react';
import { Form } from 'antd';
import { connect } from 'react-redux';
import NodeForm from '../components/NodeForm';
import { addNode, editNode, changeRegion } from 'common/reducers/transportResources';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';

@connectNav((props, dispatch, router) => {
  dispatch(setNavTitle({
    depth: 3,
    text: '地点信息',
    muduleName: 'transport',
    withModuleLayout: false,
    goBackFn: () => router.goBack(),
  }));
})
@connect(state => ({
  nodes: state.transportResources.nodes,
  nodeType: state.transportResources.nodeType,
  region: state.transportResources.region,
  tenantId: state.account.tenantId,
}), { addNode, editNode, changeRegion })
@Form.create()
export default class NodeFormConainer extends Component {
  static propTypes = {
    nodes: PropTypes.array.isRequired,        // 节点数组
    nodeType: PropTypes.number.isRequired,    // 当前正在操作的节点类型,根据这个值向后台插入具体的node type
    addNode: PropTypes.func.isRequired,       // 增加node的action creator
    editNode: PropTypes.func.isRequired,      // 更新node的action creator
    changeRegion: PropTypes.func.isRequired,  // region级联选项改变时发生的action creator
    region: PropTypes.object.isRequired,      // 代表级联选项的值
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleAddNode = (e) => {
    e.preventDefault();
    const { form, nodeType, tenantId, region } = this.props;
    const nodeInfoInForm = form.getFieldsValue();
    const nodeInfo = Object.assign({}, nodeInfoInForm, { ...region, type: nodeType, tenant_id: tenantId });
    this.props.addNode(nodeInfo).then(() => {
      this.context.router.goBack();
    });
  }
  handleEditNode = (e) => {
    e.preventDefault();
    const { form, params, region } = this.props;
    const nodeInfoInform = form.getFieldsValue();
    const nodeInfo = { ...nodeInfoInform, ...region };
    const nodeId = params.node_id;
    this.props.editNode({ nodeId, nodeInfo }).then(() => {
      this.context.router.goBack();
    });
  }
  handleRegionChange = (value) => {
    const [province, city, district] = value;
    const region = Object.assign({}, { province, city, district });
    this.props.changeRegion(region);
  }
  render() {
    const { form, params, nodes } = this.props;
    if (params.node_id) {
      const editNodeId = parseInt(params.node_id, 10);
      const editNodeInfo = nodes.find(node => node.node_id === editNodeId);
      const { province, city, district } = editNodeInfo;
      const region = [province, city, district];
      return (
        <NodeForm mode="edit"
          form={form}
          node={editNodeInfo}
          region={region}
          changeRegion={this.props.changeRegion}
          onRegionChange={this.handleRegionChange}
          onSubmitBtnClick={this.handleEditNode}
        />
      );
    } else {
      return (
        <NodeForm mode="add"
          form={form}
          onRegionChange={this.handleRegionChange}
          onSubmitBtnClick={this.handleAddNode}
        />
      );
    }
  }
}
