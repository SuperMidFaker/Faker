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
import RowAction from 'client/components/RowAction';
import { getElementByHscode } from 'common/reducers/cmsHsCode';
import { showDeclElementsModal } from 'common/reducers/cmsManifest';
import { loadRepo, selectedRepoId, loadTradeItems, deleteItems, loadTradeParams, setItemStatus } from 'common/reducers/cmsTradeitem';
import SearchBar from 'client/components/SearchBar';
import { createFilename } from 'client/util/dataTransform';
import DeclElementsModal from '../../common/modal/declElementsModal';
import { TRADE_ITEM_STATUS, CMS_TRADE_REPO_PERMISSION } from 'common/constants';
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
    repoId: state.cmsTradeitem.repoId,
    listFilter: state.cmsTradeitem.listFilter,
    tradeItemlist: state.cmsTradeitem.tradeItemlist,
    repo: state.cmsTradeitem.repo,
    tradeItemsLoading: state.cmsTradeitem.tradeItemsLoading,
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
  { selectedRepoId,
    loadTradeItems,
    deleteItems,
    loadRepo,
    setItemStatus,
    getElementByHscode,
    showDeclElementsModal,
  }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
export default class RepoContent extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    tradeItemlist: PropTypes.object.isRequired,
    repoId: PropTypes.number,
    repo: PropTypes.object,
    listFilter: PropTypes.object.isRequired,
    tradeItemsLoading: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    currentPage: 1,
    searchVal: '',
  }
  componentDidMount() {
    this.props.loadRepo(this.props.params.repoId);
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
    fixed: 'left',
    render: (o, record) => {
      if (record.master_rejected) {
        return (
          <Tooltip title={record.reason}>
            <span style={{ color: 'orange' }}>{o}</span>
          </Tooltip>
        );
      } else {
        return o === record.src_product_no ? o : <span>{o}|{record.src_product_no}</span>;
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
    width: 120,
    render: (o, record) => {
      switch (record.status) {
        case TRADE_ITEM_STATUS.pending:
          if (record.master_rejected) {
            return (
              <Tooltip title={record.reason}>
                <span style={{ color: 'orange' }}>{o} <Icon type="exclamation-circle-o" className="text-warning" /></span>
              </Tooltip>
            );
          } else {
            return <span>{o} <Icon type="exclamation-circle-o" className="text-warning" /></span>;
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
    render: o => <a role="presentation">{o}</a>,
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
    width: 140,
    fixed: 'right',
    render: (o, record) => {
      if (this.props.repo.permission === CMS_TRADE_REPO_PERMISSION.edit) {
        if (this.props.listFilter.status === 'master') {
          if (this.props.repo.mode === 'slave') {
            return (
              <RowAction onClick={this.handleItemFork} icon="fork" label={this.msg('fork')} row={record} />
            );
          } else {
            return (
              <span>
                <RowAction onClick={this.handleItemEdit} icon="edit" label={this.msg('modify')} row={record} />
                <RowAction onClick={this.handleItemFork} icon="fork" tooltip={this.msg('fork')} row={record} />
              </span>
            );
          }
        } else {
          return (
            <RowAction onClick={this.handleItemDelete} icon="delete" label={this.msg('delete')} row={record} />
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
  handleItemEdit = (record) => {
    const link = `/clearance/tradeitem/repo/item/edit/${record.id}`;
    this.context.router.push(link);
  }
  handleItemFork = (record) => {
    const link = `/clearance/tradeitem/repo/item/fork/${record.id}`;
    this.context.router.push(link);
  }
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
        // this.props.loadRepos({ tenantId: this.props.tenantId });
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
    const { tradeItemlist, repo, listFilter } = this.props;
    const selectedRows = this.state.selectedRowKeys;
    const rowSelection = {
      selectedRowKeys: selectedRows,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    let bulkActions = null;
    if (repo.permission === CMS_TRADE_REPO_PERMISSION.edit && selectedRows.length > 0) {
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
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup value={listFilter.status} onChange={this.handleFilterChange} >
              <RadioButton value="master"><Icon type="check-circle-o" /> {this.msg('tradeItemMaster')}</RadioButton>
              <RadioButton value="branch"><Icon type="exclamation-circle-o" /> {this.msg('tradeItemBranch')}</RadioButton>
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
          <DeclElementsModal onOk={null} />
        </Content>
      </Layout>
    );
  }
}
