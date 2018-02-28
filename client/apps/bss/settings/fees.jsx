import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Breadcrumb, Dropdown, Icon, Menu, Layout } from 'antd';
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
    title: '费用元素代码',
    dataIndex: 'code',
    width: 150,
  }, {
    title: '费用元素名称',
    dataIndex: 'name',
    width: 150,
  }, {
    title: '类型',
    dataIndex: 'type',
    width: 100,
  }, {
    title: '所属分组',
    dataIndex: 'group',
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 90,
    render: (o, record) => (<span>
      <RowAction onClick={this.handleAdd} icon="plus-circle-o" tooltip="添加子费用元素" row={record} />
      <RowAction danger confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDelete} icon="delete" row={record} />
    </span>),
  }]
  groupsColumns = [{
    title: '费用分组代码',
    dataIndex: 'fee_group_code',
    width: 150,
  }, {
    title: '费用分组名称',
    dataIndex: 'fee_group_name',
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 90,
    render: (o, record) => <RowAction confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDelete} icon="delete" row={record} />,
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
    this.setState({ currentTab: key });
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
    const moreMenu = (
      <Menu onClick={this.handleMoreMenuClick}>
        <Menu.Item key="import"><Icon type="upload" /> 导入费用元素</Menu.Item>
        <Menu.Item key="export"><Icon type="download" /> 导出费用元素</Menu.Item>
      </Menu>
    );
    const mockData = [{
      code: '10',
      name: '报关费',
      type: 'SC',
      group: '清关费用',
    }, {
      code: '20',
      name: '联单费',
      type: 'SC',
      group: '清关费用',
    }, {
      code: '100',
      name: '港杂费',
      type: 'AP',
      group: '清关费用',
      children: [
        {
          code: '1001',
          name: '污箱费',
          type: 'AP',
          group: '清关费用',
        },
        {
          code: '1002',
          name: '滞箱费',
          type: 'AP',
          group: '清关费用',
        },
      ],
    }];

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
            <PageHeader.Actions>
              {currentTab === 'feeItems' && <Button type="primary" icon="plus" onClick={this.handleCreateFeeItem}>
                {this.msg('新建费用元素')}
              </Button>}
              {currentTab === 'feeItems' && <Dropdown overlay={moreMenu}>
                <Button icon="ellipsis" />
              </Dropdown>}
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
              dataSource={mockData}
              rowSelection={rowSelection}
              rowKey="code"
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
