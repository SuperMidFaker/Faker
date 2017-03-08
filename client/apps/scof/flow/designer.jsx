import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Input, Form, Row, Col, Layout, Table, Tooltip } from 'antd';
import { openCreateFlowModal } from 'common/reducers/scofFlow';
// import CreateFlowModal from './modal/createFlowModal';
import FlowGraph from './panel/flowGraph';
import FlowNodePanel from './panel/flowNodePanel';
import FlowEdgePanel from './panel/flowEdgePanel';
import BizObjCMSPanel from './panel/bizObjCMSPanel';
import { formatMsg } from './message.i18n';

const { Header, Content, Sider } = Layout;
const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { openCreateFlowModal }
)
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
    selGraphElement: null,
  }
  msg = formatMsg(this.props.intl)

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
  handleGraphMounted = (graph) => {
    this.flowGraph = graph;
  }
  handleGraphElemClick = (item) => {
    this.setState({ selGraphElement: item });
  }
  handleSaveBtnClick = () => {
    // console.log(this.flowGraph.save())
  }
  render() {
    const { flow } = this.state;
    const { form, submitting } = this.props;
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
          {/*
          <CreateFlowModal />
          */}
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
                icon={this.state.rightSidercollapsed ? 'eye-o' : 'eye'}
                onClick={this.toggleRightSider}
              />
            </div>
          </Header>
          <Content className="main-content layout-min-width layout-min-width-large">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col sm={24} md={24}>
                  <FlowGraph onMounted={this.handleGraphMounted} onSelect={this.handleGraphElemClick} />
                </Col>
                {this.state.selGraphElement && this.state.selGraphElement.itemType === 'node' &&
                  <Col sm={24} md={8}><FlowNodePanel form={form} /></Col>
                }
                {this.state.selGraphElement && this.state.selGraphElement.itemType === 'node' &&
                  <Col sm={24} md={16}><BizObjCMSPanel form={form} /></Col>
                }
                {this.state.selGraphElement && this.state.selGraphElement.itemType === 'edge' &&
                  <Col sm={24} md={24}><FlowEdgePanel form={form} /></Col>
                }
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
              <h3>{this.msg('monitoringPoints')}</h3>
            </div>
          </div>
        </Sider>
      </Layout>
    );
  }
}
