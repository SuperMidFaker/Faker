import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Icon, Layout, Radio, Select, Tooltip, DatePicker } from 'antd';
import DataTable from 'client/components/DataTable';
import QueueAnim from 'rc-queue-anim';
import PageHeader from 'client/components/PageHeader';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import connectNav from 'client/common/decorators/connect-nav';
import { Logixon } from 'client/components/FontIcon';
import { loadOutbounds } from 'common/reducers/cwmOutbound';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { showDock } from 'common/reducers/cwmShippingOrder';
import { CWM_OUTBOUND_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import WhseSelect from '../../common/whseSelect';
import messages from '../message.i18n';
import ShippingDockPanel from '../dock/shippingDockPanel';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../../transport/shipment/dock/shipmentDockPanel';


const formatMsg = format(messages);
const { Content } = Layout;
const { Option } = Select;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { RangePicker } = DatePicker;

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
  }
  componentDidMount() {
    const filters = this.initializeFilters();
    if (window.location.search.indexOf('dashboard') < 0) {
      filters.startDate = '';
      filters.endDate = '';
    }
    this.props.loadOutbounds({
      whseCode: this.props.defaultWhse.code,
      pageSize: this.props.outbound.pageSize,
      current: this.props.outbound.current,
      filters,
    });
  }
  componentWillReceiveProps(nextProps) {
    if ((nextProps.defaultWhse.code !== this.props.defaultWhse.code) ||
       (!nextProps.outbound.loaded && !nextProps.outbound.loading)) {
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
  onDateChange = (data, dataString) => {
    const filters = { ...this.props.filters, startDate: dataString[0], endDate: dataString[1] };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadOutbounds({
      whseCode,
      pageSize: this.props.outbound.pageSize,
      current: 1,
      filters,
    });
  }
  initializeFilters = () => {
    let filters = {};
    if (window.localStorage) {
      filters = JSON.parse(window.localStorage.cwmShipOutboundLists || '{"status":"all","ownerCode":"all"}');
    }
    return filters;
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '出库单号',
    dataIndex: 'outbound_no',
    width: 180,
    render: (o, record) => (record.so_no ?
      <a onClick={() => this.handlePreview(record.so_no, record.outbound_no)}>{o}</a>
      : <span>{o}</span>),
  }, {
    title: <Tooltip title="明细记录数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'total_product_qty',
    width: 50,
    render: dc => (!isNaN(dc) ? dc : null), // eslint-disable-line
  }, {
    title: '货主',
    width: 200,
    dataIndex: 'owner_name',
  }, {
    title: '分配',
    align: 'center',
    render: (o, record) => {
      if (record.status === CWM_OUTBOUND_STATUS.PARTIAL_ALLOC.value) {
        return <Logixon type="circle" color="blue" />;
      } else if (record.status >= CWM_OUTBOUND_STATUS.ALL_ALLOC.value &&
        record.status <= CWM_OUTBOUND_STATUS.COMPLETED.value) {
        return <Logixon type="circle" color="green" />;
      }
      return <Logixon type="circle" color="gray" />;
    },
  }, {
    title: '拣货',
    align: 'center',
    render: (o, record) => {
      if (record.status === CWM_OUTBOUND_STATUS.PARTIAL_PICKED.value) {
        return <Logixon type="circle" color="blue" />;
      } else if (record.status >= CWM_OUTBOUND_STATUS.ALL_PICKED.value &&
        record.status <= CWM_OUTBOUND_STATUS.COMPLETED.value) {
        return <Logixon type="circle" color="green" />;
      }
      return <Logixon type="circle" color="gray" />;
    },
  }, {
    title: '复核装箱',
    dataIndex: 'chk_pck_status',
    align: 'center',
    render: (o) => {
      switch (o) {
        case 0:
          return <Logixon type="circle" color="gray" />;
        case 1:
          return <Logixon type="circle" color="blue" />;
        case 2:
          return <Logixon type="circle" color="green" />;
        default:
          return <span />;
      }
    },
  }, {
    title: '发运',
    align: 'center',
    render: (o, record) => {
      if (record.status === CWM_OUTBOUND_STATUS.SHIPPING.value) {
        return <Logixon type="circle" color="blue" />;
      } else if (record.status === CWM_OUTBOUND_STATUS.COMPLETED.value) {
        return <Logixon type="circle" color="green" />;
      }
      return <Logixon type="circle" color="gray" />;
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
      }
      return <span />;
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
    className: 'table-col-ops',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return <RowAction onClick={this.handleOutboundDetail} icon="form" label="出库操作" row={record} />;
      } else if (record.status === 0 && record.shipping_mode === 2) {
        return <RowAction label="撤回" row={record} />;
      }
      return <RowAction onClick={this.handleOutboundDetail} icon="form" label="出库操作" row={record} />;
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
      current: 1,
      filters,
    });
  }
  handleOutboundDetail = (row) => {
    const link = `/cwm/shipping/outbound/${row.outbound_no}`;
    this.context.router.push(link);
  }
  handleSearch = (value) => {
    const filters = { ...this.props.filters, name: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadOutbounds({
      whseCode,
      pageSize: this.props.outbound.pageSize,
      current: 1,
      filters,
    });
  }
  handleOwnerChange = (value) => {
    const filters = { ...this.props.filters, ownerCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadOutbounds({
      whseCode,
      pageSize: this.props.outbound.pageSize,
      current: 1,
      filters,
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const {
      owners, loading, filters,
    } = this.props;
    let dateVal = [];
    if (filters.endDate) {
      dateVal = [moment(filters.startDate, 'YYYY-MM-DD'), moment(filters.endDate, 'YYYY-MM-DD')];
    }
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
      <SearchBox placeholder={this.msg('outboundPlaceholder')} onSearch={this.handleSearch} />
      <RadioGroup defaultValue={filters.status} onChange={this.handleStatusChange} >
        <RadioButton value="all">全部</RadioButton>
        <RadioButton value="created">待分配</RadioButton>
        <RadioButton value="allocating">分配中</RadioButton>
        <RadioButton value="allocated">已分配</RadioButton>
        <RadioButton value="picking">拣货</RadioButton>
        <RadioButton value="shipping">发货</RadioButton>
        <RadioButton value="completed">已出库</RadioButton>
      </RadioGroup>
      <Select
        showSearch
        optionFilterProp="children"
        value={filters.ownerCode}
        onChange={this.handleOwnerChange}
        defaultValue="all"
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        <Option value="all" key="all">全部货主</Option>
        {owners.map(owner => (<Option value={owner.id} key={owner.name}>{owner.name}</Option>))}
      </Select>
      <RangePicker
        onChange={this.onDateChange}
        value={dateVal}
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
      />
    </span>);
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader
          breadcrumb={[
            <WhseSelect />,
            this.msg('shippingOutbound'),
          ]}
        />
        <Content className="page-content" key="main">
          <DataTable
            columns={this.columns}
            dataSource={dataSource}
            rowSelection={rowSelection}
            rowKey="id"
            scroll={{ x: 1300 }}
            loading={loading}
            toolbarActions={toolbarActions}
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
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
