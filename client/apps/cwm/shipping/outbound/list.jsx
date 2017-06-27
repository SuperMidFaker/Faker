import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Icon, Breadcrumb, Layout, Radio, Select, Table, Tooltip, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { Fontello } from 'client/components/FontIcon';
import { loadOutbounds } from 'common/reducers/cwmOutbound';
import { format } from 'client/common/i18n/helpers';
import ShippingDockPanel from '../dock/shippingDockPanel';
import messages from '../message.i18n';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { showDock } from 'common/reducers/cwmShippingOrder';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    filters: state.cwmOutbound.outboundFilters,
    outbound: state.cwmOutbound.outbound,
    owners: state.cwmContext.whseAttrs.owners,
    loginId: state.account.loginId,
  }),
  { switchDefaultWhse, showDock, loadOutbounds }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class OutboundList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  componentWillMount() {
    this.props.loadOutbounds({
      whseCode: this.props.defaultWhse.code,
      tenantId: this.props.tenantId,
      pageSize: this.props.outbound.pageSize,
      current: this.props.outbound.current,
      filters: this.props.filters,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultWhse.code !== this.props.defaultWhse.code) {
      nextProps.loadOutbounds({
        whseCode: nextProps.defaultWhse.code,
        tenantId: nextProps.tenantId,
        pageSize: nextProps.outbound.pageSize,
        current: nextProps.outbound.current,
        filters: nextProps.filters,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: 'SO编号',
    dataIndex: 'so_no',
    width: 120,
    render: o => (
      <a onClick={() => this.handlePreview()}>
        {o}
      </a>),
  }, {
    title: '波次号',
    width: 120,
    dataIndex: 'ref_order_no',
  }, {
    title: <Tooltip title="明细记录数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'detail_count',
    width: 50,
    render: dc => !isNaN(dc) ? dc : null,
  }, {
    title: '货主',
    width: 200,
    dataIndex: 'owner_code',
  }, {
    title: '分配',
    className: 'cell-align-center',
    render: (o, record) => {
      if (record.status === 1) {
        return <Fontello type="circle" color="blue" />;
      } else if (record.status >= 2 && record.status <= 6) {
        return <Fontello type="circle" color="green" />;
      } else {
        return <Fontello type="circle" color="gray" />;
      }
    },
  }, {
    title: '拣货',
    className: 'cell-align-center',
    render: (o, record) => {
      if (record.status === 3) {
        return <Fontello type="circle" color="blue" />;
      } else if (record.status >= 4 && record.status <= 6) {
        return <Fontello type="circle" color="green" />;
      } else {
        return <Fontello type="circle" color="gray" />;
      }
    },
  }, {
    title: '装箱',
    dataIndex: 'packing',
    className: 'cell-align-center',
    render: (o) => {
      switch (o) {
        case 0:
          return <Fontello type="circle" color="gray" />;
        case 1:
          return <Fontello type="circle" color="blue" />;
        case 2:
          return <Fontello type="circle" color="green" />;
        default:
          return <span />;
      }
    },
  }, {
    title: '发运',
    className: 'cell-align-center',
    render: (o, record) => {
      if (record.status === 5) {
        return <Fontello type="circle" color="blue" />;
      } else if (record.status === 6) {
        return <Fontello type="circle" color="green" />;
      } else {
        return <Fontello type="circle" color="gray" />;
      }
    },
  }, {
    title: '操作模式',
    dataIndex: 'receiving_mode',
    render: (o) => {
      if (o === 'scan') {
        return (<Tooltip title="扫码发货"><Icon type="scan" /></Tooltip>);
      } else if (o === 'manual') {
        return (<Tooltip title="人工发货"><Icon type="solution" /></Tooltip>);
      }
    },
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
  }, {
    title: '完成时间',
    dataIndex: 'completed_date',
    width: 120,
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater onHit={this.handleReceive} label="出库操作" row={record} /> </span>);
      } else if (record.status === 0 && record.receiving_mode === 2) {
        return (<span><RowUpdater label="撤回" row={record} /></span>);
      } else {
        return (<span><RowUpdater onHit={this.handleReceive} label="出库操作" row={record} /> </span>);
      }
    },
  }]

  dataSource = [{
    id: '1',
    so_no: 'N04601170548',
    bonded: 1,
    whse_code: '0961|希雅路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7IR2730',
    status: 0,
    receiving_mode: 'scan',
    allocating: 3,
    picking: 0,
    packing: 0,
    shipping: 0,
  }, {
    id: '2',
    so_no: 'N04601170547',
    bonded: 0,
    whse_code: '0086|物流大道仓库',
    owner_code: '03701|西门子国际贸易',
    ref_order_no: 'NUE0394488',
    status: 1,
    receiving_mode: 'scan',
    allocating: 3,
    picking: 2,
    packing: -1,
    shipping: 0,
  }, {
    id: '3',
    so_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 2,
    receiving_mode: 'manual',
    allocating: 3,
    picking: 2,
    packing: 0,
    shipping: 0,
  }, {
    id: '4',
    so_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 3,
    receiving_mode: 'manual',
    allocating: 3,
    picking: 2,
    packing: 0,
    shipping: 0,
  }, {
    id: '5',
    so_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 4,
    receiving_mode: 'scan',
    allocating: 3,
    picking: 2,
    packing: 1,
    shipping: 0,
  }, {
    id: '6',
    so_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 5,
    receiving_mode: 'manual',
    allocating: 3,
    picking: 2,
    packing: -1,
    shipping: 0,
  }, {
    id: '7',
    so_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 6,
    receiving_mode: 'scan',
    allocating: 3,
    picking: 2,
    packing: 2,
    shipping: 0,
  }, {
    id: '8',
    so_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 6,
    receiving_mode: 'scan',
    allocating: 3,
    picking: 2,
    packing: -1,
    shipping: 0,
  }];
  handlePreview = () => {
    this.props.showDock();
  }
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  handleReceive = (row) => {
    const link = `/cwm/shipping/outbound/${row.outbound_no}`;
    this.context.router.push(link);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
  }
  render() {
    const { defaultWhse, whses } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                {
                  whses.map(warehouse => (<Option value={warehouse.code} key={warehouse.code}>{warehouse.name}</Option>))
                }
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('shippingOutbound')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup defaultValue="created" onChange={this.handleStatusChange} size="large">
            <RadioButton value="created">待出库</RadioButton>
            <RadioButton value="allocating">分配</RadioButton>
            <RadioButton value="picking">拣货</RadioButton>
            <RadioButton value="shipping">发货</RadioButton>
            <RadioButton value="completed">已出库</RadioButton>
          </RadioGroup>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleClientSelectChange} defaultValue="all"
              >
                <Option value="all">全部货主</Option>
              </Select>
              <div className="toolbar-right" />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel">
              <Table columns={this.columns} dataSource={this.dataSource} rowSelection={rowSelection} rowKey="id" scroll={{ x: 1200 }} />
            </div>
          </div>
        </Content>
        <ShippingDockPanel />
      </QueueAnim>
    );
  }
}
