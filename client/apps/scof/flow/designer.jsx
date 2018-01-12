/* eslint no-console: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Alert, Breadcrumb, Button, Card, Collapse, Popconfirm, Layout, Select, Table, Spin, Radio, Tooltip, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { toggleFlowList, loadVendorTenants, openSubFlowAuthModal, delFlow, loadFlowGraph, loadFlowGraphItem, saveFlowGraph, setNodeActions, loadScvTrackings, loadTmsBizParams } from 'common/reducers/scofFlow';
import { loadFormRequires } from 'common/reducers/crmOrders';
import { loadPartners } from 'common/reducers/partner';
import { uuidWithoutDash } from 'client/common/uuid';
import ButtonToggle from 'client/components/ButtonToggle';
import { Logixon } from 'client/components/FontIcon';
import EditableCell from 'client/components/EditableCell';
import PageHeader from 'client/components/PageHeader';
import { PARTNER_ROLES } from 'common/constants';
import FlowProviderModal from './modal/flowProviderModal';
import AddTriggerModal from './panel/compose/addTriggerModal';
import FlowEdgePanel from './panel/flowEdgePanel';
import BizObjCMSPanel from './panel/bizObjCMSPanel';
import BizObjTMSPanel from './panel/bizObjTMSPanel';
import BizObjCWMRecPanel from './panel/bizObjCWMRecPanel';
import BizObjCWMShipPanel from './panel/bizObjCWMShipPanel';
import { formatMsg } from './message.i18n';

const { Content, Sider } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Panel } = Collapse;
const { Option } = Select;

const NodeKindPanelMap = {
  import: BizObjCMSPanel,
  export: BizObjCMSPanel,
  tms: BizObjTMSPanel,
  cwmrec: BizObjCWMRecPanel,
  cwmship: BizObjCWMShipPanel,
  terminal: null,
};

function fetchData({ state, dispatch }) {
  const promises = [
    dispatch(loadFormRequires({ tenantId: state.account.tenantId })),
    dispatch(loadTmsBizParams(state.account.tenantId)),
  ];
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    trackingFields: state.scofFlow.trackingFields,
    flowGraph: state.scofFlow.flowGraph,
    submitting: state.scofFlow.submitting,
    graphLoading: state.scofFlow.graphLoading,
    listCollapsed: state.scofFlow.listCollapsed,
    tenantId: state.account.tenantId,
  }),
  {
    toggleFlowList,
    loadVendorTenants,
    loadPartners,
    openSubFlowAuthModal,
    delFlow,
    loadFlowGraph,
    loadFlowGraphItem,
    saveFlowGraph,
    setNodeActions,
    loadScvTrackings,
  }
)
export default class FlowDesigner extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    submitting: PropTypes.bool,
    graphLoading: PropTypes.bool.isRequired,
    reloadOnDel: PropTypes.func.isRequired,
    trackingFields: PropTypes.arrayOf(PropTypes.shape({
      field: PropTypes.string,
      title: PropTypes.string,
      module: PropTypes.oneOf(['cms', 'tms', 'cwmrec', 'cwmship']),
    })),
    currentFlow: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      partner_id: PropTypes.number,
      customer_tenant_id: PropTypes.number,
      tracking_id: PropTypes.number,
    }).isRequired,
  }
  constructor(...args) {
    super(...args);
    this.state = {
      rightSidercollapsed: true,
      activeItem: null,
      trackDataSource: this.props.trackingFields.map(tf => ({
        title: tf.title, field: tf.field, module: tf.module, node: null,
      })),
      trackings: [],
      trackingId: null,
    };
    this.trackingFieldTypeMapNodeKinds = {
      cms: ['import', 'export'],
      tms: ['tms'],
      cwmrec: ['cwmrec'],
      cwmship: ['cwmship'],
    };
    this.beginAdd = false;
    this.dragging = false;
    this.formhoc = null;
    this.trackingColumns = [{
      title: '追踪点',
      width: 50,
      dataIndex: 'title',
    }, {
      title: '来源节点',
      width: 130,
      dataIndex: 'node',
      render: (node, row) => {
        if (this.graph) {
          const nodekinds = this.trackingFieldTypeMapNodeKinds[row.module];
          const nodes = this.graph.get('items').filter(item => item.get('type') === 'node' && nodekinds.indexOf(item.get('model').kind) !== -1)
            .map(item => ({
              key: item.get('model').id,
              text: item.get('model').name,
            }));
          return (
            <EditableCell
              type="select"
              options={nodes}
              value={node}
              placeholder="选择节点"
              onSave={nodeId => this.handleTrackNodeChange(nodeId, row.field)}
            />);
        }
        return null;
      },
    }];
  }
  componentWillMount() {
    const { currentFlow } = this.props;
    this.props.loadFlowGraph(currentFlow.id, currentFlow.main_flow_id);
    if (currentFlow.customer_tenant_id && currentFlow.customer_tenant_id !== -1) {
      this.props.loadScvTrackings(currentFlow.customer_tenant_id).then((result) => {
        if (!result.error) {
          this.setState({ trackings: result.data });
        }
      });
    }
  }
  componentDidMount() {
    if (!this.props.main_flow_id) {
      this.props.loadVendorTenants();
      this.props.loadPartners({ role: PARTNER_ROLES.CUS });
    }
    this.graph = new window.G6.Graph({
      id: 'flowchart', // 容器ID
      width: window.innerWidth - 100, // 画布宽
      height: 180, // 画布高
      grid: {
        forceAlign: true, // 是否支持网格对齐
        cell: 10, // 网格大小
      },
    });
    const nodeColorMap = {
      import: 'red',
      export: 'green',
      tms: 'blue',
      cwmrec: 'purple',
      cwmship: 'yellow',
      terminal: 'black',
    };
    this.graph.node().label('name', name => name);
    this.graph.node().size('kind', kind => (kind === 'terminal' ? 20 : [100, 50]));
    this.graph.node().color('kind', kind => nodeColorMap[kind]);
    this.graph.node().shape('kind', kind => (kind === 'terminal' ? 'circle' : 'rect'));
    this.graph.edge().shape('', () => 'smoothArrow');
    const data = {
      nodes: this.props.flowGraph.nodes.map(node => ({ ...node, actions: [] })),
      edges: this.props.flowGraph.edges.map(edge => ({
        ...edge, addedConds: [], delConds: [], updConds: [],
      })),
    };
    this.graph.source(data.nodes, data.edges);
    this.graph.render();
    this.graph.on('mouseup', (ev) => {
      console.log('mouseup', ev);
      if (this.beginAdd) {
        this.beginAdd = false;
        return;
      }
      const { item } = ev;
      const { tenantId } = this.props;
      if (item && item.get('type') === 'node' && item.get('model').tenant_id !== tenantId
        && item.get('model').provider_tenant_id !== tenantId) {
        this.setState({ activeItem: null });
        return;
      }
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
      const { item } = ev;
      this.graph.update(item, { loaded: true });
      if (item.get('type') === 'edge') {
        /*
        const source = item.get('source');
        const target = item.get('target');
        this.graph.update(source, { out_degree: source.get('model').out_degree + 1 });
        this.graph.update(target, { in_degree: target.get('model').in_degree + 1 }); */
      } else if (item.get('type') === 'node') {
        this.props.setNodeActions([]);
        // 类型节点只有一个时候,该类型追踪点对应该节点
        const ftkeys = Object.keys(this.trackingFieldTypeMapNodeKinds);
        let fieldType;
        let nodeKinds = [];
        for (let i = 0; i < ftkeys.length; i++) {
          const ftkey = ftkeys[i];
          if (this.trackingFieldTypeMapNodeKinds[ftkey].indexOf(item.get('model').kind) !== -1) {
            fieldType = ftkey;
            nodeKinds = this.trackingFieldTypeMapNodeKinds[ftkey];
            break;
          }
        }
        const nodes = this.graph.get('items').filter(gitem => gitem.get('type') === 'node' && nodeKinds.indexOf(gitem.get('model').kind) !== -1);
        if (nodes.length === 1) {
          const nodeId = nodes[0].get('model').id;
          const dataSource = this.state.trackDataSource.map((ds) => {
            if (ds.module === fieldType) {
              return { ...ds, node: nodeId };
            }
            return ds;
          });
          this.setState({ trackDataSource: dataSource });
        }
      }
      this.setState({ activeItem: item });
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.currentFlow.id !== this.props.currentFlow.id) {
      this.setState({
        activeItem: null,
        trackingId: nextProps.currentFlow.tracking_id,
        trackDataSource: this.props.trackingFields.map(tf => ({
          title: tf.title, field: tf.field, module: tf.module, node: null,
        })),
      });
      this.props.loadFlowGraph(nextProps.currentFlow.id, nextProps.currentFlow.main_flow_id);
    }
    if (nextProps.currentFlow.customer_tenant_id === -1) {
      this.setState({ trackings: [] });
    } else if (nextProps.currentFlow.customer_tenant_id
      !== this.props.currentFlow.customer_tenant_id) {
      this.props.loadScvTrackings(nextProps.currentFlow.customer_tenant_id).then((result) => {
        if (!result.error) {
          this.setState({ trackings: result.data });
        } else {
          this.setState({ trackings: [] });
        }
      });
    }
    if (nextProps.flowGraph !== this.props.flowGraph) {
      const data = {
        nodes: nextProps.flowGraph.nodes.map(node => ({ ...node, actions: [] })),
        edges: nextProps.flowGraph.edges.map(edge => ({
          ...edge, addedConds: [], delConds: [], updConds: [],
        })),
      };
      this.graph.changeData(data.nodes, data.edges);
      const dataSource = [...this.state.trackDataSource];
      for (let i = 0; i < dataSource.length; i++) {
        const ds = dataSource[i];
        if (nextProps.flowGraph.tracking[ds.field]) {
          ds.node = nextProps.flowGraph.tracking[ds.field];
        }
      }
      this.setState({ trackDataSource: dataSource });
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
      case 'nodecwmrec':
        kind = 'cwmrec';
        break;
      case 'nodecwmship':
        kind = 'cwmship';
        break;
      case 'nodeterminal':
        kind = 'terminal';
        break;
      default:
        break;
    }
    if (kind) {
      const { currentFlow, tenantId } = this.props;
      this.graph.beginAdd('node', {
        id,
        kind,
        actions: [],
        in_degree: 0,
        out_degree: 0,
        name: kind !== 'terminal' ? `节点${this.graph.get('items').filter(item => item.get('type') === 'node').length + 1}` : undefined,
        demander_tenant_id: currentFlow.customer_tenant_id || tenantId,
        demander_partner_id: currentFlow.customer_partner_id,
        provider_tenant_id: tenantId,
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
  handleTrackNodeChange = (nodeId, field) => {
    const dataSource = [...this.state.trackDataSource];
    for (let i = 0; i < dataSource.length; i++) {
      if (dataSource[i].field === field) {
        dataSource[i].node = nodeId;
        break;
      }
    }
    this.setState({ trackDataSource: dataSource });
  }
  handleAddToolbarNode = (ev) => {
    this.beginAdd = true;
    const { activeItem } = this.state;
    if (activeItem && this.formhoc) {
      this.formhoc.validateFields((err, values) => {
        if (!err) {
          this.graph.update(activeItem, values);
          this.addNode(ev.target.value);
        } else {
          this.beginAdd = false;
        }
      });
    } else {
      this.addNode(ev.target.value);
    }
  }
  handleAddEdge = () => {
    this.beginAdd = true;
    const { activeItem } = this.state;
    if (activeItem && this.formhoc) {
      this.formhoc.validateFields((err, values) => {
        if (!err) {
          this.graph.update(activeItem, values);
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
    /* const item = this.state.activeItem;
    if (item && item.get('type') === 'edge') {
      const source = item.get('source');
      const target = item.get('target');
      this.graph.update(source, { out_degree: source.get('model').out_degree - 1 });
      this.graph.update(target, { in_degree: target.get('model').in_degree - 1 });
    } */
    this.graph.del();
    this.graph.refresh();
    this.setState({ activeItem: null });
  }
  msg = formatMsg(this.props.intl)

  toggle = () => {
    this.props.toggleFlowList();
  }
  toggleRightSider = () => {
    this.setState({
      rightSidercollapsed: !this.state.rightSidercollapsed,
    });
  }
  handleActiveValidated = (item) => {
    const { activeItem } = this.state;
    if (activeItem && this.formhoc) {
      const values = this.formhoc.getFieldsValue();
      this.graph.update(activeItem, values);
    }
    this.handleNewItemLoad(item);
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
    this.graph.refresh();
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
    const { updConds } = this.state.activeItem.get('model');
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
      const { delConds } = this.state.activeItem.get('model');
      delConds.push(cond.key);
      this.graph.update(this.state.activeItem, { delConds, conditions: afterConds });
    }
  }
  handleTriggerModalChange = (nodeBizObject, triggerName, newActions) => {
    const nodeActions = this.state.activeItem.get('model').actions;
    const actions = nodeActions.filter(na => !(nodeBizObject ?
      (na.node_biz_object === nodeBizObject && na.trigger_name === triggerName) :
      (na.trigger_name === triggerName))).concat(newActions.map(na => ({
      ...na, node_biz_object: nodeBizObject, trigger_name: triggerName,
    })));
    this.graph.update(this.state.activeItem, { actions });
    this.props.setNodeActions(actions);
    // connect nodeActions rerender FlowTriggerTable, model passed no effect
  }
  handleTrackingChange = (trackingId) => {
    this.setState({ trackingId });
  }
  handleDeleteFlow = () => {
    this.props.delFlow(this.props.currentFlow.id).then((result) => {
      if (!result.error) {
        this.props.reloadOnDel();
      }
    });
  }
  handlePanelForm = (form) => { this.formhoc = form; }
  handleSubFlowAuth = () => {
    this.props.openSubFlowAuthModal(this.props.currentFlow);
  }
  handleSave = () => {
    const { activeItem } = this.state;
    if (activeItem && this.formhoc) {
      const values = this.formhoc.getFieldsValue();
      this.graph.update(activeItem, values);
    }
    const trackingId = this.state.trackingId !== this.props.currentFlow.tracking_id ?
      this.state.trackingId : null;
    const graphItems = this.graph.get('items');
    const nodeMap = {};
    graphItems.filter(item => item.get('type') === 'node').forEach((item) => {
      const model = item.get('model');
      model.in_degree = 0;
      model.out_degree = 0;
      nodeMap[model.id] = model;
    });
    const edges = graphItems.filter(item => item.get('type') === 'edge'
      && item.get('model').target !== item.get('model').source).map(item => item.get('model'));
    edges.forEach((edge) => { // edge move cannot edit in/out degree on the fly
      if (nodeMap[edge.target]) {
        nodeMap[edge.target].in_degree += 1;
      }
      if (nodeMap[edge.source]) {
        nodeMap[edge.source].out_degree += 1;
      }
    });
    const nodes = Object.keys(nodeMap).map(nodeid => nodeMap[nodeid]);
    console.log(nodes, edges);
    // todo graph node edge disconnected
    this.props.saveFlowGraph(
      this.props.currentFlow.id, nodes, edges, trackingId,
      this.state.trackDataSource.map(tds => ({
        field: tds.field,
        node: tds.node,
      }))
    ).then((result) => {
      if (!result.error) {
        const { currentFlow } = this.props;
        this.props.loadFlowGraph(currentFlow.id, currentFlow.main_flow_id);
        this.setState({ activeItem: null });
        message.success('保存成功');
      } else {
        message.error('保存失败', 5);
      }
    });
  }
  renderGraphToolbar() {
    return (<RadioGroup onChange={this.handleAddToolbarNode}>
      <RadioButton value="nodeimport"><Tooltip title={`添加${this.msg('flowNodeImport')}节点`}><span><Logixon type="import" /></span></Tooltip></RadioButton>
      <RadioButton value="nodeexport"><Tooltip title={`添加${this.msg('flowNodeExport')}节点`}><span><Logixon type="export" /></span></Tooltip></RadioButton>
      <RadioButton value="nodetms"><Tooltip title={`添加${this.msg('flowNodeTMS')}节点`}><span><Logixon type="truck" /></span></Tooltip></RadioButton>
      <RadioButton value="nodecwmrec"><Tooltip title={`添加${this.msg('flowNodeCWMRec')}节点`}><span><Logixon type="receiving" /></span></Tooltip></RadioButton>
      <RadioButton value="nodecwmship"><Tooltip title={`添加${this.msg('flowNodeCWMShip')}节点`}><span><Logixon type="shipping" /></span></Tooltip></RadioButton>
      <RadioButton value="nodeterminal"><Tooltip title={`添加${this.msg('flowNodeTerminal')}节点`}><span><Logixon type="end" /></span></Tooltip></RadioButton>
    </RadioGroup>
    );
  }
  render() {
    const { submitting, currentFlow } = this.props;
    const { activeItem } = this.state;
    const NodePanel = activeItem && NodeKindPanelMap[activeItem.get('model').kind];
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {currentFlow.name}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            {!currentFlow.main_flow_id &&
            <Tooltip placement="bottom" title="流程授权">
              <Button icon="key" onClick={this.handleSubFlowAuth} />
            </Tooltip>}
            <Button type="primary" icon="save" loading={submitting} onClick={this.handleSave}>
              {this.msg('saveFlow')}
            </Button>
            <ButtonToggle
              iconOn="setting"
              iconOff="setting"
              onClick={this.toggleRightSider}
            />
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Content style={{ padding: 8 }} >
            <Spin spinning={this.props.graphLoading}>
              <Card
                title={this.msg('flowRelationGraph')}
                bodyStyle={{ padding: 0, height: 180 }}
                style={{ marginBottom: 8 }}
                extra={<div className="toolbar-right">
                  {this.renderGraphToolbar()}
                  <Button icon="swap-right" onClick={this.handleAddEdge}>
                    {this.msg('addFlowEdge')}
                  </Button>
                  <Button icon="delete" onClick={this.handleRemoveItem} />
                </div>}
              >
                <div id="flowchart" />
              </Card>
              {activeItem &&
                <QueueAnim animConfig={[
                  { opacity: [1, 0], translateY: [0, 50] },
                  { opacity: [1, 0], translateY: [0, -50] },
                ]}
                >
                  {NodePanel && activeItem.get('type') === 'node' &&
                  <NodePanel
                    onFormInit={this.handlePanelForm}
                    node={activeItem}
                    graph={this.graph}
                    key={activeItem.get('model').kind}
                  />
                }
                  {activeItem.get('type') === 'edge' &&
                  <FlowEdgePanel
                    model={activeItem.get('model')}
                    source={activeItem.get('source').get('model')}
                    target={activeItem.get('target').get('model')}
                    onAdd={this.handleCondAdd}
                    onUpdate={this.handleCondUpdate}
                    onDel={this.handleCondDel}
                    key="edge"
                  />
                }
                </QueueAnim>
              }
              <AddTriggerModal
                onModalOK={this.handleTriggerModalChange}
                kind={activeItem && activeItem.get('model').kind}
                model={activeItem && activeItem.get('model')}
              />
              <FlowProviderModal />
            </Spin>
          </Content>
          <Sider
            trigger={null}
            defaultCollapsed
            collapsible
            collapsed={this.state.rightSidercollapsed}
            width={380}
            collapsedWidth={0}
            className="right-sider"
          >
            <div className="right-sider-panel">
              <Collapse accordion defaultActiveKey="tracking">
                <Panel header="追踪节点" key="tracking">
                  <Select value={this.state.trackingId} style={{ width: '100%' }} onChange={this.handleTrackingChange}>
                    {this.state.trackings.map(data => (
                      <Option key={data.id} value={data.id}>{data.name}</Option>))}
                  </Select>
                  <Table
                    size="middle"
                    columns={this.trackingColumns}
                    bordered={false}
                    dataSource={this.state.trackDataSource}
                    rowKey="field"
                    scroll={{ y: 400 }}
                  />
                </Panel>
                <Panel header="更多" key="more">
                  <Alert message="警告" description="删除流程将无法恢复，请谨慎操作" type="warning" showIcon />
                  <Popconfirm title="是否确认删除?" onConfirm={this.handleDeleteFlow}>
                    <Button type="danger" icon="delete">删除流程</Button>
                  </Popconfirm>
                </Panel>
              </Collapse>
            </div>
          </Sider>
        </Layout>

      </Layout>
    );
  }
}
