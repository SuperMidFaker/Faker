import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, Collapse, Layout, Radio, Dropdown, Icon, Menu, Popconfirm, message, Popover, Input, Form } from 'antd';
import RemoteTable from 'client/components/remoteAntTable';
import NavLink from 'client/components/NavLink';
import ButtonToggle from 'client/components/ButtonToggle';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadTradeParams } from 'common/reducers/cmsTradeitem';
import { loadTradeItems, deleteItems, setItemStatus, setCompareVisible, setNominatedVisible, loadConflictItems } from 'common/reducers/scvClassification';
import SearchBar from 'client/components/SearchBar';
import { createFilename } from 'client/util/dataTransform';
import { TRADE_ITEM_STATUS } from 'common/constants';
import RowUpdater from 'client/components/rowUpdater';
import ImportComparisonModal from './modals/importComparison';
import NominatedImportModal from './modals/nominatedImport';
import ConflictList from './conflictList';
import MasterSharePane from './panes/masterSharePane';
import SlaveSyncPane from './panes/slaveSyncPane';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const FormItem = Form.Item;
const Panel = Collapse.Panel;

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
    conflictItemlist: state.scvClassification.conflictItemlist,
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
  { loadTradeItems, deleteItems, setItemStatus, setCompareVisible, setNominatedVisible, loadConflictItems }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
