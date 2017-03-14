/* eslint no-console: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Card, Menu, Dropdown, Icon, Form, Layout } from 'antd';
import { updateNodesMap, updateEdgesMap, addActiveNode, addActiveEdge, updateActiveElement } from 'common/reducers/scofFlow';
import { uuidWithoutDash } from 'client/common/uuid';
import FlowEdgePanel from './panel/flowEdgePanel';
import BizObjCMSPanel from './panel/bizObjCMSPanel';
import { formatMsg } from './message.i18n';

const { Header, Content, Sider } = Layout;
const MenuItem = Menu.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    currentFlow: state.scofFlow.currentFlow,
    nodesMap: state.scofFlow.nodesMap,
    edgesMap: state.scofFlow.edgesMap,
    activeNode: state.scofFlow.activeNode,
    activeEdge: state.scofFlow.activeEdge,
  }),
  { updateNodesMap, updateEdgesMap, addActiveNode, addActiveEdge, updateActiveElement }
)
@Form.create()
export default class FlowDesigner extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    submitting: PropTypes.bool,
    listCollapsed: PropTypes.bool.isRequired,
  }
  constructor(...args) {
    super(...args);
    this.menu = (
      <Menu onClick={this.handleMenuClick}>
        <MenuItem key="nodeimport">{this.msg('flowNodeImport')}</MenuItem>
        <MenuItem key="nodeexport">{this.msg('flowNodeExport')}</MenuItem>
        <MenuItem key="nodetms">{this.msg('flowNodeTms')}</MenuItem>
        <MenuItem key="nodecwm">{this.msg('flowNodeCwm')}</MenuItem>
      </Menu>);
    this.state = {
      rightSidercollapsed: true,
    };
    this.beginAdd = false;
    this.dragging = false;
    this.activeItem = null;
  }
  componentDidMount() {
    const data = {
      nodes: [
      ],
      edges: [
      ],
    };
      // 第四步：配置G6画布
    this.graph = new window.G6.Graph({
      id: 'flowchart',      // 容器ID
      width: window.innerWidth - 370,    // 画布宽
      height: 240,   // 画布高
      grid: {
        forceAlign: true, // 是否支持网格对齐
        cell: 10,          // 网格大小
      },
    });
      // 第五步：载入数据
    this.graph.source(data.nodes, data.edges);
      // 第六步：渲染关系图
    this.graph.render();
    this.graph.on('dragstart', (ev) => {
      console.log('dragstart', ev);
      this.dragItem = ev.item;
      if (!this.beginAdd) {
        this.dragging = true;
      }
    });
    this.graph.on('dragend', (ev) => {
      console.log('dragend', ev);
      if (this.activeItem) {
        if (!this.dragItem || this.dragItem.get('id') !== this.activeItem.get('id')) {
          this.graph.changeMode('select');
          this.graph.setItemActived(this.activeItem, true);
          if (this.dragItem) {
            this.graph.setItemActived(this.dragItem, false);
          }
          this.graph.refresh();
        }
      }
    });
    this.graph.on('mouseup', (ev) => {
      console.log('mouseup', ev);
      if (this.dragging) {
        this.dragging = false;
        return;
      }
      if (this.beginAdd) {
        this.beginAdd = false;
        return;
      }
      const item = ev.item;
      if (this.activeItem) {
        if (item && this.activeItem.get('id') === item.get('id')) {
          return;
        }
        this.handleActiveValidated(item);
      } else {
        this.handleNewItemLoad(item);
      }
    });
    this.graph.on('afterAdd', (ev) => {
      console.log('afteradd');
      const item = ev.item;
      if (item) {
        const type = item.get('type');
        if (type === 'node') {
          this.handleNodeAdded(item);
        } else if (type === 'edge') {
          this.handleEdgeAdded(item);
        }
        this.activeItem = item;
      }
    });
  }
  msg = formatMsg(this.props.intl)
  addNode = (key) => {
    this.graph.changeMode('add');
    const id = uuidWithoutDash();
    switch (key) {
      case 'nodeimport':
        this.graph.beginAdd('node', {
          id,
          shape: 'rect',
          color: 'red',
          kind: 'import',
        });
        break;
      case 'nodeexport':
        this.graph.beginAdd('node', {
          id,
          shape: 'rect',
          color: 'blue',
          kind: 'export',
        });
        break;
      case 'nodetms':
        this.graph.beginAdd('node', {
          id,
          shape: 'rect',
          color: 'green',
          kind: 'tms',
        });
        break;
      case 'nodecwm':
        this.graph.beginAdd('node', {
          id,
          shape: 'rect',
          color: 'gray',
          kind: 'cwm',
        });
        break;
      default:
        break;
    }
    this.graph.refresh();
  }
  addEdge = () => {
    this.graph.changeMode('add');
    const id = uuidWithoutDash();
    this.graph.beginAdd('edge', {
      id,
      shape: 'smoothArrow',
    });
    this.graph.refresh();
  }
  handleMenuClick = (ev) => {
    this.beginAdd = true;
    if (this.props.activeNode.uuid) {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const nodeVal = { ...this.props.activeNode, ...values };
          this.props.updateNodesMap(nodeVal);
          this.props.form.resetFields();
          this.addNode(ev.key);
        } else {
          this.beginAdd = false;
        }
      });
    } else {
      this.addNode(ev.key);
    }
  }
  handleAddEdge = () => {
    this.beginAdd = true;
    if (this.props.activeNode.uuid) {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const nodeVal = { ...this.props.activeNode, ...values };
          this.props.updateNodesMap(nodeVal);
          this.props.form.resetFields();
          this.addEdge();
        } else {
          this.beginAdd = false;
        }
      });
    } else {
      this.addEdge();
    }
  }
  handleRemoveItem = () => {
    this.graph.del();
    this.graph.refresh();
  }
  msg = formatMsg(this.props.intl)

  toggleRightSider = () => {
    this.setState({
      rightSidercollapsed: !this.state.rightSidercollapsed,
    });
  }
  handleNodeAdded = (item) => {
    const uuid = item.get('id');
    const model = item.get('model');
    this.props.addActiveNode({
      xpos: model.x, ypos: model.y, uuid,
      kind: model.kind, loaded: true,
    });
  }
  handleEdgeAdded = (item) => {
    this.props.addActiveEdge({
      uuid: item.get('id'), loaded: true,
      source: item.get('model').source, target: item.get('model').target,
    });
  }
  handleActiveValidated = (item) => {
    const { activeNode, activeEdge } = this.props;
    if (activeNode.uuid) {
      this.props.form.validateFields((err, values) => {
        if (err) {
          this.graph.changeMode('select');
          this.graph.setItemActived(this.activeItem, true);
          if (item) {
            this.graph.setItemActived(item, false);
          }
          this.graph.refresh();
        } else {
          const nodeVal = { ...activeNode, ...values };
          this.props.updateNodesMap(nodeVal);
          this.props.form.resetFields();
          this.handleNewItemLoad(item);
        }
      });
    } else if (activeEdge.uuid) {
      this.props.updateEdgesMap(activeEdge);
      this.handleNewItemLoad(item);
    }
  }
  handleNewItemLoad = (item) => {
    let activeNode = {};
    let activeEdge = {};
    if (item) {
      const uuid = item.get('id');
      const type = item.get('type');
      if (type === 'node') {
        if (this.props.nodesMap[uuid]) {
          if (!this.props.nodesMap[uuid].loaded) {
            this.props.load();
          } else {
            activeNode = this.props.nodesMap[uuid];
            this.props.updateActiveElement(activeNode, activeEdge);
          }
        }
      } else if (type === 'edge') {
        if (this.props.edgesMap[uuid]) {
          if (!this.props.edgesMap[uuid].loaded) {
            this.props.load();
          } else {
            activeEdge = this.props.edgesMap[uuid];
            this.props.updateActiveElement(activeNode, activeEdge);
          }
        }
      }
    } else {
      this.props.updateActiveElement(activeNode, activeEdge);
    }
    this.activeItem = item;
  }
  handleSaveBtnClick = () => {
    console.log(this.graph);
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const elementVal = { ...this.props.activeElement, ...values };
        this.props.updateFlowElementMap(elementVal.uuid, elementVal);
        // todo graph node edge disconnected
        this.props.saveFlowGraph(this.props.elementMap);
      }
    });
  }
  render() {
    const { form, submitting, listCollapsed, activeNode, activeEdge } = this.props;
    return (
      <Layout>
        <Layout>
          <Header className="top-bar">
            {listCollapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('flow')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                流程名称
              </Breadcrumb.Item>
            </Breadcrumb>}
            <div className="top-bar-tools">
              <Button size="large" type="primary" icon="save" loading={submitting} onClick={this.handleSaveBtnClick}>
                {this.msg('save')}
              </Button>
              <Button size="large"
                className={this.state.rightSidercollapsed ? '' : 'btn-toggle-on'}
                icon={this.state.rightSidercollapsed ? 'eye-o' : 'eye'}
                onClick={this.toggleRightSider}
              />
            </div>
          </Header>
          <Content className="main-content layout-min-width layout-min-width-large">
            <Card title={this.msg('flowChart')} bodyStyle={{ padding: 0, height: 240 }}
              extra={<div className="toolbar-right">
                <Dropdown overlay={this.menu}>
                  <Button icon="plus-square-o" >
                    {this.msg('addFlowNode')} <Icon type="down" />
                  </Button>
                </Dropdown>
                <Button icon="swap-right" onClick={this.handleAddEdge}>
                  {this.msg('addFlowEdge')}
                </Button>
                <Button icon="delete" onClick={this.handleRemoveItem} />
              </div>}
            >
              <div id="flowchart" />
            </Card>
            {activeNode.uuid &&
            <Form layout="vertical">
              {(activeNode.kind === 'import' || activeNode.kind === 'export') &&
              <BizObjCMSPanel form={form} />
              }
            </Form>
            }
            {activeEdge.uuid &&
            <FlowEdgePanel />
            }
          </Content>
        </Layout>
        <Sider trigger={null} defaultCollapsed collapsible collapsed={this.state.rightSidercollapsed}
          width={480} collapsedWidth={0} className="right-sider"
        >
          <div className="right-sider-panel">
            <div className="panel-header">
              <h3>{this.msg('monitoringPoints')}</h3>
            </div>
          </div>
        </Sider>
      </Layout>
    );
  }
}
