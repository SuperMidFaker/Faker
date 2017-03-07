import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Dropdown, Menu, Icon, Input, Card, Form, Row, Col, Layout, Table, Tooltip } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import { openCreateFlowModal } from 'common/reducers/scofFlow';
import CreateFlowModal from './modal/createFlowModal';
import FlowNodePanel from './panel/flowNodePanel';
import FlowEdgePanel from './panel/flowEdgePanel';
import BizObjCMSPanel from './panel/bizObjCMSPanel';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const Search = Input.Search;
const MenuItem = Menu.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { openCreateFlowModal }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
@Form.create()
export default class FlowDesigner extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    submitting: PropTypes.bool,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
    collapsed: false,
    rightSidercollapsed: true,
  }
  componentDidMount() {
    const data = {
      nodes: [
        {
          x: 440,
          y: 210,
          id: 'node1',
        },
        {
          x: 570,
          y: 170,
          id: 'node2',
        },
      ],
      edges: [
        {
          source: 'node1',
          id: 'edge1',
          target: 'node2',
        },
      ],
    };
      // 第四步：配置G6画布
    const graph = new window.G6.Graph({
      id: 'flowchart',      // 容器ID
      width: 1200,    // 画布宽
      height: 360,   // 画布高
      grid: {
        forceAlign: true, // 是否支持网格对齐
        cell: 10,          // 网格大小
      },
    });
      // 第五步：载入数据
    graph.source(data.nodes, data.edges);
      // 第六步：渲染关系图
    graph.render();
  }
  msg = key => formatMsg(this.props.intl, key);

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  toggleRightSider = () => {
    this.setState({
      rightSidercollapsed: !this.state.rightSidercollapsed,
    });
  }
  handleCreateFlow = () => {
    this.props.openCreateFlowModal();
  }
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  handleSaveBtnClick = () => {

  }
  render() {
    const { flow } = this.state;
    const { form, submitting } = this.props;
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <MenuItem key="1">{this.msg('nodeCMS')}</MenuItem>
        <MenuItem key="2">{this.msg('nodeTMS')}</MenuItem>
        <MenuItem key="3">{this.msg('nodeCWM')}</MenuItem>
      </Menu>
    );
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<div style={{ paddingLeft: 15 }}>{o}</div>),
    }];
    return (
      <Layout>
        <Sider width={280} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('flow')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="pull-right">
              <Tooltip placement="bottom" title={this.msg('createFlow')}>
                <Button type="primary" shape="circle" icon="plus" onClick={this.handleCreateFlow} />
              </Tooltip>
            </div>
          </div>
          <div className="left-sider-panel">
            <div className="toolbar">
              <Search
                placeholder={this.msg('searchPlaceholder')}
                onSearch={this.handleSearch} size="large"
              />
            </div>
            <Table size="middle" dataSource={this.props.flowList} columns={columns} showHeader={false} onRowClick={this.handleRowClick}
              pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }}
              rowClassName={record => record.id === flow.id ? 'table-row-selected' : ''}
            />
          </div>
          <CreateFlowModal />
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Button size="large"
              className={this.state.collapsed ? '' : 'btn-toggle-on'}
              icon={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            { this.state.collapsed && <Breadcrumb>
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
                icon={this.state.rightSidercollapsed ? 'code-o' : 'code'}
                onClick={this.toggleRightSider}
              />
            </div>
          </Header>
          <Content className="main-content layout-min-width layout-min-width-large">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col sm={24} md={16}>
                  <Card
                    title={this.msg('flowChart')}
                    extra={<div className="toolbar-right">
                      <Dropdown overlay={menu}>
                        <Button icon="plus-square-o" >
                          {this.msg('flowNode')} <Icon type="down" />
                        </Button>
                      </Dropdown>
                      <Button icon="swap-right" >
                        {this.msg('flowEdge')}
                      </Button>
                    </div>}
                    bodyStyle={{ padding: 0, height: 300 }}
                  >
                    <div id="flowchart" />
                  </Card>
                  <BizObjCMSPanel form={form} />
                </Col>
                <Col sm={24} md={8}>
                  <FlowNodePanel form={form} />
                  <FlowEdgePanel form={form} />
                </Col>
              </Row>
            </Form>
          </Content>
        </Layout>
        <Sider
          trigger={null}
          defaultCollapsed
          collapsible
          collapsed={this.state.rightSidercollapsed}
          width={480}
          collapsedWidth={0}
          className="right-sider"
        >
          <div className="right-sider-panel">
            <div className="panel-header">
              <h3>流程描述文件</h3>
            </div>
          </div>
        </Sider>
      </Layout>
    );
  }
}
