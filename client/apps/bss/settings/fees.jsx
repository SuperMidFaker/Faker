import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Breadcrumb, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { toggleOrderTypeModal, loadOrderTypes, removeOrderType } from 'common/reducers/sofOrderPref';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import SettingMenu from './menu';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content, Sider } = Layout;

@injectIntl
@connect(
  state => ({
    orderTypeList: state.sofOrderPref.orderTypeList,
    visible: state.sofOrderPref.orderTypeModal.visible,
    modalOrderType: state.sofOrderPref.orderTypeModal.orderType,
    reload: state.sofOrderPref.typeListReload,
  }),
  { toggleOrderTypeModal, loadOrderTypes, removeOrderType }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class Fees extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    currentTab: 'feeItems',
  }
  componentDidMount() {
    const { orderTypeList } = this.props;
    this.props.loadOrderTypes({
      pageSize: orderTypeList.pageSize,
      current: orderTypeList.current,
    });
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  itemsColumns = [{
    title: '费用项代码',
    dataIndex: 'fee_item_code',
    width: 150,
  }, {
    title: '费用项名称',
    dataIndex: 'fee_item_name',
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 150,
    render: (o, record) => <RowAction confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDelete} tooltip="删除" row={record} />,
  }]
  groupsColumns = [{
    title: '费用分组代码',
    dataIndex: 'fee_group_code',
    width: 150,
  }, {
    title: '费用分组名称',
    dataIndex: 'fee_group_name',
  }, {
    title: '费用项数量',
    dataIndex: 'items_count',
    width: 150,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 150,
    render: (o, record) => <RowAction confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDelete} tooltip="删除" row={record} />,
  }]
  handleCreate = () => {
    this.props.toggleOrderTypeModal(true, {});
  }
  handleConfig = (type) => {
    this.props.toggleOrderTypeModal(true, type);
  }
  handleTypeDel = (type) => {
    this.props.removeOrderType(type.id).then((result) => {
      if (!result.error) {
        const { orderTypeList } = this.props;
        this.props.loadOrderTypes({
          pageSize: orderTypeList.pageSize,
          current: orderTypeList.current,
        });
      }
    });
  }
  handleModalCancel = () => {
    const { orderTypeList, reload } = this.props;
    if (reload) {
      this.props.loadOrderTypes({
        pageSize: orderTypeList.pageSize,
        current: orderTypeList.current,
      });
    }
    this.props.toggleOrderTypeModal(false, {});
  }
  handlePageLoad = (current, pageSize) => {
    this.props.loadOrderTypes({
      pageSize,
      current,
    });
  }
  handleTabChange = (key) => {
    if (key === 'feeItems') {
      this.setState({ currentTab: 'feeItems' });
    } else if (key === 'feeGroups') {
      this.setState({ currentTab: 'feeGroups' });
    }
  }
  render() {
    const { currentTab } = this.state;
    const tabList = [
      {
        key: 'feeItems',
        tab: this.msg('feeItems'),
      },
      {
        key: 'feeGroups',
        tab: this.msg('feeGroups'),
      },
    ];
    const itemsActions = <SearchBox placeholder={this.msg('itemsSearchTip')} onSearch={this.handleSearchItems} />;
    const groupsActions = <SearchBox placeholder={this.msg('groupsSearchTip')} onSearch={this.handleSearchGroups} />;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('settings')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <SettingMenu currentKey="fees" />
          </div>
        </Sider>
        <Layout>
          <PageHeader tabList={tabList} onTabChange={this.handleTabChange}>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('fees')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              {currentTab === 'feeItems' && <Button type="primary" icon="plus" onClick={this.handleCreateFeeItem}>
                {this.msg('新建费用项')}
              </Button>}
              {currentTab === 'feeGroups' && <Button type="primary" icon="plus" onClick={this.handleCreateFeeItem}>
                {this.msg('新建费用分组')}
              </Button>}
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content">
            {currentTab === 'feeItems' && <DataTable
              toolbarActions={itemsActions}
              selectedRowKeys={this.state.selectedRowKeys}
              handleDeselectRows={this.handleDeselectRows}
              columns={this.itemsColumns}
              rowSelection={rowSelection}
              rowKey="id"
            />}
            {currentTab === 'feeGroups' && <DataTable
              toolbarActions={groupsActions}
              selectedRowKeys={this.state.selectedRowKeys}
              handleDeselectRows={this.handleDeselectRows}
              columns={this.groupsColumns}
              rowSelection={rowSelection}
              rowKey="id"
            />}
          </Content>
        </Layout>
      </Layout>
    );
  }
}
