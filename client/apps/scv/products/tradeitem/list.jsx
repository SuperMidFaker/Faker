import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, Layout, Radio, Dropdown, Icon, Menu, Popconfirm, message } from 'antd';
import RemoteTable from 'client/components/remoteAntTable';
import NavLink from 'client/components/nav-link';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadTradeParams } from 'common/reducers/cmsTradeitem';
import { loadTradeItems, deleteItem, deleteSelectedItems, setItemStatus, setCompareVisible, setNominatedVisible } from 'common/reducers/scvClassification';
import SearchBar from 'client/components/search-bar';
import { createFilename } from 'client/util/dataTransform';
import { CMS_ITEM_STATUS } from 'common/constants';
import RowUpdater from 'client/components/rowUpdater';
import ImportComparisonModal from './modals/importComparison';
import NominatedImportModal from './modals/nominatedImport';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadTradeItems({
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.scvClassification.listFilter),
    pageSize: state.scvClassification.tradeItemlist.pageSize,
    currentPage: state.scvClassification.tradeItemlist.current,
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
    listFilter: state.scvClassification.listFilter,
    tradeItemlist: state.scvClassification.tradeItemlist,
    visibleAddItemModal: state.scvClassification.visibleAddItemModal,
    tradeItemsLoading: state.scvClassification.tradeItemsLoading,
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
  { loadTradeItems, deleteItem, deleteSelectedItems, setItemStatus, setCompareVisible, setNominatedVisible }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class TradeItemList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    tradeItemlist: PropTypes.object.isRequired,
    visibleAddItemModal: PropTypes.bool,
    listFilter: PropTypes.object.isRequired,
    tradeItemsLoading: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    brokers: [],
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('copProductNo'),
    dataIndex: 'cop_product_no',
    fixed: 'left',
    width: 200,
  }, {
    title: this.msg('contributed'),
    dataIndex: 'contribute_tenant_name',
    width: 180,
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
  dataSource = new RemoteTable.DataSource({
    fetcher: params => this.props.loadTradeItems(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        searchText: this.props.tradeItemlist.searchText,
      };
      const filter = this.props.listFilter;
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.tradeItemlist,
  })
  handleItemListLoad = (currentPage, filter, search) => {
    const { tenantId, listFilter, tradeItemlist: { pageSize, current, searchText } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadTradeItems({
      tenantId,
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      currentPage: currentPage || current,
      searchText: search !== undefined ? search : searchText,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleItemDel = (id) => {
    this.props.deleteItem(id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleItemListLoad();
      }
    });
  }
  handleButtonClick = (ev) => {
    ev.stopPropagation();
  }
  handleAddItem = () => {
    this.context.router.push('/scv/products/tradeitem/create');
  }
  handleMenuClick = (e) => {
    if (e.key === 'export') {
      window.open(`${API_ROOTS.default}v1/scv/tradeitems/export/${createFilename('itemsExport')}.xlsx?tenantId=${this.props.tenantId}`);
    } else if (e.key === 'model') {
      window.open(`${API_ROOTS.default}v1/scv/tradeitems/model/download/${createFilename('tradeItemModel')}.xlsx`);
    }
  }
  handleDeleteSelected = () => {
    const selectedIds = this.state.selectedRowKeys;
    this.props.deleteSelectedItems(selectedIds).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleItemListLoad();
      }
    });
    this.setState({ selectedRowKeys: [] });
  }
  handleRadioChange = (ev) => {
    this.setState({ selectedRowKeys: [] });
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleItemListLoad(1, filter);
  }
  handleItemPass = (row) => {
    this.props.setItemStatus({ ids: [row.id], status: CMS_ITEM_STATUS.classified }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.success('归类通过');
        this.handleItemListLoad();
      }
    });
  }
  handleItemRefused = (row) => {
    this.props.setItemStatus({ ids: [row.id], status: CMS_ITEM_STATUS.unclassified }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.warning('归类拒绝');
        this.handleItemListLoad();
      }
    });
  }
  handleItemsPass = () => {
    this.props.setItemStatus({ ids: this.state.selectedRowKeys, status: CMS_ITEM_STATUS.classified }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.setState({ selectedRowKeys: [] });
        this.handleItemListLoad();
      }
    });
  }
  handleItemsRefused = () => {
    this.props.setItemStatus({ ids: this.state.selectedRowKeys, status: CMS_ITEM_STATUS.unclassified }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.setState({ selectedRowKeys: [] });
        this.handleItemListLoad();
      }
    });
  }
  handleSearch = (value) => {
    const { listFilter } = this.props;
    this.handleItemListLoad(1, listFilter, value);
  }
  handleDropdownButtonClick = () => {
    this.props.setNominatedVisible(true);
  }
  render() {
    const { tradeItemlist, listFilter } = this.props;
    const selectedRows = this.state.selectedRowKeys;
    const rowSelection = {
      selectedRowKeys: selectedRows,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    let batchOperation = null;
    if (selectedRows.length > 0) {
      if (listFilter.status === 'unclassified') {
        batchOperation = (<Popconfirm title={'是否删除所有选择项？'} onConfirm={() => this.handleDeleteSelected()}>
          <Button type="danger" size="large" icon="delete">
            批量删除
          </Button>
        </Popconfirm>);
      } else if (listFilter.status === 'pending') {
        batchOperation = (<span>
          <Button size="large" onClick={this.handleItemsPass}>
            批量通过
          </Button>
          <Button size="large" onClick={this.handleItemsRefused} >
            批量拒绝
          </Button>
          <Popconfirm title={'是否删除所有选择项？'} onConfirm={() => this.handleDeleteSelected()}>
            <Button type="danger" size="large" icon="delete">
              批量删除
            </Button>
          </Popconfirm>
        </span>);
      }
    }
    this.dataSource.remotes = tradeItemlist;
    const columns = [...this.columns];
    columns.push({
      title: this.msg('opColumn'),
      width: 150,
      fixed: 'right',
      render: (o, record) => {
        if (record.status === CMS_ITEM_STATUS.unclassified) {
          return (<span>
            <NavLink to={`/scv/products/tradeitem/edit/${record.id}`}>
              <Icon type="edit" /> {this.msg('modify')}
            </NavLink>
            <span className="ant-divider" />
            <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleItemDel(record.id)}>
              <a role="button"><Icon type="delete" /> {this.msg('delete')}</a>
            </Popconfirm>
          </span>);
        } else if (record.status === CMS_ITEM_STATUS.pending) {
          return (
            <span>
              <RowUpdater onHit={this.handleItemPass} label={<span><Icon type="check-circle-o" /> {this.msg('pass')}</span>} row={record} />
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleItemRefused} label={<span><Icon type="close-circle-o" /> {this.msg('refuse')}</span>} row={record} />
              <span className="ant-divider" />
              <Dropdown overlay={(
                <Menu>
                  <Menu.Item key="edit">
                    <NavLink to={`/scv/products/tradeitem/edit/${record.id}`}>
                      <Icon type="edit" /> {this.msg('modify')}
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="delete">
                    <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleItemDel(record.id)}>
                      <a role="button"><Icon type="delete" /> {this.msg('delete')}</a>
                    </Popconfirm>
                  </Menu.Item>
                </Menu>)}
              >
                <a><Icon type="down" /></a>
              </Dropdown>
            </span>
          );
        } else if (record.status === CMS_ITEM_STATUS.classified) {
          return (
            <span>
              <NavLink to={`/scv/products/tradeitem/edit/${record.id}`}>
                <Icon type="edit" /> {this.msg('modify')}
              </NavLink>
            </span>
          );
        }
      },
    });
    const importMenu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="export"><Icon type="export" /> 导出物料表</Menu.Item>
        <Menu.Item key="model"><Icon type="download" /> 下载模板</Menu.Item>
      </Menu>);
    return (
      <Layout className="ant-layout-wrapper">
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('classification')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('tradeItemMaster')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <span />
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} size="large">
            <RadioButton value="unclassified">{this.msg('filterUnclassified')}</RadioButton>
            <RadioButton value="pending">{this.msg('filterPending')}</RadioButton>
            <RadioButton value="classified">{this.msg('filterClassified')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} size="large">
            <RadioButton value="conflicted">{this.msg('filterConflict')}</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools">
            <Dropdown.Button onClick={this.handleDropdownButtonClick} overlay={importMenu}>
              {this.msg('importItems')}
            </Dropdown.Button>
            <Button type="primary" size="large" icon="plus" onClick={this.handleAddItem}>
              {this.msg('addItem')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-min-width layout-min-width-large">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder="编码/名称/描述/申报要素" onInputSearch={this.handleSearch} size="large" />
              <span />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                {batchOperation}
              </div>
            </div>
            <div className="panel-body table-panel">
              <RemoteTable loading={this.props.tradeItemsLoading} rowSelection={rowSelection} rowKey={record => record.id} columns={columns} dataSource={this.dataSource} scroll={{ x: 3800 }} />
            </div>
            <NominatedImportModal />
            <ImportComparisonModal />
          </div>
        </Content>
      </Layout>
    );
  }
}
