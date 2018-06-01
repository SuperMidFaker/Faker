import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Input, Button, Layout, InputNumber, Radio, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { openTransitionModal, loadTransitions, loadReducedTransitions, loadTransitionStat, splitTransit, unfreezeTransit, openBatchTransitModal, showUploadTransitModal, openBatchMoveModal, openBatchFreezeModal } from 'common/reducers/cwmTransition';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import DataTable from 'client/components/DataTable';
import RowAction from 'client/components/RowAction';
import Drawer from 'client/components/Drawer';
import Summary from 'client/components/Summary';
import PageHeader from 'client/components/PageHeader';
import { createFilename } from 'client/util/dataTransform';
import WhseSelect from '../../common/whseSelect';
import QueryForm from './queryForm';
import { commonTraceColumns } from '../commonColumns';
import BatchTransitModal from './modal/batchTransitModal';
import BatchUploadTransitModal from './modal/batchUploadTransitModal';
import TransitionModal from './modal/transitionModal';
import BatchFreezeModal from './modal/batchFreezeModal';
import TraceIdPopover from '../../common/popover/traceIdPopover';
import FreezePopover from '../../common/popover/freezePopover';
import UnfreezePopover from '../../common/popover/unfreezePopover';
import QtyChangePopover from '../../common/popover/qtyChangePopover';
import AllocatedPopover from '../../common/popover/allocatedPopover';

