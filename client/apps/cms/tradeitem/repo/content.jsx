import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { TRADE_ITEM_STATUS, CMS_TRADE_REPO_PERMISSION } from 'common/constants';
import { getElementByHscode } from 'common/reducers/cmsHsCode';
import { showDeclElementsModal } from 'common/reducers/cmsManifest';
import { loadRepo, getLinkedSlaves, loadTradeItems, deleteItems, replicaMasterSlave, loadTradeParams } from 'common/reducers/cmsTradeitem';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, Form, Layout, Radio, Icon, Popconfirm, Popover, Select, Tooltip, message } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import SearchBar from 'client/components/SearchBar';
import { createFilename } from 'client/util/dataTransform';
import DeclElementsModal from '../../common/modal/declElementsModal';

import { formatMsg } from '../message.i18n';

const { Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    listFilter: state.cmsTradeitem.listFilter,
    tradeItemlist: state.cmsTradeitem.tradeItemlist,
    repo: state.cmsTradeitem.repo,
    tradeItemsLoading: state.cmsTradeitem.tradeItemsLoading,
    submitting: state.cmsTradeitem.submitting,
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
  {
    loadTradeParams,
    loadTradeItems,
    deleteItems,
    loadRepo,
    getLinkedSlaves,
    replicaMasterSlave,
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
    tradeItemlist: PropTypes.object.isRequired,
    repo: PropTypes.object,
    listFilter: PropTypes.object.isRequired,
    tradeItemsLoading: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    linkedSlaves: [],
    searchVal: '',
    masterReplica: {
      source: '',
      slave: null,
    },
  }
  componentDidMount() {
    this.props.loadRepo(this.props.params.repoId);
    this.props.loadTradeParams();
    this.props.loadTradeItems({
      repoId: this.props.params.repoId,
      filter: JSON.stringify(this.props.listFilter),
      pageSize: this.props.tradeItemlist.pageSize,
      currentPage: this.props.tradeItemlist.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.repo !== this.props.repo && nextProps.repo.mode === 'master') {
      this.props.getLinkedSlaves(nextProps.params.repoId).then((result) => {
        if (!result.error) {
          this.setState({ linkedSlaves: result.data });
        }
      });
    }
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
      }
      return o === record.src_product_no ? o : <span>{record.src_product_no}</span>;
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
    render: o => (o === 'FP' ? '成品' : '料件'),
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
    width: 120,
  }, {
    title: this.msg('inspQuarantine'),
    dataIndex: 'inspection_quarantine',
    width: 120,
  }, {
    title: this.msg('applCertCode'),
    dataIndex: 'appl_cert_code',
    width: 150,
  }, {
    title: this.msg('preClassifyNo'),
    dataIndex: 'pre_classify_no',
    width: 120,
  }, {
    title: this.msg('preClassifyStartDate'),
    dataIndex: 'pre_classify_start_date ',
    width: 120,
    render: (o, record) => {
      if (record.pre_classify_start_date) {
        return moment(record.pre_classify_start_date).format('YYYY-MM-DD');
      }
      return '--';
    },
  }, {
    title: this.msg('preClassifyEndDate'),
    dataIndex: 'pre_classify_end_date ',
    width: 120,
    render: (o, record) => {
      if (record.pre_classify_end_date) {
        return moment(record.pre_classify_end_date).format('YYYY-MM-DD');
      }
      return '--';
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
          }
          return (
            <span>
              <RowAction onClick={this.handleItemEdit} icon="edit" label={this.msg('modify')} row={record} />
              <RowAction onClick={this.handleItemFork} icon="fork" tooltip={this.msg('fork')} row={record} />
            </span>
          );
        }
        return (
          <RowAction onClick={this.handleItemDelete} icon="delete" label={this.msg('delete')} row={record} />
        );
      }
      return <span />;
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
  handleItemDelete = (row) => {
    this.props.deleteItems({ repoId: this.props.params.repoId, ids: [row.id] }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleItemListLoad();
      }
    });
  }
  handleItemListLoad = (currentPage, filter, search) => {
    const { listFilter, tradeItemlist: { pageSize, current, searchText } } = this.props;
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
        this.props.showDeclElementsModal(
          result.data.declared_elements,
          record.id, record.g_model,
          true,
          record.g_name
        );
      }
    });
  }
  handleDeleteSelected = () => {
    const selectedIds = this.state.selectedRowKeys;
    this.props.deleteItems({
      repoId: this.props.params.repoId,
      ids: selectedIds,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
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
    this.setState({ searchVal: value });
    this.handleItemListLoad(1, null, value);
  }
  handleExportSelected = () => {
    const selectedIds = this.state.selectedRowKeys;
    window.open(`${API_ROOTS.default}v1/cms/tradeitems/selected/export/${createFilename('selectedItemsExport')}.xlsx?selectedIds=${selectedIds}`);
  }
  handleReplicaSource = (ev) => {
    const masterReplica = { ...this.state.masterReplica };
    masterReplica.source = ev.target.value;
    this.setState({ masterReplica });
  }
  handleReplicaSlave = (slave) => {
    const masterReplica = { ...this.state.masterReplica };
    masterReplica.slave = slave;
    this.setState({ masterReplica });
  }
  handleMasterSlaveReplica = () => {
    this.props.replicaMasterSlave({
      masterRepo: this.props.params.repoId,
      slaveRepo: this.state.masterReplica.slave,
      source: this.state.masterReplica.source,
    }).then((result) => {
      if (!result.error) {
        if (this.state.masterReplica.source === 'slave') {
          message.info('同步任务已创建', 10);
        } else if (this.state.masterReplica.source === 'master') {
          message.info('主库已开始向从库同步物料归类', 10);
        }
      }
    });
  }
  render() {
    const {
      tradeItemlist, repo, listFilter, submitting, tenantId,
    } = this.props;
    const { linkedSlaves, searchVal } = this.state;
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
        <Popconfirm title="是否删除所有选择项？" onConfirm={() => this.handleDeleteSelected()}>
          <Button type="danger" icon="delete">
              批量删除
          </Button>
        </Popconfirm></span>);
    }
    this.dataSource.remotes = tradeItemlist;
    const toolbarActions = (<SearchBar placeholder="编码/名称/描述/申报要素" onInputSearch={this.handleSearch} value={searchVal} />);
    let repoName = repo.owner_name;
    if (tenantId === repo.owner_tenant_id) {
      repoName = repo.creator_name;
    }
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {repoName}
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
            { repo.mode === 'master' &&
            <Popover
              placement="left"
              title="选择从库与同步方式"
              content={<Form>
                <FormItem label="从库">
                  <Select
                    allowClear
                    showSearch
                    onChange={this.handleReplicaSlave}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                  >{linkedSlaves.map(slv =>
                    <Option key={slv.creator_name} value={String(slv.id)}>{slv.creator_name}</Option>)}
                  </Select>
                </FormItem>
                <FormItem label="同步源">
                  <RadioGroup onChange={this.handleReplicaSource} value={listFilter.status}>
                    <RadioButton value="master">主库</RadioButton>
                    <RadioButton value="slave">从库</RadioButton>
                  </RadioGroup>
                </FormItem>
                <Button type="primary" onClick={this.handleMasterSlaveReplica}>确定</Button>
              </Form>}
              trigger="click"
            >
              <Button type="primary" loading={submitting}>同步数据</Button>
            </Popover>
            }
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <DataTable
            toolbarActions={toolbarActions}
            bulkActions={bulkActions}
            rowSelection={rowSelection}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeselectRows={this.handleDeselectRows}
            loading={this.props.tradeItemsLoading}
            rowKey="id"
            columns={this.columns}
            dataSource={this.dataSource}
            bordered
          />
          <DeclElementsModal onOk={null} />
        </Content>
      </Layout>
    );
  }
}
