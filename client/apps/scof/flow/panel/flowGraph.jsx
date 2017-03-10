import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Dropdown, Menu, Icon, Card } from 'antd';
import { formatMsg } from '../message.i18n';

const MenuItem = Menu.Item;

@injectIntl
@connect()
export default class FlowGraph extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onMounted: PropTypes.func.isRequired,
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
    this.props.onMounted(this.graph);
    // todo beginAdd no element
    this.graph.on('click', (ev) => {
      if (ev.item) {
        this.props.onSelect(ev.item);
      } else {
        this.props.onSelect(null);
      }
    });
      /*
    this.graph.on('afterAdd', (ev) => {
      console.log('afterAdd', ev)
    }) */
  }
  msg = formatMsg(this.props.intl)
  handleMenuClick = (ev) => {
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
  handleAddEdge = () => {
    this.graph.beginAdd('edge', {
      shape: 'smoothArrow',
    });
    this.graph.refresh();
  }
  handleRemoveItem = () => {
    this.graph.del();
    this.graph.refresh();
  }
  render() {
    return (
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
      </Card>);
  }
}
