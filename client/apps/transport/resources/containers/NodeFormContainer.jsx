import React, { Component, PropTypes } from 'react';
import { Form, Row, Col, Card } from 'antd';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import NodeForm from '../components/NodeForm';
import ContentWrapper from '../components/ContentWrapper';
import { addNode, editNode, changeRegion, loadNodeUserList, addNodeUser, editNodeUser, removeNodeUser, updateUserStatus } from 'common/reducers/transportResources';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import NodeUserList from '../components/NodeUserList';

function fetchData({ dispatch, params }) {
  return dispatch(loadNodeUserList(params.node_id || -1));
}

@connectFetch()(fetchData)
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
  nodeUsers: state.transportResources.nodeUsers,
}), { addNode, editNode, changeRegion, addNodeUser, editNodeUser, removeNodeUser, updateUserStatus })
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
    nodeUsers: PropTypes.array.isRequired,
    addNodeUser: PropTypes.func.isRequired,
    editNodeUser: PropTypes.func.isRequired,
    removeNodeUser: PropTypes.func.isRequired,
    updateUserStatus: PropTypes.func.isRequired,
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
    const [code, province, city, district, street] = value;
    const region = Object.assign({}, { region_code: code, province, city, district, street });
    this.props.changeRegion(region);
  }
  render() {
    const { form, params, nodes } = this.props;
    if (params.node_id) {
      const editNodeId = parseInt(params.node_id, 10);
      const editNodeInfo = nodes.find(node => node.node_id === editNodeId);
      const { province, city, district, street } = editNodeInfo;
      const region = [province, city, district, street];
      return (
        <ContentWrapper>
          <Row>
            <Col span={12}>
              <Card title="地点信息" style={{ margin: '0 12px 24px 24px' }}>
                <NodeForm mode="edit"
                  form={form}
                  node={editNodeInfo}
                  region={region}
                  changeRegion={this.props.changeRegion}
                  onRegionChange={this.handleRegionChange}
                  onSubmitBtnClick={this.handleEditNode}
                  style={{ width: '100%' }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <NodeUserList
                node={editNodeInfo}
                tenantId={this.props.tenantId}
                nodeUsers={this.props.nodeUsers}
                addNodeUser={this.props.addNodeUser}
                eitNodeUser={this.props.editNodeUser}
                removeNodeUser={this.props.removeNodeUser}
                updateUserStatus={this.props.updateUserStatus}
              />
            </Col>
          </Row>
        </ContentWrapper>
      );
    } else {
      return (
        <ContentWrapper>
          <NodeForm mode="add"
            form={form}
            onRegionChange={this.handleRegionChange}
            onSubmitBtnClick={this.handleAddNode}
          />
        </ContentWrapper>
      );
    }
  }
}
