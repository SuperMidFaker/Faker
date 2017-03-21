/* eslint no-console: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Card, Menu, Dropdown, Icon, Form, Layout } from 'antd';
import { loadFlowGraph, loadFlowGraphItem, saveFlowGraph, setNodeActions } from 'common/reducers/scofFlow';
import { uuidWithoutDash } from 'client/common/uuid';
import FlowEdgePanel from './panel/flowEdgePanel';
import BizObjCMSPanel from './panel/bizObjCMSPanel';
import BizObjTMSPanel from './panel/bizObjTMSPanel';
import BizObjCWMPanel from './panel/bizObjCWMPanel';
import { formatMsg } from './message.i18n';

const { Header, Content, Sider } = Layout;
const MenuItem = Menu.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    flowGraph: state.scofFlow.flowGraph,
    submitting: state.scofFlow.submitting,
  }),
  { loadFlowGraph, loadFlowGraphItem, saveFlowGraph, setNodeActions }
)
@Form.create()
export default class FlowDesigner extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    submitting: PropTypes.bool,
    listCollapsed: PropTypes.bool.isRequired,
    currentFlow: PropTypes.shape({ id: PropTypes.number.isRequired }).isRequired,
  }
  constructor(...args) {
    super(...args);
    this.menu = (
      <Menu onClick={this.handleMenuClick}>
        <MenuItem key="nodeimport">{this.msg('flowNodeImport')}</MenuItem>
        <MenuItem key="nodeexport">{this.msg('flowNodeExport')}</MenuItem>
        <MenuItem key="nodetms">{this.msg('flowNodeTMS')}</MenuItem>
        <MenuItem key="nodecwm">{this.msg('flowNodeCWM')}</MenuItem>
        <MenuItem key="nodeterminal">{this.msg('flowNodeTerminal')}</MenuItem>
      </Menu>);
    this.state = {
      rightSidercollapsed: true,
      activeItem: null,
    };
    this.beginAdd = false;
    this.dragging = false;
  }
  componentWillMount() {
    this.props.loadFlowGraph(this.props.currentFlow.id);
  }
  componentDidMount() {
    this.graph = new window.G6.Graph({
      id: 'flowchart',      // 容器ID
      width: window.innerWidth - 370,    // 画布宽
      height: 240,   // 画布高
      grid: {
        forceAlign: true, // 是否支持网格对齐
        cell: 10,          // 网格大小
      },
    });
    const nodeColorMap = {
      import: 'red',
      export: 'green',
      tms: 'blue',
      cwm: 'purple',
      terminal: 'black',
    };
    this.graph.node().label('name');
    this.graph.node().size('kind', kind => kind === 'terminal' ? 20 : [100, 50]);
    this.graph.node().color('kind', kind => nodeColorMap[kind]);
    this.graph.node().shape('kind', kind => kind === 'terminal' ? 'circle' : 'rect');
    this.graph.edge().shape('', () => 'smoothArrow');
    const data = {
      nodes: this.props.flowGraph.nodes.map(node => ({ ...node, actions: [] })),
      edges: this.props.flowGraph.edges.map(edge => ({ ...edge, addedConds: [], delConds: [], updConds: [] })),
    };
    this.graph.source(data.nodes, data.edges);
    this.graph.render();
    this.graph.on('dragstart', (ev) => {
      console.log('dragstart', ev);
      this.dragItem = ev.item;
      // 去掉加边移动情况
      if (!this.beginAdd) {
        this.dragging = true;
      }
    });
    this.graph.on('dragend', (ev) => {
      console.log('dragend', ev);
    });
    this.graph.on('mouseup', (ev) => {
      console.log('mouseup', ev);
      if (this.beginAdd) {
        this.beginAdd = false;
        return;
      }
      if (this.dragging) {
        this.dragging = false;
        if (this.state.activeItem) {
          if (!this.dragItem || this.state.activeItem.get('id') !== this.dragItem.get('id')) {
            setTimeout(() => {
              this.graph.changeMode('select');
              this.graph.setItemActived(this.state.activeItem, true);
              if (this.dragItem) {
                this.graph.setItemActived(this.dragItem, false);
              }
              this.graph.refresh();
            }, 10);
          }
        }
        return;
      }
      const item = ev.item;
      if (this.state.activeItem) {
        if (item && this.state.activeItem.get('id') === item.get('id')) {
          return;
        }
        this.handleActiveValidated(item);
      } else {
        this.handleNewItemLoad(item);
      }
    });
    this.graph.on('afterAdd', (ev) => {
      console.log('afteradd', ev);
      const item = ev.item;
      this.graph.update(item, { loaded: true });
      if (item.get('type') === 'edge') {
        const source = item.get('source');
        const target = item.get('target');
        this.graph.update(source, { out_degree: source.get('model').out_degree + 1 });
        this.graph.update(target, { in_degree: target.get('model').in_degree + 1 });
      } else if (item.get('type') === 'node') {
        this.props.setNodeActions([]);
      }
      this.setState({ activeItem: item });
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.currentFlow.id !== this.props.currentFlow.id) {
      this.setState({ activeItem: null });
      this.props.loadFlowGraph(nextProps.currentFlow.id);
    }
    if (nextProps.flowGraph !== this.props.flowGraph) {
      const data = {
        nodes: nextProps.flowGraph.nodes.map(node => ({ ...node, actions: [] })),
        edges: nextProps.flowGraph.edges.map(edge => ({ ...edge, addedConds: [], delConds: [], updConds: [] })),
      };
      this.graph.changeData(data.nodes, data.edges);
    }
  }
  msg = formatMsg(this.props.intl)
  addNode = (key) => {
    this.graph.changeMode('add');
    const id = uuidWithoutDash();
    let kind;
    switch (key) {
      case 'nodeimport':
        kind = 'import';
        break;
      case 'nodeexport':
        kind = 'export';
        break;
      case 'nodetms':
        kind = 'tms';
        break;
      case 'nodecwm':
        kind = 'cwm';
        break;
      case 'nodeterminal':
        kind = 'terminal';
        break;
      default:
        break;
    }
    if (kind) {
      this.graph.beginAdd('node', {
        id, kind, actions: [], in_degree: 0, out_degree: 0,
      });
      this.graph.refresh();
    }
  }
  addEdge = () => {
    this.graph.changeMode('add');
    const id = uuidWithoutDash();
    this.graph.beginAdd('edge', {
      id, conditions: [], addedConds: [], delConds: [], updConds: [],
    });
    this.graph.refresh();
  }
  handleMenuClick = (ev) => {
    this.beginAdd = true;
    const activeItem = this.state.activeItem;
    if (activeItem) {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          this.graph.update(activeItem, values);
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
    const activeItem = this.state.activeItem;
    if (activeItem) {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          this.graph.update(activeItem, values);
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
    this.setState({ activeItem: null });
  }
  msg = formatMsg(this.props.intl)

  toggleRightSider = () => {
    this.setState({
      rightSidercollapsed: !this.state.rightSidercollapsed,
    });
  }
  handleActiveValidated = (item) => {
    const activeItem = this.state.activeItem;
    if (activeItem) {
      this.props.form.validateFields((err, values) => {
        if (err) {
          this.graph.changeMode('select');
          this.graph.setItemActived(activeItem, true);
          if (item) {
            this.graph.setItemActived(item, false);
          }
          this.graph.refresh();
        } else {
          this.graph.update(activeItem, values);
          this.props.form.resetFields();
          this.handleNewItemLoad(item);
        }
      });
    } else {
      this.handleNewItemLoad(item);
    }
  }
  handleNewItemLoad = (item) => {
    if (item) {
      const model = item.get('model');
      if (!model.loaded) {
        if (model.kind === 'terminal') {
          this.graph.update(item, { loaded: true });
          this.setState({ activeItem: item });
        } else {
          this.props.loadFlowGraphItem({ id: model.id, kind: model.kind, type: item.get('type') }).then((result) => {
            if (!result.error) {
              if (item.get('type') === 'node') {
                const node = result.data;
                this.graph.update(item, { ...node, loaded: true });
                this.props.setNodeActions(node.actions);
              } else if (item.get('type') === 'edge') {
                this.graph.update(item, { conditions: result.data, loaded: true });
              }
              this.setState({ activeItem: item });
            }
          });
        }
      } else {
        if (item.get('type') === 'node') {
          this.props.setNodeActions(model.actions);
        }
        this.setState({ activeItem: item });
      }
    } else {
      this.setState({ activeItem: item });
    }
  }
  handleCondAdd = (cond, afterConds) => {
    const added = this.state.activeItem.get('model').addedConds;
    // 多次更改产生add
    let i = 0;
    for (; i < added.length; i++) {
      if (added[i].key === cond.key) {
        added[i] = cond;
        break;
      }
    }
    if (i === added.length) {
      added.push(cond);
    }
    this.graph.update(this.state.activeItem, { addedConds: added, conditions: afterConds });
  }
  handleCondUpdate = (cond, afterConds) => {
    const updConds = this.state.activeItem.get('model').updConds;
    let i = 0;
    for (; i < updConds.length; i++) {
      if (updConds[i].key === cond.key) {
        updConds[i] = cond;
        break;
      }
    }
    if (i === updConds.length) {
      updConds.push(cond);
    }
    this.graph.update(this.state.activeItem, { updConds, conditions: afterConds });
  }
  handleCondDel = (cond, afterConds) => {
    const added = this.state.activeItem.get('model').addedConds;
    let found = false;
    for (let i = 0; i < added.length; i++) {
      if (added[i].key === cond.key) {
        found = true;
        added.splice(i, 1);
        this.graph.update(this.state.activeItem, { addedConds: added, conditions: afterConds });
        break;
      }
    }
    if (!found) {
      const delConds = this.state.activeItem.get('model').delConds;
      delConds.push(cond.key);
      this.graph.update(this.state.activeItem, { delConds, conditions: afterConds });
    }
  }
  handleNodeActionsChange = (actions) => {
    this.graph.update(this.state.activeItem, { actions });
    this.props.setNodeActions(actions);
  }
  handleSaveBtnClick = () => {
    const activeItem = this.state.activeItem;
    if (activeItem) {
      const values = this.props.form.getFieldsValue();
      this.graph.update(activeItem, values);
    }
    const graphItems = this.graph.get('items');
    const nodes = graphItems.filter(item => item.get('type') === 'node').map(item => item.get('model'));
    const edges = graphItems.filter(item => item.get('type') === 'edge').map(item => item.get('model'));
    console.log(nodes, edges);
    // todo graph node edge disconnected
    this.props.saveFlowGraph(this.props.currentFlow.id, nodes, edges).then((result) => {
      if (!result.error) {
        this.props.loadFlowGraph(this.props.currentFlow.id);
        this.setState({ activeItem: null });
      }
    });
  }
  render() {
    const { form, submitting, listCollapsed, currentFlow } = this.props;
    const { activeItem } = this.state;
    return (
      <Layout>
        <Layout>
          <Header className="top-bar">
            {listCollapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('flowName')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {currentFlow.name}
              </Breadcrumb.Item>
            </Breadcrumb>}
            <div className="top-bar-tools">
              <Button size="large" type="primary" icon="save" loading={submitting} onClick={this.handleSaveBtnClick}>
                {this.msg('saveFlow')}
              </Button>
              <Button size="large"
                className={this.state.rightSidercollapsed ? '' : 'btn-toggle-on'}
                icon={this.state.rightSidercollapsed ? 'eye-o' : 'eye'}
                onClick={this.toggleRightSider}
              />
            </div>
          </Header>
          <Content className="main-content layout-min-width layout-min-width-large">
            <Card title={this.msg('flowRelationGraph')} bodyStyle={{ padding: 0, height: 240 }}
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
            {activeItem &&
            <Form layout="vertical">
              {activeItem.get('type') === 'node' && (activeItem.get('model').kind === 'import' || activeItem.get('model').kind === 'export') &&
              <BizObjCMSPanel form={form} model={activeItem.get('model')} onNodeActionsChange={this.handleNodeActionsChange} />
              }
              {activeItem.get('type') === 'node' && (activeItem.get('model').kind === 'tms') &&
              <BizObjTMSPanel form={form} model={activeItem.get('model')} onNodeActionsChange={this.handleNodeActionsChange} />
              }
              {activeItem.get('type') === 'node' && (activeItem.get('model').kind === 'cwm') &&
              <BizObjCWMPanel form={form} model={activeItem.get('model')} onNodeActionsChange={this.handleNodeActionsChange} />
              }
              {activeItem.get('type') === 'edge' &&
                <FlowEdgePanel model={activeItem.get('model')} source={activeItem.get('source').get('model')}
                  target={activeItem.get('target').get('model')} onAdd={this.handleCondAdd} onUpdate={this.handleCondUpdate}
                  onDel={this.handleCondDel}
                />
              }
            </Form>
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
