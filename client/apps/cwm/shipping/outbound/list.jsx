import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Icon, Breadcrumb, Layout, Radio, Select, Tooltip, message } from 'antd';
import DataTable from 'client/components/DataTable';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/SearchBar';
import RowAction from 'client/components/RowAction';
import connectNav from 'client/common/decorators/connect-nav';
import { Fontello } from 'client/components/FontIcon';
import { loadOutbounds } from 'common/reducers/cwmOutbound';
import ShippingDockPanel from '../dock/shippingDockPanel';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { showDock } from 'common/reducers/cwmShippingOrder';
import { CWM_OUTBOUND_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../../transport/shipment/dock/shipmentDockPanel';
import PageHeader from 'client/components/PageHeader';

const formatMsg = format(messages);
const { Content } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  dispatch(loadOutbounds({
    whseCode: state.cwmContext.defaultWhse.code,
    pageSize: state.cwmOutbound.outbound.pageSize,
    current: state.cwmOutbound.outbound.current,
    filters: state.cwmOutbound.outboundFilters,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    filters: state.cwmOutbound.outboundFilters,
    outbound: state.cwmOutbound.outbound,
    loading: state.cwmOutbound.outbound.loading,
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
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultWhse.code !== this.props.defaultWhse.code || !nextProps.outbound.loaded && !nextProps.outbound.loading) {
      const filters = { ...this.props.filters };
      const whseCode = nextProps.defaultWhse.code;
      this.props.loadOutbounds({
        whseCode,
        pageSize: this.props.outbound.pageSize,
        current: this.props.outbound.current,
        filters,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '出库单号',
    dataIndex: 'outbound_no',
    width: 180,
  }, {
    title: 'SO/波次编号',
    dataIndex: 'so_no',
    width: 180,
    render: (soNo, record) => soNo ? <a onClick={() => this.handlePreview(soNo, record.outbound_no)}>{soNo}</a> :
    <span>{record.wave_no}</span>,
  }, {
    title: <Tooltip title="明细记录数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'total_product_qty',
    width: 50,
    render: dc => !isNaN(dc) ? dc : null,
  }, {
    title: '货主',
    width: 200,
    dataIndex: 'owner_name',
  }, {
    title: '分配',
    align: 'center',
    render: (o, record) => {
      if (record.status === CWM_OUTBOUND_STATUS.PARTIAL_ALLOC.value) {
        return <Fontello type="circle" color="blue" />;
      } else if (record.status >= CWM_OUTBOUND_STATUS.ALL_ALLOC.value && record.status <= CWM_OUTBOUND_STATUS.COMPLETED.value) {
        return <Fontello type="circle" color="green" />;
      } else {
        return <Fontello type="circle" color="gray" />;
      }
    },
  }, {
    title: '拣货',
    align: 'center',
    render: (o, record) => {
      if (record.status === CWM_OUTBOUND_STATUS.PARTIAL_PICKED.value) {
        return <Fontello type="circle" color="blue" />;
      } else if (record.status >= CWM_OUTBOUND_STATUS.ALL_PICKED.value && record.status <= CWM_OUTBOUND_STATUS.COMPLETED.value) {
        return <Fontello type="circle" color="green" />;
      } else {
        return <Fontello type="circle" color="gray" />;
      }
    },
  }, {
    title: '复核装箱',
    dataIndex: 'chk_pck_status',
    align: 'center',
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
    align: 'center',
    render: (o, record) => {
      if (record.status === CWM_OUTBOUND_STATUS.SHIPPING.value) {
        return <Fontello type="circle" color="blue" />;
      } else if (record.status === CWM_OUTBOUND_STATUS.COMPLETED.value) {
        return <Fontello type="circle" color="green" />;
      } else {
        return <Fontello type="circle" color="gray" />;
      }
    },
  }, {
    title: '操作模式',
    dataIndex: 'shipping_mode',
    width: 80,
    align: 'center',
    render: (o) => {
      if (o === 'scan') {
        return (<Tooltip title="扫码发货"><Icon type="scan" /></Tooltip>);
      } else if (o === 'manual') {
        return (<Tooltip title="人工发货"><Icon type="solution" /></Tooltip>);
      } else {
        return <span />;
      }
    },
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
    render: createdate => createdate && moment(createdate).format('MM.DD HH:mm'),
  }, {
    title: '完成时间',
    dataIndex: 'completed_date',
    width: 120,
    render: completeddate => completeddate && moment(completeddate).format('MM.DD HH:mm'),
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return <RowAction onClick={this.handleOutboundDetail} icon="form" label="出库操作" row={record} />;
      } else if (record.status === 0 && record.shipping_mode === 2) {
        return <RowAction label="撤回" row={record} />;
      } else {
        return <RowAction onClick={this.handleOutboundDetail} icon="form" label="出库操作" row={record} />;
      }
    },
  }]
  handlePreview = (soNo, outboundNo) => {
    this.props.showDock(soNo, outboundNo);
  }
  handleStatusChange = (ev) => {
    const filters = { ...this.props.filters, status: ev.target.value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadOutbounds({
      whseCode,
      pageSize: this.props.outbound.pageSize,
      current: this.props.outbound.current,
      filters,
    });
  }
  handleOutboundDetail = (row) => {
    const link = `/cwm/shipping/outbound/${row.outbound_no}`;
    this.context.router.push(link);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
  }
  handleSearch = (value) => {
    const filters = { ...this.props.filters, name: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadOutbounds({
      whseCode,
      pageSize: this.props.outbound.pageSize,
      current: this.props.outbound.current,
      filters,
    });
  }
  handleOwnerChange = (value) => {
    const filters = { ...this.props.filters, ownerCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadOutbounds({
      whseCode,
      pageSize: this.props.outbound.pageSize,
      current: this.props.outbound.current,
      filters,
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const {
      defaultWhse, whses, owners, loading, filters,
    } = this.props;
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadOutbounds(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, tblfilters) => {
        const newfilters = { ...this.props.filters, ...tblfilters[0] };
        const params = {
          whseCode: this.props.defaultWhse.code,
          pageSize: pagination.pageSize,
          current: pagination.current,
          filters: newfilters,
        };
        return params;
      },
      remotes: this.props.outbound,
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('outboundPlaceholder')} onInputSearch={this.handleSearch} value={filters.name} />
      <span />
      <Select showSearch optionFilterProp="children" style={{ width: 160 }} value={filters.ownerCode}
        onChange={this.handleOwnerChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      >
        <Option value="all" key="all">全部货主</Option>
        {owners.map(owner => (<Option value={owner.id} key={owner.name}>{owner.name}</Option>))}
      </Select>
    </span>);
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                  {
                    whses.map(warehouse => (<Option value={warehouse.code} key={warehouse.code}>{warehouse.name}</Option>))
                  }
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('shippingOutbound')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup defaultValue={filters.status} onChange={this.handleStatusChange} >
              <RadioButton value="all">全部</RadioButton>
              <RadioButton value="created">待出库</RadioButton>
              <RadioButton value="allocating">分配</RadioButton>
              <RadioButton value="picking">拣货</RadioButton>
              <RadioButton value="shipping">发货</RadioButton>
              <RadioButton value="completed">已出库</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable columns={this.columns} dataSource={dataSource} rowSelection={rowSelection} rowKey="id" scroll={{ x: 1300 }} loading={loading}
            toolbarActions={toolbarActions} selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
          />
        </Content>
        <ShippingDockPanel />
        <OrderDockPanel />
        <DelegationDockPanel />
        <ShipmentDockPanel />
      </QueueAnim>
    );
  }
}
