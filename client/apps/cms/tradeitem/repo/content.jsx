import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, Layout, Radio, Icon, Popconfirm, Tooltip, message } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import NavLink from 'client/components/NavLink';
import { loadCustomers } from 'common/reducers/crmCustomers';
import { getElementByHscode } from 'common/reducers/cmsHsCode';
import { showDeclElementsModal } from 'common/reducers/cmsManifest';
import { loadRepos, openAddModal, selectedRepoId, loadTradeItems, setCompareVisible,
  deleteItems, setRepo, deleteRepo, loadTradeParams, setItemStatus, upgradeMode, setDatasShare, copyToStage } from 'common/reducers/cmsTradeitem';
import { getAuditWay } from 'common/reducers/scvClassification';
import SearchBar from 'client/components/SearchBar';
import { createFilename } from 'client/util/dataTransform';
import ImportItemModal from './modal/importItemModal';
import DeclElementsModal from '../../common/modal/declElementsModal';
import { TRADE_ITEM_STATUS, CMS_TRADE_REPO_PERMISSION, SYNC_AUDIT_METHODS } from 'common/constants';
// import RowUpdater from 'client/components/rowUpdater';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ dispatch }) {
  const promises = [];
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
    repos: state.cmsTradeitem.repos,
    repoId: state.cmsTradeitem.repoId,
    listFilter: state.cmsTradeitem.listFilter,
    tradeItemlist: state.cmsTradeitem.tradeItemlist,
    visibleAddModal: state.cmsTradeitem.visibleAddModal,
    repo: state.cmsTradeitem.repo,
    reposLoading: state.cmsTradeitem.reposLoading,
    tradeItemsLoading: state.cmsTradeitem.tradeItemsLoading,
    auditWay: state.scvClassification.auditWay,
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
  { loadCustomers,
    openAddModal,
    selectedRepoId,
    loadTradeItems,
    setCompareVisible,
    deleteItems,
    setRepo,
    loadRepos,
    deleteRepo,
    setItemStatus,
    getAuditWay,
    upgradeMode,
    setDatasShare,
    getElementByHscode,
    showDeclElementsModal,
    copyToStage }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
