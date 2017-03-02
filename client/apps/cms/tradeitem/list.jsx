import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, Layout, Radio, Select, Dropdown, Icon, Menu, Popconfirm, Tooltip, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import NavLink from 'client/components/nav-link';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadCustomers } from 'common/reducers/crmCustomers';
import { loadOwners, openAddModal, selectedRepoId, loadTradeItems,
  deleteItem, deleteSelectedItems, setOwner } from 'common/reducers/cmsTradeitem';
import AddTradeRepoModal from './modals/addTradeRepo';
import ExtraPanel from './tabpanes/ExtraPane';
import SearchBar from 'client/components/search-bar';
import ExcelUpload from 'client/components/excelUploader';
import { createFilename } from 'client/util/dataTransform';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadTradeItems({
    repoId: state.cmsTradeitem.repoId,
    pageSize: state.cmsTradeitem.tradeItemlist.pageSize,
    currentPage: state.cmsTradeitem.tradeItemlist.current,
  })));
  promises.push(dispatch(loadOwners({
    tenantId: state.account.tenantId,
  })));
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    repoOwners: state.cmsTradeitem.repoOwners,
    repoId: state.cmsTradeitem.repoId,
    tradeItemlist: state.cmsTradeitem.tradeItemlist,
    visibleAddModal: state.cmsTradeitem.visibleAddModal,
    owner: state.cmsTradeitem.owner,
  }),
  { loadCustomers, openAddModal, selectedRepoId, loadTradeItems, deleteItem, deleteSelectedItems, setOwner }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class TradeItemList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    repoOwners: PropTypes.array.isRequired,
    tradeItemlist: PropTypes.object.isRequired,
    repoId: PropTypes.number,
    visibleAddModal: PropTypes.bool,
    owner: PropTypes.object,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    collapsed: false,
    rightSidercollapsed: true,
    selectedRowKeys: [],
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('copProductNo'),
    dataIndex: 'cop_product_no',
    width: 220,
  }, {
    title: this.msg('hscode'),
    dataIndex: 'hscode',
    width: 180,
  }, {
    title: this.msg('gName'),
    dataIndex: 'g_name',
    width: 200,
  }, {
    title: this.msg('gModel'),
    dataIndex: 'g_model',
    width: 300,
  }, {
    title: this.msg('element'),
    dataIndex: 'element',
    width: 400,
  }, {
    title: this.msg('gUnit1'),
    dataIndex: 'g_unit_1',
    width: 120,
  }, {
    title: this.msg('gUnit2'),
    dataIndex: 'g_unit_2',
    width: 120,
  }, {
    title: this.msg('gUnit3'),
    dataIndex: 'g_unit_3',
    width: 120,
  }, {
    title: this.msg('unit1'),
    dataIndex: 'unit_1',
    width: 130,
  }, {
    title: this.msg('unit2'),
    dataIndex: 'unit_2',
    width: 130,
  }, {
    title: this.msg('fixedQty'),
    dataIndex: 'fixed_qty',
    width: 120,
  }, {
    title: this.msg('fixedUnit'),
    dataIndex: 'fixed_unit',
    width: 130,
  }, {
    title: this.msg('origCountry'),
    dataIndex: 'origin_country',
    width: 120,
  }, {
    title: this.msg('unitNetWt'),
    dataIndex: 'unit_net_wt',
    width: 120,
  }, {
    title: this.msg('customsControl'),
    dataIndex: 'customs_control',
    width: 140,
  }, {
    title: this.msg('inspQuarantine'),
    dataIndex: 'inspection_quarantine',
    width: 140,
  }, {
    title: this.msg('unitPrice'),
    dataIndex: 'unit_price',
    width: 120,
  }, {
    title: this.msg('currency'),
    dataIndex: 'currency',
    width: 120,
  }, {
    title: this.msg('preClassifyNo'),
    dataIndex: 'pre_classify_no',
    width: 120,
  }, {
    title: this.msg('preClassifyStartDate'),
    dataIndex: 'pre_classify_start_date ',
    width: 180,
    render: (o, record) => {
      if (record.pre_classify_start_date) {
        return moment(record.pre_classify_start_date).format('YYYY-MM-DD');
      } else {
        return '--';
      }
    },
  }, {
    title: this.msg('preClassifyEndDate'),
    dataIndex: 'pre_classify_end_date ',
    width: 180,
    render: (o, record) => {
      if (record.pre_classify_end_date) {
        return moment(record.pre_classify_end_date).format('YYYY-MM-DD');
      } else {
        return '--';
      }
    },
  }, {
    title: this.msg('remark'),
    dataIndex: 'remark',
    width: 200,
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadTradeItems(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        repoId: this.props.repoId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter, sortField: sorter.field, sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.tradeItemlist,
  })
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
  handleItemListLoad = (repoid, currentPage, filter) => {
    const { repoId, listFilter, tradeItemlist: { pageSize, current } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadTradeItems({
      repoId: repoid || repoId,
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      currentPage: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleItemDel = (id) => {
    this.props.deleteItem(id).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.handleItemListLoad();
      }
    });
  }
  handleSelectChange = (value) => {
    if (value) {
      const owner = this.props.repoOwners.filter(own => own.id === value)[0];
      this.props.selectedRepoId(owner.repo_id);
      this.handleItemListLoad(owner.repo_id);
      this.props.setOwner(owner);
    }
  }
  handleAddOwener = () => {
    this.props.loadCustomers({
      tenantId: this.props.tenantId,
    });
    this.props.openAddModal();
  }
  handleButtonClick = (ev) => {
    ev.stopPropagation();
  }
  handleAddItem = () => {
    this.context.router.push('/clearance/classification/tradeitem/create');
  }
  handleMenuClick = (e) => {
    if (e.key === 'export') {
      window.open(`${API_ROOTS.default}v1/cms/cmsTradeitem/tradeitems/export/${createFilename('itemsExport')}.xlsx?repoId=${this.props.repoId}`);
    } else if (e.key === 'model') {
      window.open(`${API_ROOTS.default}v1/cms/cmsTradeitem/tradeitems/model/download/${createFilename('tradeItemModel')}.xlsx`);
    }
  }
  handleUploaded = () => {
    this.handleItemListLoad();
  }
  handleDeleteSelected = () => {
    const selectedIds = this.state.selectedRowKeys;
    this.props.deleteSelectedItems(selectedIds).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.handleItemListLoad();
      }
    });
  }
  render() {
    const { repoOwners, tradeItemlist, repoId, owner } = this.props;
    let ownVal = '';
    if (owner.partner_code) {
      ownVal = `${owner.partner_code} | ${owner.name}`;
    }
    const selectedRows = this.state.selectedRowKeys;
    const rowSelection = {
      selectedRowKeys: selectedRows,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    this.dataSource.remotes = tradeItemlist;
    const columns = [...this.columns];
    columns.push({
      title: this.msg('opColumn'),
      width: 80,
      fixed: 'right',
      render: (o, record) => (
        <span>
          <NavLink to={`/clearance/classification/tradeitem/edit/${record.id}`}>
            {this.msg('modify')}
          </NavLink>
          <span className="ant-divider" />
          <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleItemDel(record.id)}>
            <a role="button"><Icon type="delete" /></a>
          </Popconfirm>
        </span>
        ),
    });
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="importData">
          <ExcelUpload endpoint={`${API_ROOTS.default}v1/cms/cmsTradeitem/tradeitems/import`}
            formData={{
              data: JSON.stringify({
                repo_id: this.props.repoId,
                tenant_id: this.props.tenantId,
                created_login_id: this.props.loginId,
                created_login_name: this.props.loginName,
              }),
            }} onUploaded={this.handleUploaded}
          >
            <Icon type="file-excel" /> {this.msg('importItems')}
          </ExcelUpload>
        </Menu.Item>
        <Menu.Item key="export"><Icon type="export" /> 导出物料表</Menu.Item>
        <Menu.Item key="model"><Icon type="download" /> 下载模板</Menu.Item>
      </Menu>);
    return (
      <Layout className="ant-layout-wrapper">
        <Sider width={280} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('classification')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('tradeItemMaster')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="pull-right">
              <Tooltip placement="bottom" title="添加企业物料库">
                <Button type="primary" shape="circle" size="small" icon="plus" onClick={this.handleAddOwener} ghost />
              </Tooltip>
            </div>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">

            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('classification')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('tradeItemMaster')}
              </Breadcrumb.Item>
            </Breadcrumb>
            }
            <Button size="large"
              className={this.state.collapsed ? '' : 'btn-toggle-on'}
              icon={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            <span />
            <Select
              showSearch
              style={{ width: 220 }}
              placeholder="选择客户企业物料库"
              optionFilterProp="children"
              size="large"
              defaultValue={`${ownVal}`}
              onChange={this.handleSelectChange}
            >
              {
                    repoOwners.map(data => (<Option key={data.id} value={data.id}
                      search={`${data.partner_code}${data.name}`}
                    >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
                    )}
            </Select>
            <span />
            <RadioGroup onChange={this.handleRadioChange} size="large">
              <RadioButton value="unclassified">{this.msg('filterUnclassified')}</RadioButton>
              <RadioButton value="pending">{this.msg('filterPending')}</RadioButton>
              <RadioButton value="classified">{this.msg('filterClassified')}</RadioButton>
            </RadioGroup>
            {repoId &&
              <div className="top-bar-tools">
                <Dropdown overlay={menu} type="primary">
                  <Button size="large" onClick={this.handleButtonClick}>
                    {this.msg('importItems')} <Icon type="down" />
                  </Button>
                </Dropdown>
                <Button type="primary" size="large" icon="plus" onClick={this.handleAddItem}>
                  {this.msg('addItem')}
                </Button>
                <Button size="large"
                  className={this.state.rightSidercollapsed ? '' : 'btn-toggle-on'}
                  icon={this.state.rightSidercollapsed ? 'setting' : 'setting'}
                  onClick={this.toggleRightSider}
                />
              </div>
              }
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="toolbar">
                <SearchBar placeholder="编码/名称/描述/申报要素" onInputSearch={this.handleSearch} size="large" />
                <span />
                {selectedRows.length > 0 &&
                <Popconfirm title={'是否删除所有选择项？'} onConfirm={() => this.handleDeleteSelected()}>
                  <Button type="danger" size="large" icon="delete">
                    批量删除
                  </Button>
                </Popconfirm>
                  }
              </div>
              <div className="panel-body table-panel">
                <Table rowSelection={rowSelection} rowKey="id" columns={columns} dataSource={this.dataSource} scroll={{ x: 2500 }} />
              </div>
              <AddTradeRepoModal />
            </div>
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
              <h3>物料库设置</h3>
            </div>
            <ExtraPanel />
          </div>
        </Sider>
      </Layout>
    );
  }
}
