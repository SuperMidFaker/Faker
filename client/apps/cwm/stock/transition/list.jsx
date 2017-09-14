import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Input, Breadcrumb, Button, Card, Checkbox, Select, Layout, Popover, InputNumber, Radio, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { openTransitionModal, loadTransitions, splitTransit, unfreezeTransit,
  openBatchTransitModal, openBatchMoveModal, openBatchFreezeModal } from 'common/reducers/cwmTransition';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import DataTable from 'client/components/DataTable';
import RowUpdater from 'client/components/rowUpdater';
import TrimSpan from 'client/components/trimSpan';
import QueryForm from './queryForm';
import { commonTraceColumns } from '../commonColumns';
import BatchTransitModal from './modal/batchTransitModal';
import TransitionModal from './modal/transitionModal';
import BatchFreezeModal from './modal/batchFreezeModal';
import TraceIdPopover from '../../common/popover/traceIdPopover';
import FreezePopover from '../../common/popover/freezePopover';
import UnfreezePopover from '../../common/popover/unfreezePopover';
import QtyChangePopover from '../../common/popover/qtyChangePopover';
import AllocatedPopover from '../../common/popover/allocatedPopover';
import PageHeader from 'client/components/PageHeader';
import { createFilename } from 'client/util/dataTransform';
import { formatMsg } from '../message.i18n';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Content } = Layout;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    loading: state.cwmTransition.loading,
    transitionlist: state.cwmTransition.list,
    listFilter: state.cwmTransition.listFilter,
    sortFilter: state.cwmTransition.sortFilter,
    reload: state.cwmTransition.reloadTransitions,
  }),
  { openTransitionModal,
    loadTransitions,
    splitTransit,
    unfreezeTransit,
    switchDefaultWhse,
    openBatchTransitModal,
    openBatchMoveModal,
    openBatchFreezeModal }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class StockTransitionList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    transitionlist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    sortFilter: PropTypes.object.isRequired,
  }
  state = {
    showTableSetting: false,
    selectedRowKeys: [],
    transitionSplitNum: 0,
    unfreezeReason: '',
    totalQty: 0,
    allSelectedRows: [],
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
    render: o => <TrimSpan text={o} maxLen={8} />,
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
    render: o => <TrimSpan text={o} maxLen={10} />,
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
    title: this.msg('totalQty'),
    width: 100,
    dataIndex: 'stock_qty',
    className: 'cell-align-right text-emphasis',
    render: (text, record) => <QtyChangePopover text={text} traceId={record.trace_id} reload={this.handleStockQuery} />,
  }, {
    title: this.msg('availQty'),
    width: 100,
    dataIndex: 'avail_qty',
    className: 'cell-align-right',
    render: (text, record) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      } else {
        return <FreezePopover traceId={record.trace_id} text={text} reload={this.handleStockQuery} />;
      }
    },
  }, {
    title: this.msg('allocQty'),
    width: 100,
    dataIndex: 'alloc_qty',
    className: 'cell-align-right',
    render: (text, record) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      } else {
        return <AllocatedPopover traceId={record.trace_id} text={text} />;
      }
    },
  }, {
    title: this.msg('frozenQty'),
    width: 100,
    dataIndex: 'frozen_qty',
    className: 'cell-align-right',
    render: (text, record) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      } else {
        return <UnfreezePopover reload={this.handleStockQuery} traceId={record.trace_id} text={text} />;
      }
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
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.avail_qty === 0 && record.frozen_qty > 0) {
        return (<Popover placement="left" title="解冻原因" content={<span>
          <Input onChange={this.handleUnfreezeReason} value={this.state.unfreezeReason} style={{ width: '70%' }} />
          <Button type="primary" icon="check" style={{ marginLeft: 8 }} onClick={() => this.handleUnfreezeTransition(record)} />
        </span>} trigger="click"
        >
          <a>解冻</a>
        </Popover>);
      } else if (record.avail_qty === 1) {
        return <RowUpdater onHit={this.handleTransitModal} label="调整" row={record} />;
      } else if (record.avail_qty > 1) {
        const min = 1;
        const max = record.avail_qty - 1;
        return (<span>
          <RowUpdater onHit={this.handleTransitModal} label="调整" row={record} />
          <span className="ant-divider" />
          <Popover placement="left" title="拆分数量" content={<span>
            <InputNumber min={min} max={max} onChange={value => this.handleSplitChange(value, min, max)}
              value={this.state.transitionSplitNum}
            />
            <Button type="primary" icon="check" style={{ marginLeft: 8 }} onClick={() => this.handleSplitTransition(record)} />
          </span>} trigger="click"
          >
            <a>拆分</a>
          </Popover>
        </span>);
      } else if (record.avail_qty === 0 && record.moving_qty > 0) {
        return <span>移库中</span>;
      }
    },
  })
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    const filter = { ...this.props.listFilter, whse_code: value };
    this.handleStockQuery(1, filter);
  }
  handleUnfreezeReason = (ev) => {
    this.setState({ unfreezeReason: ev.target.value });
  }
  handleUnfreezeTransition = (row) => {
    const { loginName, tenantId } = this.props;
    this.props.unfreezeTransit([row.trace_id], { reason: this.state.unfreezeReason }, loginName, tenantId).then((result) => {
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
    if (!isNaN(splitValue)) {
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
      const { loginName, tenantId } = this.props;
      this.props.splitTransit([row.trace_id], { split: this.state.transitionSplitNum, reason: '拆分' }, loginName, tenantId).then((result) => {
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
    const { tenantId, sortFilter, listFilter, transitionlist: { pageSize, current } } = this.props;
    this.props.loadTransitions({
      tenantId,
      filter: JSON.stringify(filter || listFilter),
      sorter: JSON.stringify(sortFilter),
      pageSize,
      current: currentPage || current,
    });
    this.handleDeselectRows();
  }
  handleBatchTransit = () => {
    this.props.openBatchTransitModal({
      traceIds: this.state.selectedRowKeys,
      detail: this.state.batchTransitDetail,
    });
    this.handleDeselectRows();
  }
  handleBatchFreeze = () => {
    this.props.openBatchFreezeModal({
      freezed: true,
      traceIds: this.state.selectedRowKeys,
    });
    this.handleDeselectRows();
  }
  handleBatchUnfreeze = () => {
    this.props.openBatchFreezeModal({
      freezed: false,
      traceIds: this.state.selectedRowKeys,
    });
    this.handleDeselectRows();
  }
  handleStatusChange = (ev) => {
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleStockQuery(1, filter);
  }
  handleSearch = (searchForm) => {
    const filter = { ...this.props.listFilter, ...searchForm, whse_code: this.props.defaultWhse.code };
    this.handleStockQuery(1, filter);
  }
  handleTransitModal = (row) => {
    this.props.openTransitionModal(row.trace_id);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [], totalQty: 0, allSelectedRows: [] });
  }
  handleExportExcel = () => {
    const { tenantId, listFilter, sortFilter } = this.props;
    window.open(`${API_ROOTS.default}v1/cwm/stock/exportTransitionExcel/${createFilename('transition')}.xlsx?tenantId=${tenantId}&filters=${
      JSON.stringify(listFilter)}&sorter=${JSON.stringify(sortFilter)}`);
  }
  toggleTableSetting = () => {
    this.setState({ showTableSetting: !this.state.showTableSetting });
  }
  renderDisplayColumns() {
    return <Checkbox>Checkbox</Checkbox>;
  }
  render() {
    const { defaultWhse, whses, loading, listFilter } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selRows) => {
        const allSelectedRows = this.state.allSelectedRows;
        allSelectedRows[this.props.transitionlist.current] = selRows;
        let selectedRows = [];
        for (let j = 1; j < allSelectedRows.length; j++) {
          const rows = allSelectedRows[j];
          if (rows) {
            selectedRows = selectedRows.concat(rows);
          }
        }
        const total = selectedRows.reduce((res, bsf) => ({
          stock_qty: (res.stock_qty || 0) + (bsf.stock_qty || 0),
        }), {
          stock_qty: 0,
        });
        let enableBatchTransit = true;
        let i = 0;
        let batchTransitDetail = {};
        while (i < selectedRows.length - 1) {
          if (selectedRows[i].owner_partner_id !== selectedRows[i + 1].owner_partner_id) {
            enableBatchTransit = false;
            break;
          } else {
            i++;
          }
        }
        if (selectedRows.length > 0 && enableBatchTransit) {
          batchTransitDetail = { owner_partner_id: selectedRows[0].owner_partner_id,
            owner_name: selectedRows[0].owner_name,
            whse_code: selectedRows[0].whse_code,
          };
        }
        this.setState({ selectedRowKeys, enableBatchTransit, batchTransitDetail, totalQty: total.stock_qty, allSelectedRows });
      },
    };
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
          tenantId: this.props.tenantId,
          current: pagination.current,
          pageSize: pagination.pageSize,
          filter: JSON.stringify(listFilter),
          sorter: JSON.stringify({
            field: sorter.field,
            order: sorter.order === 'descend' ? 'DESC' : 'ASC',
          }),
        };
        return params;
      },
      remotes: this.props.transitionlist,
    });
    const toolbarActions = (<span />);
    const bulkActions = (<span>
      <h3>选中项库存数量共计 {this.state.totalQty} </h3>
      {listFilter.status === 'normal' && this.state.enableBatchTransit && <Button onClick={this.handleBatchTransit}>批量转移</Button>}
      {listFilter.status === 'normal' && <Button onClick={this.handleBatchFreeze}>批量冻结</Button>}
      {listFilter.status === 'frozen' && <Button onClick={this.handleBatchUnfreeze}>批量解冻</Button>}
    </span>);
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                  {whses.map(warehouse => (<Option value={warehouse.code} key={warehouse.code}>{warehouse.name}</Option>))}
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                库存调整
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} size="large">
              <RadioButton value="all">全部</RadioButton>
              <RadioButton value="normal">正常库存</RadioButton>
              <RadioButton value="frozen">冻结库存</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            <Button size="large" icon="export" onClick={this.handleExportExcel}>
              {this.msg('export')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="main-content" key="main">
          <Card noHovering bodyStyle={{ paddingBottom: 16 }}>
            <QueryForm onSearch={this.handleSearch} />
          </Card>
          <DataTable toolbarActions={toolbarActions} bulkActions={bulkActions}
            selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
            columns={this.columns} rowSelection={rowSelection} dataSource={dataSource} loading={loading} rowKey={rowKey} scrollOffset={390}
          />
          <TransitionModal />
          <BatchTransitModal />
          {/* <BatchMoveModal /> */}
          <BatchFreezeModal />
        </Content>
      </Layout>
    );
  }
}
