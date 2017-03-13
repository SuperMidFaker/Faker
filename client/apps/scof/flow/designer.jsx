/* eslint no-console: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Card, Menu, Dropdown, Icon, Form, Layout } from 'antd';
import { updateFlowElementMap, updateActiveElement } from 'common/reducers/scofFlow';
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
    elementMap: state.scofFlow.flowElementMap,
    activeElement: state.scofFlow.activeElement,
  }),
  { updateFlowElementMap, updateActiveElement }
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
      activeItem: null,
    };
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
    // todo beginAdd no mousedown select element
    this.graph.on('click', (ev) => {
      console.log('click', ev);
    });
    this.graph.on('mouseup', (ev) => {
      console.log('mouseup', ev);
      this.handleGraphItemClick(ev);
    });
    this.graph.on('mouseleave', (ev) => {
      console.log('mouseleave', ev);
    });
      /*
    this.graph.on('afterAdd', (ev) => {
      console.log('afterAdd', ev)
    }) */
  }
  msg = formatMsg(this.props.intl)
  handleMenuClick = (ev) => {
    this.props.form.validateFields((err) => {
      if (!err) {
        this.graph.changeMode('add');
        switch (ev.key) {
          case 'nodeimport':
            this.graph.beginAdd('node', {
              shape: 'rect',
              color: 'red',
              kind: 'import',
            });
            break;
          case 'nodeexport':
            this.graph.beginAdd('node', {
              shape: 'rect',
              color: 'blue',
              kind: 'export',
            });
            break;
          case 'nodetms':
            this.graph.beginAdd('node', {
              shape: 'rect',
              color: 'green',
              kind: 'tms',
            });
            break;
          case 'nodecwm':
            this.graph.beginAdd('node', {
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
    });
  }
  handleAddEdge = () => {
    this.props.form.validateFields((err) => {
      if (!err) {
        this.graph.changeMode('add');
        this.graph.beginAdd('edge', {
          shape: 'smoothArrow',
        });
        this.graph.refresh();
      }
    });
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
  handleGraphItemClick = (ev) => {
    const item = ev.item;
    console.log(this.state.activeItem);
    if (this.state.activeItem && item && this.state.activeItem.get('id') === item.get('id')) {
      this.graph.refresh();
      return;
    }
    if (this.state.activeItem) {
      this.props.form.validateFields((err, values) => {
        if (err) {
          console.log('incoming', item);
          this.graph.changeMode('select');
          this.graph.setItemActived(this.state.activeItem, true);
          if (item) {
            this.graph.setItemActived(item, false);
          }
          this.graph.refresh();
          // todo edge not disactive
        } else {
          const elementVal = { ...this.props.activeElement, ...values };
          this.props.form.resetFields();
          this.props.updateFlowElementMap(elementVal.uuid, elementVal);
          if (item) {
            const uuid = item.get('id');
            if (this.props.elementMap[uuid]) {
              if (!this.props.elementMap[uuid].loaded) {
                this.props.load();
              }
              this.props.updateActiveElement(this.props.elementMap[uuid]);
            } else {
              this.props.updateActiveElement({ uuid, kind: item.get('model').kind, loaded: true,
                type: item.get('type'), source: item.get('model').source, target: item.get('model').target,
              });
            }
          } else {
            this.props.updateActiveElement({});
          }
          this.setState({ activeItem: item });
        }
      });
    } else {
      if (item) {
        const uuid = item.get('id');
        if (this.props.elementMap[uuid]) {
          if (!this.props.elementMap[uuid].loaded) {
            this.props.load();
          }
          this.props.updateActiveElement(this.props.elementMap[uuid]);
        } else {
          this.props.updateActiveElement({ uuid, kind: item.get('model').kind, loaded: true,
            type: item.get('type'), source: item.get('model').source, target: item.get('model').target,
          });
        }
      } else {
        this.props.updateActiveElement({});
      }
      this.setState({ activeItem: item });
    }
  }
  handleSaveBtnClick = () => {
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
    const { form, submitting, listCollapsed, activeElement } = this.props;
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
            {activeElement.uuid &&
            <Form layout="vertical">
              {activeElement.type === 'node' && (activeElement.kind === 'import' || activeElement.kind === 'export') &&
              <BizObjCMSPanel form={form} />
              }
              {activeElement.type === 'edge' &&
              <FlowEdgePanel form={form} />
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
