import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Card, Checkbox, Select, Layout, Tooltip, Popover, InputNumber, Radio, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { showTransitionDock, loadTransitions, splitTransit, openBatchTransitModal, openBatchMoveModal, openBatchFreezeModal } from 'common/reducers/cwmTransition';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import Table from 'client/components/remoteAntTable';
import RowUpdater from 'client/components/rowUpdater';
import TrimSpan from 'client/components/trimSpan';
import QueryForm from './queryForm';
import TransitionDockPanel from './dock/transitionDockPanel';
import BatchTransitModal from './modal/batchTransitModal';
import BatchMoveModal from './modal/batchMoveModal';
import BatchFreezeModal from './modal/batchFreezeModal';
import { formatMsg } from '../message.i18n';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Header, Content } = Layout;
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
  { showTransitionDock, loadTransitions, splitTransit, switchDefaultWhse, openBatchTransitModal, openBatchMoveModal, openBatchFreezeModal }
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
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 400,
      });
    }
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
    title: this.msg('totalQty'),
    width: 100,
    dataIndex: 'stock_qty',
    className: 'cell-align-right text-emphasis',
  }, {
    title: this.msg('availQty'),
    width: 100,
    dataIndex: 'avail_qty',
    className: 'cell-align-right',
    render: (text) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      } else {
        return <span className="text-success">{text}</span>;
      }
    },
  }, {
    title: this.msg('allocQty'),
    width: 100,
    dataIndex: 'alloc_qty',
    className: 'cell-align-right',
    render: (text) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      } else {
        return <span className="text-warning">{text}</span>;
      }
    },
  }, {
    title: this.msg('frozenQty'),
    width: 100,
    dataIndex: 'frozen_qty',
    className: 'cell-align-right',
    render: (text) => {
      if (text === 0) {
        return <span className="text-disabled">{text}</span>;
      } else {
        return <span className="text-error">{text}</span>;
      }
    },
  }, {
    title: this.msg('traceId'),
    width: 220,
    dataIndex: 'trace_id',
  }, {
    title: this.msg('SKU'),
    dataIndex: 'product_sku',
    width: 160,
    sorter: true,
  }, {
    title: this.msg('lotNo'),
    width: 180,
    dataIndex: 'external_lot_no',
  }, {
    title: this.msg('serialNo'),
    width: 120,
    dataIndex: 'serial_no',
  }, {
    title: this.msg('virtualWhse'),
    width: 120,
    dataIndex: 'virtual_whse',
  }, {
    title: this.msg('bonded'),
    width: 120,
    dataIndex: 'bonded',
  }, {
    title: this.msg('portion'),
    width: 120,
    dataIndex: 'portion',
  }, {
    title: this.msg('damageLevel'),
    width: 120,
    dataIndex: 'damage_level',
  }, {
    title: this.msg('inboundDate'),
    width: 120,
    dataIndex: 'inbound_date',
    sorter: true,
  }, {
    title: this.msg('expiryDate'),
    width: 120,
    dataIndex: 'expiry_date',
    sorter: true,
  }, {
    title: this.msg('attrib1'),
    width: 120,
    dataIndex: 'attrib_1_string',
  }, {
    title: this.msg('attrib2'),
    width: 120,
    dataIndex: 'attrib_2_string',
  }, {
    title: this.msg('attrib3'),
    width: 120,
    dataIndex: 'attrib_3_string',
  }, {
    title: this.msg('attrib4'),
    width: 120,
    dataIndex: 'attrib_4_string',
  }, {
    title: this.msg('attrib5'),
    width: 120,
    dataIndex: 'attrib_5_string',
  }, {
    title: this.msg('attrib6'),
    width: 120,
    dataIndex: 'attrib_6_string',
  }, {
    title: this.msg('attrib7'),
    width: 120,
    dataIndex: 'attrib_7_date',
  }, {
    title: this.msg('attrib8'),
    width: 120,
    dataIndex: 'attrib_8_date',
  }, {
    title: this.msg('ftzEntryId'),
    width: 120,
    dataIndex: 'ftz_ent_filed_id',
  }, {
    title: this.msg('grossWeight'),
    dataIndex: 'gross_weight',
    className: 'cell-align-right',
    width: 120,
  }, {
    title: this.msg('cbm'),
    dataIndex: 'cbm',
    className: 'cell-align-right',
    width: 120,
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.avail_qty === 0 && record.frozen_qty > 0) {
        return <RowUpdater onHit={this.handleShowDock} label="解冻" row={record} />;
      } else if (record.avail_qty === 1) {
        return <RowUpdater onHit={this.handleShowDock} label="变更" row={record} />;
      } else {
        const min = 1;
        const max = record.avail_qty - 1;
        return (<span>
          <RowUpdater onHit={this.handleShowDock} label="变更" row={record} />
          <span className="ant-divider" />
          <Popover placement="left" title="拆分数量" content={<span>
            <InputNumber onChange={value => this.handleSplitChange(value, min, max)} value={this.state.transitionSplitNum} />
            <Button type="primary" icon="check" style={{ marginLeft: 8 }} onClick={() => this.handleSplitTransition(record)} />
          </span>} trigger="click"
          >
            <a>拆分</a>
          </Popover>
        </span>);
      }
    },
  }]
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    const filter = { ...this.props.listFilter, whse_code: value };
    this.handleStockQuery(1, filter);
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
  }
  handleBatchTransit = () => {
    this.props.openBatchTransitModal();
  }
  handleBatchMove = () => {
    this.props.openBatchMoveModal();
  }
  handleBatchFreeze = () => {
    this.props.openBatchFreezeModal();
  }
  handleStatusChange = (ev) => {
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleStockQuery(1, filter);
  }
  handleSearch = (searchForm) => {
    const filter = { ...this.props.listFilter, ...searchForm, whse_code: this.props.defaultWhse.code };
    this.handleStockQuery(1, filter);
  }
  handleShowDock = (row) => {
    this.props.showTransitionDock(row);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
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
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadTransitions(params),
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
    return (
      <Layout>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                {whses.map(warehouse => (<Option value={warehouse.code} key={warehouse.code}>{warehouse.name}</Option>))}
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              库存变更
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={this.props.listFilter.status} onChange={this.handleStatusChange} size="large">
            <RadioButton value="normal">正常库存</RadioButton>
            <RadioButton value="frozen">冻结库存</RadioButton>
          </RadioGroup>
        </Header>
        <Content className="main-content" key="main">
          <Card noHovering style={{ marginBottom: 16 }} bodyStyle={{ paddingBottom: 16 }}>
            <QueryForm onSearch={this.handleSearch} />
          </Card>
          <div className="page-body data-table">
            <div className="toolbar">
              <div className="toolbar-right">
                <Tooltip title="自定义显示字段" placement="topRight">
                  <Popover placement="leftTop" title="自定义显示字段" content={this.renderDisplayColumns()} trigger="click">
                    <Button shape="circle" icon="bars" />
                  </Popover>
                </Tooltip>
              </div>
              <div className={`bulk-actions ${this.state.selectedRowKeys.length > 1 ? '' : 'hide'}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                <Button onClick={this.handleBatchTransit}>批量转移</Button>
                <Button onClick={this.handleBatchMove}>批量移库</Button>
                <Button onClick={this.handleBatchFreeze}>批量冻结</Button>
                <div className="pull-right">
                  <Button type="primary" ghost shape="circle" icon="close" onClick={this.handleDeselectRows} />
                </div>
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table columns={this.columns} rowSelection={rowSelection} dataSource={dataSource} loading={loading} rowKey="id" bordered
                scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 220), 0), y: this.state.scrollY }}
              />
            </div>
          </div>
          <TransitionDockPanel />
          <BatchTransitModal />
          <BatchMoveModal />
          <BatchFreezeModal />
        </Content>
      </Layout>
    );
  }
}