export default class RepoContent extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    repos: PropTypes.array.isRequired,
    tradeItemlist: PropTypes.object.isRequired,
    repoId: PropTypes.number,
    visibleAddModal: PropTypes.bool,
    repo: PropTypes.object,
    listFilter: PropTypes.object.isRequired,
    reposLoading: PropTypes.bool.isRequired,
    tradeItemsLoading: PropTypes.bool.isRequired,
    auditWay: PropTypes.string,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    collapsed: false,
    rightSiderCollapsed: true,
    selectedRowKeys: [],
    compareduuid: '',
    currentPage: 1,
    protected: 1,
    searchVal: '',
  }
  componentDidMount() {
    this.props.selectedRepoId(this.props.params.repoId);
    this.props.loadTradeItems({
      repoId: this.props.params.repoId,
      filter: JSON.stringify(this.props.listFilter),
      pageSize: 20,
      currentPage: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('copProductNo'),
    dataIndex: 'cop_product_no',
    width: 150,
    render: (o, record) => {
      if (record.master_rejected) {
        return (
          <Tooltip title={record.reason}>
            <span style={{ color: 'orange' }}>{o}</span>
          </Tooltip>
        );
      } else {
        return o;
      }
    },
  /*
  }, {
    title: this.msg('srcProductNo'),
    dataIndex: 'src_product_no',
    width: 200,
  */
  }, {
    title: this.msg('itemType'),
    dataIndex: 'item_type',
    width: 60,
    render: o => o === 'FP' ? '成品' : '料件',
  }, {
    title: this.msg('enName'),
    dataIndex: 'en_name',
    width: 200,
  }, {
    title: this.msg('copUOM'),
    dataIndex: 'cop_uom',
    width: 120,
  }, {
    title: this.msg('hscode'),
    dataIndex: 'hscode',
    width: 150,
    render: (o, record) => {
      switch (record.status) {
        case TRADE_ITEM_STATUS.pending:
          if (record.master_rejected) {
            return (
              <Tooltip title={record.reason}>
                <span style={{ color: 'orange' }}>{o} <Icon type="pause-circle-o" className="text-warning" /></span>
              </Tooltip>
            );
          } else {
            return <span>{o} <Icon type="pause-circle-o" className="text-warning" /></span>;
          }
        case TRADE_ITEM_STATUS.classified:
          return <span>{o} <Icon type="check-circle-o" className="text-success" /></span>;
        default:
          return o;
      }
    },
  }, {
    title: this.msg('gName'),
    dataIndex: 'g_name',
    width: 200,
  }, {
    title: this.msg('gModel'),
    dataIndex: 'g_model',
    width: 400,
    onCellClick: record => record.cop_product_no && this.handleShowDeclElementModal(record),
  }, {
    title: this.msg('gUnit1'),
    dataIndex: 'g_unit_1',
    width: 100,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('gUnit2'),
    dataIndex: 'g_unit_2',
    width: 100,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('gUnit3'),
    dataIndex: 'g_unit_3',
    width: 100,
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
    title: this.msg('customsControl'),
    dataIndex: 'customs_control',
    width: 140,
  }, {
    title: this.msg('inspQuarantine'),
    dataIndex: 'inspection_quarantine',
    width: 140,
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
    width: 180,
  }, {
    title: this.msg('opColumn'),
    dataIndex: 'OPS_COL',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (this.props.repo.permission === CMS_TRADE_REPO_PERMISSION.edit) {
        if (record.status === TRADE_ITEM_STATUS.classified && record.created_tenant_id === this.props.tenantId) {
          return (
            <span>
              <NavLink to={`/clearance/tradeitem/repo/item/edit/${record.id}`}>
                <Icon type="edit" /> {this.msg('modify')}
              </NavLink>
              <span className="ant-divider" />
              <NavLink to={`/clearance/tradeitem/repo/item/fork/${record.id}`}>
                <Tooltip title={this.msg('addNewSrc')} placement="bottom"><Icon type="file-add" /></Tooltip>
              </NavLink>
            </span>
          );
        } else if (record.status === TRADE_ITEM_STATUS.classified && record.created_tenant_id !== this.props.tenantId) {
          return (
            <NavLink to={`/clearance/tradeitem/repo/item/fork/${record.id}`}>
              <Tooltip title={this.msg('addNewSrc')} placement="bottom"><Icon type="file-add" /></Tooltip>
            </NavLink>
          );
        }
      }
    },
  }]
  dataSource = new DataTable.DataSource({
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
        repoId: this.props.params.repoId,
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
    const { listFilter, tradeItemlist: { pageSize, current, searchText } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadTradeItems({
      repoId: this.props.params.repoId,
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
  handleShowDeclElementModal = (record) => {
    this.props.getElementByHscode(record.hscode).then((result) => {
      if (!result.error) {
        this.props.showDeclElementsModal(result.data.declared_elements, record.id, record.g_model, true, record.g_name);
      }
    });
  }
  handleNewhsUploaded = () => {
    const filter = { ...this.props.listFilter, status: 'uselessHs' };
    this.handleItemListLoad(this.props.repoId, 1, filter);
  }
  handleDeleteSelected = () => {
    const selectedIds = this.state.selectedRowKeys;
    this.props.deleteItems({ repoId: this.props.repoId, ids: selectedIds }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadRepos({ tenantId: this.props.tenantId });
        this.handleItemListLoad();
      }
    });
    this.setState({ selectedRowKeys: [] });
  }
  handleFilterChange = (ev) => {
    this.setState({ selectedRowKeys: [] });
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleItemListLoad(1, filter);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleSearch = (value) => {
    const { repoId, listFilter } = this.props;
    this.setState({ searchVal: value });
    this.handleItemListLoad(repoId, 1, listFilter, value);
  }
  handleExportSelected = () => {
    const selectedIds = this.state.selectedRowKeys;
    window.open(`${API_ROOTS.default}v1/cms/tradeitems/selected/export/${createFilename('selectedItemsExport')}.xlsx?selectedIds=${selectedIds}`);
  }
  render() {
    const { tradeItemlist, repo, listFilter, auditWay } = this.props;
    const selectedRows = this.state.selectedRowKeys;
    const rowSelection = {
      selectedRowKeys: selectedRows,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
      getCheckboxProps: record => ({ disabled: (auditWay === SYNC_AUDIT_METHODS[1].key && !record.master_rejected && listFilter.status !== 'unclassified') }),
    };
    let bulkActions = null;
    if (repo.permission === CMS_TRADE_REPO_PERMISSION.edit && selectedRows.length > 0) {
      if (listFilter.status === 'unclassified' ||
        (listFilter.status === 'pending' && auditWay === SYNC_AUDIT_METHODS[1].key)) {
        bulkActions = (<span>
          <Button icon="export" onClick={this.handleExportSelected} >
            批量导出
          </Button>
          <Popconfirm title={'是否删除所有选择项？'} onConfirm={() => this.handleDeleteSelected()}>
            <Button type="danger" icon="delete">
              批量删除
            </Button>
          </Popconfirm></span>);
      }
    }
    this.dataSource.remotes = tradeItemlist;
    const toolbarActions = (<SearchBar placeholder="编码/名称/描述/申报要素" onInputSearch={this.handleSearch} />);
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {`${repo.owner_name}`}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('tradeItemMaster')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup value={listFilter.status} onChange={this.handleFilterChange} >
              <RadioButton value="classified"><Icon type="check-circle-o" /> {this.msg('filterClassified')}</RadioButton>
            </RadioGroup>
            <span />
            <RadioGroup value={listFilter.status} onChange={this.handleFilterChange} >
              <RadioButton value="stage"><Tooltip title={this.msg('stageClassified')} placement="bottom"><Icon type="fork" /></Tooltip></RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            {
              repo.mode === 'master' && <Button type="primary">同步数据</Button>
            }
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <DataTable toolbarActions={toolbarActions} bulkActions={bulkActions}
            rowSelection={rowSelection} selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
            loading={this.props.tradeItemsLoading} rowKey="id" columns={this.columns} dataSource={this.dataSource} bordered
          />
          <ImportItemModal data={this.state.compareduuid} />
          <DeclElementsModal onOk={null} />
        </Content>
      </Layout>
    );
  }
}
