import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Input, Form, Layout, Table, Tooltip } from 'antd';
import { openCreateFlowModal, updateFlowElementMap, updateActiveElement } from 'common/reducers/scofFlow';
import connectNav from 'client/common/decorators/connect-nav';
import CreateFlowModal from './modal/createFlowModal';
import FlowGraph from './panel/flowGraph';
import FlowEdgePanel from './panel/flowEdgePanel';
import BizObjCMSPanel from './panel/bizObjCMSPanel';
import { formatMsg } from './message.i18n';

const { Header, Content, Sider } = Layout;
const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    currentFlow: state.scofFlow.currentFlow,
    elementMap: state.scofFlow.flowElementMap,
    activeElement: state.scofFlow.activeElement,
  }),
  { openCreateFlowModal, updateFlowElementMap, updateActiveElement }
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
  handleGraphElemClick = (element) => {
    console.log('selected', this.state.selGraphElement);
    let activeElementChanged = false;
    if (this.state.selGraphElement) {
      this.props.form.validateFields((err, values) => {
        if (err) {
          console.log('incoming', element);
          this.flowGraph.changeMode('select');
          if (element) {
            this.flowGraph.setItemActived(element, false);  // todo edge not active
          }
          this.flowGraph.setItemActived(this.state.selGraphElement, true);
          this.flowGraph.refresh();
        } else {
          const elementVal = { ...this.props.activeElement, ...values };
          this.props.updateFlowElementMap(elementVal.uuid, elementVal);
          activeElementChanged = true;
        }
      });
    } else {
      activeElementChanged = true;
    }
    if (activeElementChanged) {
      if (element) {
        const uuid = element.get('id');
        if (this.props.elementMap[uuid]) {
          if (!this.props.elementMap[uuid].loaded) {
            this.props.load();
          }
          this.props.updateActiveElement(this.props.elementMap[uuid]);
        } else {
          this.props.updateActiveElement({ uuid, kind: element.get('model').kind, loaded: true,
            type: element.get('type'), source: element.get('model').source, target: element.get('model').target,
          });
        }
      } else {
        this.props.updateActiveElement({});
      }
      this.props.form.resetFields();
      this.setState({ selGraphElement: element });
    }
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
          collapsible collapsed={this.state.collapsed} collapsedWidth={0}
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
                icon={this.state.rightSidercollapsed ? 'eye-o' : 'eye'}
                onClick={this.toggleRightSider}
              />
            </div>
          </Header>
          <Content className="main-content layout-min-width layout-min-width-large">
            <FlowGraph onMounted={this.handleGraphMounted} onSelect={this.handleGraphElemClick} />
            {this.state.selGraphElement &&
            <Form layout="vertical">
              {this.state.selGraphElement.get('type') === 'node' &&
              <BizObjCMSPanel form={form} />
              }
              {this.state.selGraphElement.get('type') === 'edge' &&
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
