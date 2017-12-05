import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, Layout, Radio, Dropdown, Icon, Menu, Popconfirm, Tooltip, message } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import NavLink from 'client/components/NavLink';
import { loadCustomers } from 'common/reducers/crmCustomers';
import { loadRepos, openAddModal, selectedRepoId, loadTradeItems, setCompareVisible,
  deleteItems, setRepo, deleteRepo, loadTradeParams, setItemStatus, upgradeMode, setDatasShare, copyToStage } from 'common/reducers/cmsTradeitem';
import { getAuditWay } from 'common/reducers/scvClassification';
import SearchBar from 'client/components/SearchBar';
import ExcelUploader from 'client/components/ExcelUploader';
import { createFilename } from 'client/util/dataTransform';
import ImportItemModal from './modal/importItemModal';
import { TRADE_ITEM_STATUS, CMS_TRADE_REPO_PERMISSION, SYNC_AUDIT_METHODS } from 'common/constants';
import RowUpdater from 'client/components/rowUpdater';
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
  }, {
    title: this.msg('srcProductNo'),
    dataIndex: 'src_product_no',
    width: 200,
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
    title: this.msg('enName'),
    dataIndex: 'en_name',
    width: 200,
  }, {
    title: this.msg('gModel'),
    dataIndex: 'g_model',
    width: 400,
  }, {
    title: this.msg('element'),
    dataIndex: 'element',
    width: 400,
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
        if (record.status === TRADE_ITEM_STATUS.unclassified) {
          return (<span>
            <NavLink to={`/clearance/tradeitem/repo/item/edit/${record.id}`}>
              <Icon type="edit" /> {this.msg('modify')}
            </NavLink>
            <span className="ant-divider" />
            <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleItemDel(record.id)}>
              <a role="presentation"><Icon type="delete" /></a>
            </Popconfirm>
          </span>);
        } else if (record.status === TRADE_ITEM_STATUS.pending) {
          if (this.props.auditWay === SYNC_AUDIT_METHODS[1].key) {
            const options = record.master_rejected ?
              (<span>
                <NavLink to={`/clearance/tradeitem/repo/item/edit/${record.id}`}>
                  <Icon type="edit" /> {this.msg('modify')}
                </NavLink>
                <span className="ant-divider" />
                <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleItemDel(record.id)}>
                  <a role="presentation"><Icon type="delete" /></a>
                </Popconfirm>
              </span>)
              : '';
            return (
              <span>
                {options}
              </span>
            );
          } else {
            return (
              <span>
                <RowUpdater onHit={this.handleItemPass} label={<span><Icon type="check-circle-o" /> {this.msg('pass')}</span>} row={record} />
                <span className="ant-divider" />
                <RowUpdater onHit={this.handleItemRefused} label={<span><Icon type="close-circle-o" /> {this.msg('refuse')}</span>} row={record} />
                <span className="ant-divider" />
                <Dropdown overlay={(
                  <Menu>
                    <Menu.Item key="edit">
                      <NavLink to={`/clearance/tradeitem/repo/item/edit/${record.id}`}>
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
          }
        } else if (record.status === TRADE_ITEM_STATUS.classified && record.created_tenant_id === this.props.tenantId) {
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
  handleItemDel = (id) => {
    const { repoId } = this.props;
    this.props.deleteItems({ repoId, ids: [id] }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadRepos({ tenantId: this.props.tenantId });
        this.handleItemListLoad();
      }
    });
  }
  handleAuditWay = (masterTenantId) => {
    const { tenantId } = this.props;
    this.props.getAuditWay(
      tenantId,
      masterTenantId
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleRowClick = (record) => {
    const repo = record;
    this.props.selectedRepoId(repo.id);
    this.handleItemListLoad(repo.id, 1, this.props.listFilter, this.state.searchVal);
    this.handleAuditWay(repo.owner_tenant_id);
    this.props.setRepo(repo);
    this.setState({ protected: repo.protected });
  }


  handleAddItem = () => {
    this.context.router.push('/clearance/tradeitem/repo/item/add');
  }
  handleMenuClick = (e) => {
    if (e.key === 'export') {
      window.open(`${API_ROOTS.default}v1/cms/cmsTradeitem/tradeitems/export/${createFilename('itemsExport')}.xlsx?repoId=${this.props.repoId}`);
    } else if (e.key === 'model') {
      window.open(`${API_ROOTS.default}v1/cms/cmsTradeitem/tradeitems/model/download/${createFilename('tradeItemModel')}.xlsx`);
    } else if (e.key === 'exportEditable') {
      window.open(`${API_ROOTS.default}v1/cms/cmsTradeitem/edited/tradeitems/export/${createFilename('editedCmsItems')}.xlsx?repoId=${this.props.repoId}&tenantId=${this.props.tenantId}`);
    }
  }
  handleHsMenuClick = (e) => {
    if (e.key === 'expDeclChange') {
      window.open(`${API_ROOTS.default}v1/cms/cmsTradeitem/declhscode/changed/tradeitems/export/${createFilename('declChangedCmsItems')}.xlsx?repoId=${this.props.repoId}&tenantId=${this.props.tenantId}`);
    }
  }
  handleUploaded = (data) => {
    this.setState({ compareduuid: data });
    this.props.setCompareVisible(true);
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
  handleDeleteRepo = () => {
    this.props.deleteRepo(this.props.repoId).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadRepos({ tenantId: this.props.tenantId });
      }
    });
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
  handleSetItemStatus = (repoId, ids, status) => {
    this.props.setItemStatus({ repoId, ids, status }).then((result) => {
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
        this.props.loadRepos({ tenantId: this.props.tenantId });
        this.handleItemListLoad();
      }
    });
  }
  handleItemPass = (row) => {
    this.handleSetItemStatus(this.props.repoId, [row.id], TRADE_ITEM_STATUS.classified);
  }
  handleItemRefused = (row) => {
    this.handleSetItemStatus(this.props.repoId, [row.id], TRADE_ITEM_STATUS.unclassified);
  }
  handleItemsPass = () => {
    this.handleSetItemStatus(this.props.repoId, this.state.selectedRowKeys, TRADE_ITEM_STATUS.classified);
  }
  handleItemsRefused = () => {
    this.handleSetItemStatus(this.props.repoId, this.state.selectedRowKeys, TRADE_ITEM_STATUS.unclassified);
  }
  handlePassMenuClick = (e) => {
    if (e.key === 'allPass') {
      this.handleSetItemStatus(this.props.repoId, ['all'], TRADE_ITEM_STATUS.classified);
    }
  }
  handleRefuseMenuClick = (e) => {
    if (e.key === 'allRefuse') {
      this.handleSetItemStatus(this.props.repoId, ['all'], TRADE_ITEM_STATUS.unclassified);
    }
  }
  handleSearch = (value) => {
    const { repoId, listFilter } = this.props;
    this.setState({ searchVal: value });
    this.handleItemListLoad(repoId, 1, listFilter, value);
  }
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  handleRepoSearch = (value) => {
    let repos = this.props.repos;
    if (value) {
      repos = this.props.repos.filter((item) => {
        const reg = new RegExp(value);
        return reg.test(item.owner_name);
      });
    }
    this.setState({ repos, currentPage: 1 });
  }
  handleUpgrade = (row) => {
    this.props.upgradeMode(row).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadRepos({ tenantId: this.props.tenantId });
      }
    });
  }
  handleShare = () => {
    this.props.setDatasShare({ id: this.props.repo.id, protected: !this.state.protected });
    this.setState({ protected: !this.state.protected });
  }
  handleCopyToStage = (row) => {
    const { tenantId, loginId, loginName } = this.props;
    this.props.copyToStage({ ...row, created_tenant_id: tenantId, stage: true, modify_id: loginId, modify_name: loginName }).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 5);
        } else if (result.data === 'exist') {
          message.error('自留区已存在该货号', 3);
        } else {
          message.success('复制完成');
        }
      });
  }
  handleExportSelected = () => {
    const selectedIds = this.state.selectedRowKeys;
    window.open(`${API_ROOTS.default}v1/cms/tradeitems/selected/export/${createFilename('selectedItemsExport')}.xlsx?selectedIds=${selectedIds}`);
  }
  render() {
    const { tradeItemlist, repo, listFilter, tenantId, auditWay } = this.props;
    const selectedRows = this.state.selectedRowKeys;
    const rowSelection = {
      selectedRowKeys: selectedRows,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
      getCheckboxProps: record => ({ disabled: (auditWay === SYNC_AUDIT_METHODS[1].key && !record.master_rejected && listFilter.status !== 'unclassified') }),
    };
    const itemPassmenu = (
      <Menu onClick={this.handlePassMenuClick}>
        <Menu.Item key="allPass"><Icon type="check-circle-o" /> 全部通过</Menu.Item>
      </Menu>);
    const itemRefusedmenu = (
      <Menu onClick={this.handleRefuseMenuClick}>
        <Menu.Item key="allRefuse"><Icon type="close-circle-o" /> 全部拒绝</Menu.Item>
      </Menu>);
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
      } else if (listFilter.status === 'pending' && auditWay === SYNC_AUDIT_METHODS[0].key) {
        bulkActions = (<span>
          <Dropdown.Button onClick={this.handleItemsPass} overlay={itemPassmenu}>
            <Icon type="check-circle-o" /> 批量通过
          </Dropdown.Button>
          <Dropdown.Button onClick={this.handleItemsRefused} overlay={itemRefusedmenu}>
            <Icon type="close-circle-o" /> 批量拒绝
          </Dropdown.Button>
          <Button icon="export" onClick={this.handleExportSelected} >
            批量导出
          </Button>
          <Popconfirm title={'是否删除所有选择项？'} onConfirm={() => this.handleDeleteSelected()}>
            <Button type="danger" icon="delete">
              批量删除
            </Button>
          </Popconfirm>
        </span>);
      }
    }
    this.dataSource.remotes = tradeItemlist;
    const importMenu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="export"><Icon type="export" /> 导出物料表</Menu.Item>
        <Menu.Item key="model"><Icon type="download" /> 下载模板</Menu.Item>
        <Menu.Item key="exportEditable"><Icon type="export" /> 导出可编辑物料</Menu.Item>
      </Menu>);
    const imptHsMenu = (
      <Menu onClick={this.handleHsMenuClick}>
        <Menu.Item key="expDeclChange"><Icon type="export" /> 导出税则改变物料</Menu.Item>
      </Menu>);
    const toolbarActions = (<SearchBar placeholder="编码/名称/描述/申报要素" onInputSearch={this.handleSearch} />);
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('classification')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('tradeItemMaster')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {`${repo.owner_name}`}
              </Breadcrumb.Item>
              </Breadcrumb>
            }
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup value={listFilter.status} onChange={this.handleFilterChange} >
              <RadioButton value="classified"><Icon type="check-circle-o" /> {this.msg('filterClassified')}</RadioButton>
            </RadioGroup>
            <span />
            <RadioGroup value={listFilter.status} onChange={this.handleFilterChange} >
              <RadioButton value="unclassified"><Icon type="question-circle-o" /> {this.msg('filterUnclassified')}</RadioButton>
              <RadioButton value="pending"><Icon type="pause-circle-o" /> {this.msg('filterPending')}</RadioButton>
              <RadioButton value="stage"><Tooltip title={this.msg('stageClassified')} placement="bottom"><Icon type="fork" /></Tooltip></RadioButton>
              <RadioButton value="uselessHs"><Tooltip title="税则改变归类区" placement="bottom"><Icon type="disconnect" /></Tooltip></RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            {repo.permission === CMS_TRADE_REPO_PERMISSION.edit &&
                listFilter.status !== 'uselessHs' &&
                <ExcelUploader endpoint={`${API_ROOTS.default}v1/cms/cmsTradeitem/tradeitems/import`}
                  formData={{
                    data: JSON.stringify({
                      repo_id: this.props.repoId,
                      tenantId,
                    }),
                  }} onUploaded={this.handleUploaded}
                >
                  <Dropdown.Button overlay={importMenu}>
                    <Icon type="upload" /> {this.msg('importItems')}
                  </Dropdown.Button>
                </ExcelUploader>
              }
            { repo.permission === CMS_TRADE_REPO_PERMISSION.edit &&
                listFilter.status === 'uselessHs' &&
                <ExcelUploader endpoint={`${API_ROOTS.default}v1/cms/cmsTradeitem/tradeitems/newHscode/import`}
                  formData={{
                    data: JSON.stringify({
                      repo_id: this.props.repoId,
                      tenantId,
                    }),
                  }} onUploaded={this.handleNewhsUploaded}
                >
                  <Dropdown.Button overlay={imptHsMenu}>
                    <Icon type="upload" /> {this.msg('imptNewHsItems')}
                  </Dropdown.Button>
                </ExcelUploader>
              }
            {repo.permission === CMS_TRADE_REPO_PERMISSION.edit &&
            <Button type="primary" icon="plus" onClick={this.handleAddItem}>
              {this.msg('addItem')}
            </Button>
              }
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <DataTable toolbarActions={toolbarActions} bulkActions={bulkActions}
            rowSelection={rowSelection} selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
            loading={this.props.tradeItemsLoading} rowKey="id" columns={this.columns} dataSource={this.dataSource} bordered
          />
          <ImportItemModal data={this.state.compareduuid} />
        </Content>
      </Layout>
    );
  }
}
