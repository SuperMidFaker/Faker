import React, { Component, PropTypes } from 'react';
import { Form } from 'ant-ui';
import { connect } from 'react-redux';
import NodeForm from '../components/NodeForm';
import { addNode, editNode } from '../../../../../universal/redux/reducers/transportResources';
import connectNav from 'reusable/decorators/connect-nav';
import { setNavTitle } from 'universal/redux/reducers/navbar';

@connectNav((props, dispatch, router) => {
  dispatch(setNavTitle({
    depth: 3,
    text: '节点信息',
    muduleName: 'transport',
    withModuleLayout: false,
    goBackFn: () => router.goBack()
  }));
})
@connect(state => ({
  nodes: state.transportResources.nodes,
  nodeType: state.transportResources.nodeType,
  tenantId: state.account.tenantId
}), { addNode, editNode })
@Form.formify()
export default class NodeFormConainer extends Component {
  static propTypes = {
    nodes: PropTypes.array.isRequired,    // 节点数组
    nodeType: PropTypes.number.isRequired, // 当前正在操作的节点类型,根据这个值向后台插入具体的node type
    addNode: PropTypes.func.isRequired,  // 增加node的action creator
    editNode: PropTypes.func.isRequired, // 更新node的action creator
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleAddNode = (e) => {
    e.preventDefault();
    const { form, nodeType, tenantId } = this.props;
    const nodeInfoInForm = form.getFieldsValue();
    const nodeInfo = Object.assign({}, nodeInfoInForm, { type: nodeType, tenant_id: tenantId });
    this.props.addNode(nodeInfo);
    this.context.router.goBack();
  }
  handleEditNode = (e) => {
    e.preventDefault();
    const { form, params } = this.props;
    const nodeInfoInform = form.getFieldsValue();
    const nodeId = params.node_id;
    this.props.editNode({nodeId, nodeInfo: nodeInfoInform});
    this.context.router.goBack();
  }
  render() {
    const { form, params, nodes } = this.props;
    if (params.node_id) {
      const editNodeId = parseInt(params.node_id, 10);
      const editNodeInfo = nodes.find(node => node.node_id === editNodeId);
      console.log(editNodeInfo);
      return (
        <NodeForm mode="edit"
                       form={form}
                       node={editNodeInfo}
                       onSubmitBtnClick={this.handleEditNode} />
      );
    } else {
      return (
        <NodeForm mode="add"
                  form={form}
                  onSubmitBtnClick={this.handleAddNode}/>
      );
    }
  }
}