@Form.create()
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
    listView: 'noConflict',
    rightSiderCollapsed: true,
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
    title: this.msg('enName'),
    dataIndex: 'en_name',
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
      showTotal: total => `共 ${total} 条`,
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
  toggleRightSider = () => {
    this.setState({
      rightSiderCollapsed: !this.state.rightSiderCollapsed,
    });
  }
  handleItemListLoad = (currentPage, filter, search) => {
    const { tenantId, listFilter, tradeItemlist: { pageSize, current, searchText } } = this.props;
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
  handleConflictListLoad = (currentPage, filter, search) => {
    const { tenantId, listFilter, conflictItemlist: { pageSize, current, searchText } } = this.props;
    this.props.loadConflictItems({
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
    this.props.deleteItems({ ids: [id], tenantId: this.props.tenantId }).then((result) => {
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
      window.open(`${API_ROOTS.default}v1/scv/tradeitems/export/${createFilename('scvItemsExport')}.xlsx?tenantId=${this.props.tenantId}`);
    } else if (e.key === 'model') {
      window.open(`${API_ROOTS.default}v1/scv/tradeitems/model/download/${createFilename('tradeItemModel')}.xlsx`);
    } else if (e.key === 'exportEditable') {
      window.open(`${API_ROOTS.default}v1/scv/edited/tradeitems/export/${createFilename('editedScvItems')}.xlsx?tenantId=${this.props.tenantId}`);
    }
  }
  handleExportSelected = () => {
    const selectedIds = this.state.selectedRowKeys;
    window.open(`${API_ROOTS.default}v1/scv/tradeitems/selected/export/${createFilename('selectedScvItemsExport')}.xlsx?selectedIds=${selectedIds}`);
  }
  handleDeleteSelected = () => {
    const selectedIds = this.state.selectedRowKeys;
    this.props.deleteItems({ ids: selectedIds, tenantId: this.props.tenantId }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleItemListLoad();
      }
    });
    this.setState({ selectedRowKeys: [] });
  }
  handleRadioChange = (ev) => {
    this.setState({ selectedRowKeys: [], listView: 'noConflict' });
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleItemListLoad(1, filter);
  }
  handleConflictRadio = (ev) => {
    this.setState({ selectedRowKeys: [], listView: 'conflict' });
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleConflictListLoad(1, filter);
  }
  handleSetItemStatus = (ids, status, tenantId, conflicted) => {
    this.props.setItemStatus({ ids, status, tenantId, conflicted }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        if (status === TRADE_ITEM_STATUS.classified) {
          if (result.data.length > 0) {
            const msg = `货号为${result.data.join(', ')}的[中文规格型号]中的填写的项数与申报要素的项数需要一致，请修改后重新审核`;
            message.error(msg, 10);
          } else {
            message.success('归类通过');
          }
        } else if (status === TRADE_ITEM_STATUS.unclassified) {
          message.warning('归类拒绝');
        }
        this.setState({ selectedRowKeys: [] });
        this.handleItemListLoad();
      }
    });
  }
  handleItemPass = (row) => {
    this.handleSetItemStatus([row.id], TRADE_ITEM_STATUS.classified, this.props.tenantId, false);
  }
  handleItemRefused = (row) => {
    const reason = this.props.form.getFieldValue('reason');
    this.props.setItemStatus({
      ids: [row.id],
      status: TRADE_ITEM_STATUS.unclassified,
      tenantId: this.props.tenantId,
      reason,
      conflicted: false }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          message.warning('归类拒绝');
          this.handleItemListLoad();
        }
      });
  }
  handleItemsPass = () => {
    this.handleSetItemStatus(this.state.selectedRowKeys, TRADE_ITEM_STATUS.classified, this.props.tenantId, false);
  }
  handleItemsRefused = () => {
    this.handleSetItemStatus(this.state.selectedRowKeys, TRADE_ITEM_STATUS.unclassified, this.props.tenantId, false);
  }
  handlePassMenuClick = (e) => {
    if (e.key === 'allPass') {
      this.handleSetItemStatus(['all'], TRADE_ITEM_STATUS.classified, this.props.tenantId, false);
    }
  }
  handleRefuseMenuClick = (e) => {
    if (e.key === 'allRefuse') {
      this.handleSetItemStatus(['all'], TRADE_ITEM_STATUS.unclassified, this.props.tenantId, false);
    }
  }
  handleSearch = (value) => {
    const { listFilter } = this.props;
    if (this.state.listView === 'conflict') {
      this.handleConflictListLoad(1, listFilter, value);
    } else {
      this.handleItemListLoad(1, listFilter, value);
    }
  }
  handleDropdownButtonClick = () => {
    this.props.setNominatedVisible(true);
  }
  render() {
    const { tradeItemlist, listFilter, form: { getFieldDecorator } } = this.props;
    const selectedRows = this.state.selectedRowKeys;
    const rowSelection = {
      selectedRowKeys: selectedRows,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const itemPassmenu = (
      <Menu onClick={this.handlePassMenuClick}>
        <Menu.Item key="allPass"><Icon type="check-circle-o" /> 全部通过</Menu.Item>
      </Menu>);
    const itemRefusedmenu = (
      <Menu onClick={this.handleRefuseMenuClick}>
        <Menu.Item key="allRefuse"><Icon type="close-circle-o" /> 全部拒绝</Menu.Item>
      </Menu>);
    let batchOperation = null;
    if (selectedRows.length > 0) {
      if (listFilter.status === 'unclassified') {
        batchOperation = (<span>
          <Button icon="export" onClick={this.handleExportSelected} >
            批量导出
          </Button>
          <Popconfirm title={'只能删除所选项中归类来源是当前租户的数据，确认删除？'} onConfirm={() => this.handleDeleteSelected()}>
            <Button type="danger" icon="delete">
            批量删除
          </Button>
          </Popconfirm></span>);
      } else if (listFilter.status === 'pending') {
        batchOperation = (<span>
          <Dropdown.Button onClick={this.handleItemsPass} overlay={itemPassmenu}>
            <Icon type="check-circle-o" /> 批量通过
          </Dropdown.Button>
          <Dropdown.Button onClick={this.handleItemsRefused} overlay={itemRefusedmenu}>
            <Icon type="close-circle-o" /> 批量拒绝
          </Dropdown.Button>
          <Button icon="export" onClick={this.handleExportSelected} >
            批量导出
          </Button>
          <Popconfirm title={'只能删除所选项中归类来源是当前租户的数据，确认删除？'} onConfirm={() => this.handleDeleteSelected()}>
            <Button type="danger" icon="delete">
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
        if (record.contribute_tenant_id === this.props.tenantId) {
          if (record.status === TRADE_ITEM_STATUS.pending) {
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
                        <a role="presentation"><Icon type="delete" /> {this.msg('delete')}</a>
                      </Popconfirm>
                    </Menu.Item>
                  </Menu>)}
                >
                  <a><Icon type="down" /></a>
                </Dropdown>
              </span>
            );
          } else {
            return (
              <span>
                <NavLink to={`/scv/products/tradeitem/edit/${record.id}`}>
                  <Icon type="edit" /> {this.msg('modify')}
                </NavLink>
                <span className="ant-divider" />
                <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleItemDel(record.id)}>
                  <a role="presentation"><Icon type="delete" /> {this.msg('delete')}</a>
                </Popconfirm>
              </span>
            );
          }
        } else if (record.status === TRADE_ITEM_STATUS.pending) {
          return (
            <span>
              <RowUpdater onHit={this.handleItemPass} label={<span><Icon type="check-circle-o" /> {this.msg('pass')}</span>} row={record} />
              <span className="ant-divider" />
              <Popover trigger="click" content={
                <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} label={this.msg('reason')} >
                  {getFieldDecorator('reason')(<Input onPressEnter={() => this.handleItemRefused(record)} />)}
                </FormItem>
              }
              >
                <RowUpdater label={<span><Icon type="close-circle-o" /> {this.msg('refuse')}</span>} row={record} />
              </Popover>
            </span>
          );
        }
      },
    });
    const importMenu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="export"><Icon type="export" /> 导出物料表</Menu.Item>
        <Menu.Item key="model"><Icon type="download" /> 下载模板</Menu.Item>
        <Menu.Item key="exportEditable"><Icon type="export" /> 导出可编辑物料</Menu.Item>
      </Menu>);
    return (
      <Layout className="ant-layout-wrapper">
        <Layout>
          <Header className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('classification')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('productsTradeItem')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <span />
            <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} >
              <RadioButton value="unclassified"><Icon type="question-circle-o" /> {this.msg('filterUnclassified')}</RadioButton>
              <RadioButton value="pending"><Icon type="pause-circle-o" /> {this.msg('filterPending')}</RadioButton>
              <RadioButton value="classified"><Icon type="check-circle-o" /> {this.msg('filterClassified')}</RadioButton>
            </RadioGroup>
            <span />
            <RadioGroup value={listFilter.status} onChange={this.handleConflictRadio} >
              <RadioButton value="conflicted"><Icon type="exclamation-circle-o" /> {this.msg('filterConflict')}</RadioButton>
            </RadioGroup>
            <div className="page-header-tools">
              <Dropdown.Button onClick={this.handleDropdownButtonClick} overlay={importMenu}>
                <Icon type="upload" /> {this.msg('importItems')}
              </Dropdown.Button>
              <Button type="primary" icon="plus" onClick={this.handleAddItem}>
                {this.msg('addItem')}
              </Button>
              <ButtonToggle
                iconOn="setting" iconOff="setting"
                onClick={this.toggleRightSider}
              />
            </div>
          </Header>
          <Content className="main-content layout-min-width layout-min-width-large">
            <div className="page-body">
              <div className="toolbar">
                <SearchBar placeholder="编码/名称/描述/申报要素" onInputSearch={this.handleSearch} />
                <span />
                <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                  <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                  {batchOperation}
                </div>
              </div>
              <div className="panel-body table-panel table-fixed-layout">
                {this.state.listView === 'noConflict' && <RemoteTable loading={this.props.tradeItemsLoading} rowSelection={rowSelection}
                  rowKey={record => record.id} columns={columns} dataSource={this.dataSource} scroll={{ x: 3850 }}
                />}
                {this.state.listView === 'conflict' && <ConflictList />}
              </div>
              <NominatedImportModal />
              <ImportComparisonModal />
            </div>
          </Content>
        </Layout>
        <Sider
          trigger={null}
          defaultCollapsed
          collapsible
          collapsed={this.state.rightSiderCollapsed}
          width={480}
          collapsedWidth={0}
          className="right-sider"
        >
          <div className="right-sider-panel">
            <div className="panel-header">
              <h3>物料库设置</h3>
            </div>
            <Collapse accordion defaultActiveKey="slave">
              <Panel header={'从库同步'} key="slave">
                <SlaveSyncPane />
              </Panel>
              <Panel header={'授权共享'} key="share">
                <MasterSharePane />
              </Panel>
            </Collapse>
          </div>
        </Sider>
      </Layout>
    );
  }
}
