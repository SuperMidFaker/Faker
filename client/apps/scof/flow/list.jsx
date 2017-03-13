import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Input, Layout, Table, Tooltip } from 'antd';
import { openCreateFlowModal } from 'common/reducers/scofFlow';
import connectNav from 'client/common/decorators/connect-nav';
import CreateFlowModal from './modal/createFlowModal';
import FlowDesigner from './designer';
import { formatMsg } from './message.i18n';

const Sider = Layout.Sider;
const Search = Input.Search;

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
export default class FlowList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
    collapsed: false,
  }
  msg = formatMsg(this.props.intl)

  handleListSiderToggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleCreateFlow = () => {
    this.props.openCreateFlowModal();
  }
  render() {
    const { flow, collapsed } = this.state;
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<div style={{ paddingLeft: 15 }}>{o}</div>),
    }];
    return (
      <Layout>
        <Sider width={280} className="menu-sider" key="sider" trigger={null}
          collapsible collapsed={collapsed} collapsedWidth={0}
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
        </Sider>
        <CreateFlowModal />
        <Button size="large" className={collapsed ? '' : 'btn-toggle-on'}
          icon={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.handleListSiderToggle}
        />
        <FlowDesigner listCollapsed={collapsed} />
      </Layout>
    );
  }
}