import { formatMsg } from '../message.i18n';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    loginName: state.account.username,
    loading: state.cwmTransition.loading,
    transitionlist: state.cwmTransition.list,
    transitionStat: state.cwmTransition.stat,
    totalReducedList: state.cwmTransition.totalReducedList,
    listFilter: state.cwmTransition.listFilter,
    sortFilter: state.cwmTransition.sortFilter,
    reload: state.cwmTransition.reloadTransitions,
  }),
  {
    openTransitionModal,
    loadTransitions,
    loadReducedTransitions,
    loadTransitionStat,
    splitTransit,
    unfreezeTransit,
    switchDefaultWhse,
    openBatchTransitModal,
    showUploadTransitModal,
    openBatchMoveModal,
    openBatchFreezeModal,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class StockTransitionList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loading: PropTypes.bool.isRequired,
    transitionlist: PropTypes.shape({ current: PropTypes.number }).isRequired,
    listFilter: PropTypes.shape({ status: PropTypes.string }).isRequired,
    sortFilter: PropTypes.shape({ field: PropTypes.string }).isRequired,
  }
  state = {
    showTableSetting: false,
    selectedRowKeys: [],
    transitionSplitNum: 0,
    unfreezeReason: '',
    allSelectedRows: [],
    scrollOffset: 368,
  }
  componentDidMount() {
    const filter = { ...this.props.listFilter, whse_code: this.props.defaultWhse.code };
    this.handleStockQuery(1, filter);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleStockQuery();
    }
  }
  msg = formatMsg(this.props.intl);
  columns = [{
    title: this.msg('owner'),
    dataIndex: 'owner_name',
    width: 150,
    sorter: true,
    fixed: 'left',
  }, {
    title: this.msg('productNo'),
    dataIndex: 'product_no',
    width: 180,
    sorter: true,
    fixed: 'left',
  }, {
    title: this.msg('descCN'),
    dataIndex: 'name',
    width: 150,
  }, {
    title: this.msg('SKUCategory'),
    dataIndex: 'sku_category',
    width: 120,
  }, {
    title: this.msg('location'),
    width: 120,
    dataIndex: 'location',
    sorter: true,
  }, {
    title: this.msg('inboundDate'),
    width: 160,
    dataIndex: 'inbound_timestamp',
    render: inbts => inbts && moment(inbts).format('YYYY.MM.DD HH:mm'),
    sorter: true,
  }, {
    title: this.msg('stockingQty'),
    width: 100,
    dataIndex: 'stocking_qty',
    className: 'text-emphasis',
  }, {
    title: this.msg('totalQty'),
    width: 100,
    dataIndex: 'stock_qty',
    className: 'cell-align-right text-emphasis',
    render: (text, record) =>
      <QtyChangePopover text={text} traceId={record.trace_id} reload={this.handleStockQuery} />,
  }, {
    title: this.msg('availQty'),
    width: 100,
    dataIndex: 'avail_qty',
    align: 'right',
    render: (text, record) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      }
      return (<FreezePopover
        traceId={record.trace_id}
        availQty={text}
        reload={this.handleStockQuery}
      />);
    },
  }, {
    title: this.msg('allocQty'),
    width: 100,
    dataIndex: 'alloc_qty',
    align: 'right',
    render: (text, record) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      }
      return <AllocatedPopover traceId={record.trace_id} text={text} />;
    },
  }, {
    title: this.msg('frozenQty'),
    width: 100,
    dataIndex: 'frozen_qty',
    align: 'right',
    render: (text, record) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      }
      return (<UnfreezePopover
        reload={this.handleStockQuery}
        traceId={record.trace_id}
        text={text}
      />);
    },
  }, {
    title: this.msg('traceId'),
    width: 200,
    dataIndex: 'trace_id',
    sorter: true,
    render: o => o && <TraceIdPopover traceId={o} />,
  }].concat(commonTraceColumns(this.props.intl)).concat({
    title: '操作',
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
    width: 110,
    fixed: 'right',
    render: (o, record) => {
      if (record.stock_qty > 0 && record.avail_qty === 0 && record.frozen_qty > 0) {
        return (<RowAction
          popover={<span>
            <Input placeholder="解冻原因" onChange={this.handleUnfreezeReason} value={this.state.unfreezeReason} style={{ width: '70%' }} />
            <Button type="primary" icon="check" style={{ marginLeft: 8 }} onClick={() => this.handleUnfreezeTransition(record)} />
          </span>}
          label="解冻"
          row={record}
          key="unfrozen"
        />);
      } else if (record.avail_qty >= 1) {
        const spans = [<RowAction onClick={this.handleTransitModal} label="调整" row={record} key="adjust" />];
        const min = 1;
        let max = record.avail_qty - 1;
        if (record.avail_qty !== record.stock_qty) {
          max = record.avail_qty;
        }
        if (min <= max) {
          spans.push(<RowAction
            popover={<span>
              <InputNumber
                placeholder="拆分数量"
                min={min}
                max={max}
                onChange={value => this.handleSplitChange(value, min, max)}
                value={this.state.transitionSplitNum}
              />
              <Button type="primary" icon="check" style={{ marginLeft: 8 }} onClick={() => this.handleSplitTransition(record)} />
            </span>}
            label="拆分"
            row={record}
            key="split"
          />);
        }
        if (spans.length === 1) {
          return spans[0];
        }
        return (<span>{spans}</span>);
      } else if (record.avail_qty === 0 && record.moving_qty > 0) {
        return <span>移库中</span>;
      }
      return null;
    },
  })
  handleWhseChange = (value) => {
    const filter = { ...this.props.listFilter, whse_code: value };
    this.handleStockQuery(1, filter);
  }
  handleUnfreezeReason = (ev) => {
    this.setState({ unfreezeReason: ev.target.value });
  }
  handleUnfreezeTransition = (row) => {
    const { loginName } = this.props;
    this.props.unfreezeTransit(
      [row.trace_id],
      { reason: this.state.unfreezeReason },
      loginName
    ).then((result) => {
      if (!result.error) {
        this.handleStockQuery();
        this.setState({ unfreezeReason: '' });
      } else {
        message.error(result.error.message);
      }
    });
  }
  handleSplitChange = (value, min, max) => {
    const splitValue = parseFloat(value);
    if (!Number.isNaN(splitValue)) {
      if (splitValue < min) {
        this.setState({ transitionSplitNum: min });
      } else if (splitValue > max) {
        this.setState({ transitionSplitNum: max });
      } else {
        this.setState({ transitionSplitNum: splitValue });
      }
    }
  }
  handleSplitTransition = (row) => {
    if (this.state.transitionSplitNum === 0) {
      message.error('请先输入拆分数量');
    } else {
      const { loginName } = this.props;
      this.props.splitTransit([row.trace_id], { split: this.state.transitionSplitNum, reason: '拆分' }, loginName).then((result) => {
        if (!result.error) {
          this.handleStockQuery();
          this.setState({ transitionSplitNum: 0 });
        } else {
          message.error(result.error.message);
        }
      });
    }
  }
  handleStockQuery = (currentPage, filter) => {
    const { sortFilter, listFilter, transitionlist: { pageSize, current } } = this.props;
    const newFilter = JSON.stringify(filter || listFilter);
    this.props.loadTransitions({
      filter: newFilter,
      sorter: JSON.stringify(sortFilter),
      pageSize,
      current: currentPage || current,
    });
    this.props.loadReducedTransitions(newFilter);
    this.props.loadTransitionStat(newFilter);
    this.handleDeselectRows();
  }
  handleBatchTransit = () => {
    this.props.openBatchTransitModal({
      traceIds: this.state.selectedRowKeys,
      detail: this.state.batchTransitDetail,
    });
  }
  handleBatchFreeze = () => {
    this.props.openBatchFreezeModal({
      freezed: true,
      traceIds: this.state.selectedRowKeys,
    });
  }
  handleBatchUnfreeze = () => {
    this.props.openBatchFreezeModal({
      freezed: false,
      traceIds: this.state.selectedRowKeys,
    });
  }
  handleStatusChange = (ev) => {
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleStockQuery(1, filter);
  }
  handleSearch = (searchForm) => {
    const filter = {
      ...this.props.listFilter,
      ...searchForm,
      whse_code: this.props.defaultWhse.code,
    };
    this.handleStockQuery(1, filter);
  }
  handleTransitModal = (row) => {
    this.props.openTransitionModal(row.trace_id);
  }
  handleDeselectRows = () => {
    this.setState({
      selectedRowKeys: [],
      allSelectedRows: [],
    });
  }
  handleExportExcel = () => {
    const { listFilter, sortFilter } = this.props;
    window.open(`${API_ROOTS.default}v1/cwm/stock/exportTransitionExcel/${createFilename('transition')}.xlsx?filters=${
      JSON.stringify(listFilter)}&sorter=${JSON.stringify(sortFilter)}`);
  }
  handleBatchUploadUpdate = () => {
    this.props.showUploadTransitModal({ visible: true, needReload: null });
  }
  handleCollapseChange = (collapsed) => {
    const scrollOffset = collapsed ? 368 : 280;
    this.setState({ scrollOffset });
  }
  toggleTableSetting = () => {
    this.setState({ showTableSetting: !this.state.showTableSetting });
  }
  handleRowSelect = (selectedRows, ownerName) => {
    let enableBatchTransit = true;
    let i = 0;
    let batchTransitDetail = {};
    while (i < selectedRows.length - 1) {
      if (selectedRows[i].owner_partner_id !== selectedRows[i + 1].owner_partner_id) {
        enableBatchTransit = false;
        break;
      } else {
        i += 1;
      }
    }
    if (selectedRows.length > 0 && enableBatchTransit) {
      batchTransitDetail = {
        owner_partner_id: selectedRows[0].owner_partner_id,
        owner_name: ownerName,
        whse_code: this.props.defaultWhse.code,
      };
    }
    const selectedRowKeys = selectedRows.map(sr => sr.trace_id);
    this.setState({
      selectedRowKeys,
      enableBatchTransit,
      batchTransitDetail,
      allSelectedRows: selectedRows,
    });
  }
  render() {
    const {
      loading, listFilter, transitionStat, transitionlist, totalReducedList,
    } = this.props;
    const { allSelectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selRows) => {
        const selectedRows = allSelectedRows.filter(asr =>
          this.props.transitionlist.data.filter(trd => trd.trace_id === asr.trace_id).length === 0)
          .concat(selRows.map(sr => ({
            trace_id: sr.trace_id,
            avail_qty: sr.avail_qty,
            owner_partner_id: sr.owner_partner_id,
          })));
        this.handleRowSelect(selectedRows, selRows.length > 0 ? selRows[0].owner_name : null);
      },
      hideDefaultSelections: true,
      getCheckboxProps: row => ({ disabled: row.avail_qty === 0 }),
    };
    if (totalReducedList.length > 0) {
      rowSelection.selections = [{
        key: 'selectall',
        text: '全部选择',
        onSelect: () => {
          this.handleRowSelect(this.props.totalReducedList, transitionlist.data[0].owner_name);
        },
      }, {
        key: 'unselectall',
        text: '取消选择',
        onSelect: () => {
          this.handleRowSelect([]);
        },
      }];
    }
    const selTotalStockQty = allSelectedRows.reduce((res, bsf) => res + (bsf.avail_qty || 0), 0);
    const rowKey = 'trace_id'; // selectedRowKeys 有影响
    const dataSource = new DataTable.DataSource({
      fetcher: (params) => { this.props.loadTransitions(params); },
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
          current: pagination.current,
          pageSize: pagination.pageSize,
          sorter: JSON.stringify({
            field: sorter.field,
            order: sorter.order === 'descend' ? 'DESC' : 'ASC',
          }),
        };
        const filter = { ...listFilter };
        Object.keys(filters).forEach((flt) => {
          if (filters[flt].length > 0) {
            [filter[flt]] = filters[flt];
          } else {
            delete filter[flt];
          }
        });
        params.filter = JSON.stringify(filter);
        return params;
      },
      remotes: transitionlist,
    });
    const toolbarActions = (<span>
      <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} >
        <RadioButton value="all">全部</RadioButton>
        <RadioButton value="normal">正常库存</RadioButton>
        <RadioButton value="frozen">冻结库存</RadioButton>
      </RadioGroup>
    </span>);
    const bulkActions = (<span>
      <span>选中项库存数量共计 {selTotalStockQty} </span>
      {listFilter.status === 'normal' && this.state.enableBatchTransit && <Button onClick={this.handleBatchTransit}>批量属性调整</Button>}
      {listFilter.status === 'normal' && <Button onClick={this.handleBatchFreeze}>批量冻结</Button>}
      {listFilter.status === 'frozen' && <Button onClick={this.handleBatchUnfreeze}>批量解冻</Button>}
    </span>);
    const totCol = (
      <Summary>
        <Summary.Item label="库存数量">{transitionStat.stock_qty || 0}</Summary.Item>
        <Summary.Item label="可用数量">{transitionStat.avail_qty || 0}</Summary.Item>
        <Summary.Item label="分配数量">{transitionStat.alloc_qty || 0}</Summary.Item>
        <Summary.Item label="冻结数量">{transitionStat.frozen_qty || 0}</Summary.Item>
        <Summary.Item label="保税数量">{transitionStat.bonded_qty || 0}</Summary.Item>
        <Summary.Item label="非保税数量">{transitionStat.nonbonded_qty || 0}</Summary.Item>
      </Summary>
    );
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            <WhseSelect onChange={this.handleWhseChange} />,
            this.msg('stockTransition'),
          ]}
        >
          <PageHeader.Actions>
            <Button icon="export" onClick={this.handleExportExcel}>
              {this.msg('export')}
            </Button>
            <Button icon="upload" onClick={this.handleBatchUploadUpdate}>
              {this.msg('transitUploadUpdate')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer top onCollapseChange={this.handleCollapseChange}>
            <QueryForm onSearch={this.handleSearch} />
          </Drawer>
          <Content className="page-content" key="main">
            <DataTable
              toolbarActions={toolbarActions}
              bulkActions={bulkActions}
              total={totCol}
              selectedRowKeys={this.state.selectedRowKeys}
              onDeselectRows={this.handleDeselectRows}
              columns={this.columns}
              rowSelection={rowSelection}
              dataSource={dataSource}
              loading={loading}
              rowKey={rowKey}
              scrollOffset={this.state.scrollOffset}
            />
            <TransitionModal />
            <BatchTransitModal />
            <BatchUploadTransitModal />
            {/* <BatchMoveModal /> */}
            <BatchFreezeModal />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
