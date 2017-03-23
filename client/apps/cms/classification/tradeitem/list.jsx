import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Alert, Breadcrumb, Button, Collapse, Layout, Radio, Dropdown, Icon, Menu, Popconfirm, Tooltip, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import NavLink from 'client/components/nav-link';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadCustomers } from 'common/reducers/crmCustomers';
import { loadOwners, openAddModal, selectedRepoId, loadTradeItems, setCompareVisible,
  deleteItem, deleteSelectedItems, setOwner, deleteRepo, loadTradeParams } from 'common/reducers/cmsTradeitem';
import AddTradeRepoModal from './modals/addTradeRepo';
import SearchBar from 'client/components/search-bar';
import ExcelUpload from 'client/components/excelUploader';
import { createFilename } from 'client/util/dataTransform';
import CopCodesPane from './panes/copCodesPane';
import SetUnitPane from './panes/setUnitPane';
import ImportComparisonModal from './modals/importComparison';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Panel = Collapse.Panel;

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
  promises.push(dispatch(loadTradeParams()));
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
    units: state.cmsTradeitem.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    currencies: state.cmsTradeitem.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    tradeCountries: state.cmsTradeitem.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
  }),
  { loadCustomers, openAddModal, selectedRepoId, loadTradeItems, setCompareVisible,
    deleteItem, deleteSelectedItems, setOwner, loadOwners, deleteRepo }
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
    comparedData: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.repoOwners !== this.props.repoOwners && nextProps.repoOwners.length > 0) {
      const owner = nextProps.repoOwners.filter(rp => rp.repo_id === nextProps.repoId)[0];
      if (owner) {
        this.handleRowClick(owner);
      } else {
        this.handleRowClick(nextProps.repoOwners[0]);
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('copProductNo'),
    dataIndex: 'cop_product_no',
    fixed: 'left',
    width: 200,
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
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('gUnit2'),
    dataIndex: 'g_unit_2',
    width: 120,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('gUnit3'),
    dataIndex: 'g_unit_3',
    width: 120,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('unit1'),
    dataIndex: 'unit_1',
    width: 130,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('unit2'),
    dataIndex: 'unit_2',
    width: 130,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('fixedQty'),
    dataIndex: 'fixed_qty',
    width: 120,
  }, {
    title: this.msg('fixedUnit'),
    dataIndex: 'fixed_unit',
    width: 130,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('origCountry'),
    dataIndex: 'origin_country',
    width: 120,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text;
    },
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
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text;
    },
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
  handleRowClick = (record) => {
    const owner = record;
    this.props.selectedRepoId(owner.repo_id);
    this.handleItemListLoad(owner.repo_id);
    this.props.setOwner(owner);
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
  handleUploaded = (data) => {
    this.setState({ comparedData: data });
    this.props.setCompareVisible(true);
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
    this.setState({ selectedRowKeys: [] });
  }
  handleDeleteRepo = () => {
    this.props.deleteRepo(this.props.repoId).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.loadOwners({ tenantId: this.props.tenantId });
      }
    });
  }
  render() {
    const { tradeItemlist, repoId, owner } = this.props;
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
        <span className="editable-row-operations">
          <NavLink to={`/clearance/classification/tradeitem/edit/${record.id}`}>
            <Icon type="edit" />
          </NavLink>
          <span className="ant-divider" />
          <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleItemDel(record.id)}>
            <a role="button"><Icon type="delete" /></a>
          </Popconfirm>
        </span>
        ),
    });
    const repoColumns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<div style={{ paddingLeft: 15 }}>{o}</div>),
    }];
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
                <Button type="primary" shape="circle" icon="plus" onClick={this.handleAddOwener} />
              </Tooltip>
            </div>
          </div>
          <div className="left-sider-panel" >
            <Table size="middle" dataSource={this.props.repoOwners} columns={repoColumns} showHeader={false} onRowClick={this.handleRowClick}
              rowKey="id" pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }}
              rowClassName={record => record.id === owner.id ? 'table-row-selected' : ''}
            />
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
          <Content className="main-content layout-min-width layout-min-width-large">
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
                <Table rowSelection={rowSelection} rowKey={record => record.id} columns={columns} dataSource={this.dataSource} scroll={{ x: 3800 }} />
              </div>
              <AddTradeRepoModal />
              <ImportComparisonModal data={this.state.comparedData} />
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
            <Collapse accordion defaultActiveKey="trader">
              <Panel header={'授权收发货人'} key="trader">
                <CopCodesPane />
              </Panel>
              <Panel header={'申报单位规则'} key="unit">
                <SetUnitPane />
              </Panel>
              <Panel header={'更多'} key="more">
                <Alert
                  message="警告"
                  description="删除物料库数据将无法恢复，请谨慎操作"
                  type="warning"
                  showIcon
                />
                <Popconfirm title="是否确认删除?" onConfirm={this.handleDeleteRepo}>
                  <Button type="danger" size="large" icon="delete">删除物料库</Button>
                </Popconfirm>
              </Panel>
            </Collapse>
          </div>
        </Sider>
      </Layout>
    );
  }
}
