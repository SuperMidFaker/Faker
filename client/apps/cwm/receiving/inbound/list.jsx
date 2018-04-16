import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Badge, Icon, Layout, Radio, Select, Tooltip, DatePicker } from 'antd';
import DataTable from 'client/components/DataTable';
import QueueAnim from 'rc-queue-anim';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import TrimSpan from 'client/components/trimSpan';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import { CWM_INBOUND_STATUS_INDICATOR } from 'common/constants';
import { showDock, loadInbounds } from 'common/reducers/cwmReceive';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import Strip from 'client/components/Strip';
import WhseSelect from '../../common/whseSelect';
import messages from '../message.i18n';
import ReceivingDockPanel from '../dock/receivingDockPanel';
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
    filters: state.cwmReceive.inboundFilters,
    inbound: state.cwmReceive.inbound,
    loading: state.cwmReceive.inbound.loading,
    owners: state.cwmContext.whseAttrs.owners,
    loginId: state.account.loginId,
  }),
  { showDock, loadInbounds, switchDefaultWhse }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class ReceivingInboundList extends React.Component {
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
    this.props.loadInbounds({
      whseCode: this.props.defaultWhse.code,
      pageSize: this.props.inbound.pageSize,
      current: this.props.inbound.current,
      filters,
    });
  }
  componentWillReceiveProps(nextProps) {
    if ((nextProps.defaultWhse.code !== this.props.defaultWhse.code) ||
     (!nextProps.inbound.loaded && !nextProps.inbound.loading)) {
      const filters = { ...this.props.filters };
      nextProps.loadInbounds({
        whseCode: nextProps.defaultWhse.code,
        pageSize: nextProps.inbound.pageSize,
        current: nextProps.inbound.current,
        filters,
      });
    }
  }
  onDateChange = (data, dataString) => {
    const filters = { ...this.props.filters, startDate: dataString[0], endDate: dataString[1] };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadInbounds({
      whseCode,
      pageSize: this.props.inbound.pageSize,
      current: this.props.inbound.current,
      filters,
    });
  }
  initializeFilters = () => {
    let filters = {};
    if (window.localStorage) {
      filters = JSON.parse(window.localStorage.cwmReceiveInboundLists || '{"status":"all","ownerCode":"all"}');
    }
    return filters;
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '入库单号',
    dataIndex: 'inbound_no',
    width: 160,
    fixed: 'left',
    render: (o, record) => (<a onClick={() => this.handlePreview(record.asn_no)}>{o}</a>),
  }, {
    title: '客户单号',
    width: 240,
    dataIndex: 'cust_order_no',
  }, {
    title: <Tooltip title="明细记录数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'total_product_qty',
    width: 50,
    render: dc => (!isNaN(dc) ? dc : null), // eslint-disable-line
  }, {
    title: '货主',
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '预期总数量',
    dataIndex: 'total_expect_qty',
    width: 100,
  }, {
    title: '实收总数量',
    dataIndex: 'total_received_qty',
    width: 100,
  }, {
    title: '上架总数量',
    dataIndex: 'total_putaway_qty',
    width: 100,
  }, {
    title: '收货总体积',
    dataIndex: 'total_received_vol',
    width: 100,
  }, {
    width: 200,
    className: 'progress-bar',
    render: (o, record) => {
      const processing = record.total_received_qty - record.total_putaway_qty;
      const warning = record.total_expect_qty - record.total_received_qty;
      return (<Strip overall={record.total_expect_qty} parts={{ success: record.total_putaway_qty, processing, warning }} hints={['已上架', '未上架', '未收货']} />);
    },
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 150,
    render: (o) => {
      const inbStatus = CWM_INBOUND_STATUS_INDICATOR.filter(status => status.value === o)[0];
      return <Badge status={inbStatus.badge} text={inbStatus.text} />;
    },
  }, {
    title: '入库方式',
    dataIndex: 'rec_mode',
    width: 80,
    align: 'center',
    render: (o) => {
      if (o === 'scan') {
        return (<Tooltip title="手持扫码"><Icon type="scan" /></Tooltip>);
      } else if (o === 'manual') {
        return (<Tooltip title="单据人工"><Icon type="solution" /></Tooltip>);
      } else if (o === 'import') {
        return (<Tooltip title="数据导入"><Icon type="upload" /></Tooltip>);
      }
      return '';
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
    render: completedDate => completedDate && moment(completedDate).format('MM.DD HH:mm'),
  }, {
    title: '操作',
    width: 140,
    fixed: 'right',
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
    render: (o, record) => {
      if (record.status === 0) {
        return <RowAction onClick={this.handleReceive} icon="form" label="入库操作" row={record} />;
      } else if (record.status === 0 && record.receiving_lock === 2) {
        return <RowAction label="撤回" row={record} />;
      }
      return <RowAction onClick={this.handleReceive} icon="form" label="入库操作" row={record} />;
    },
  }]
  handleInboundsReload = () => {
    const { filters } = this.props;
    this.props.loadInbounds({
      whseCode: this.props.defaultWhse.code,
      pageSize: this.props.inbound.pageSize,
      current: this.props.inbound.current,
      filters,
    });
  }
  handleStatusChange = (e) => {
    const filters = { ...this.props.filters, status: e.target.value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadInbounds({
      whseCode,
      pageSize: this.props.inbound.pageSize,
      current: this.props.inbound.current,
      filters,
    });
  }
  handlePreview = (asnNo) => {
    this.props.showDock(asnNo);
  }
  handleReceive = (row) => {
    const link = `/cwm/receiving/inbound/${row.inbound_no}`;
    this.context.router.push(link);
  }
  handleOwnerChange = (value) => {
    const filters = { ...this.props.filters, ownerCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadInbounds({
      whseCode,
      pageSize: this.props.inbound.pageSize,
      current: this.props.inbound.current,
      filters,
    });
  }
  handleSearch = (value) => {
    const filters = { ...this.props.filters, name: value };
    this.props.loadInbounds({
      whseCode: this.props.defaultWhse.code,
      pageSize: this.props.inbound.pageSize,
      current: 1,
      filters,
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const {
      owners, filters, loading,
    } = this.props;
    let dateVal = [];
    if (filters.endDate) {
      dateVal = [moment(filters.startDate, 'YYYY-MM-DD'), moment(filters.endDate, 'YYYY-MM-DD')];
    }
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadInbounds(params),
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
      remotes: this.props.inbound,
    });
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('inboundPlaceholder')} onSearch={this.handleSearch} />
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
        {
          owners.map(owner => (<Option value={owner.id} key={owner.name}>{owner.name}</Option>))
        }
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
            this.msg('receivingInound'),
          ]}
        >
          <PageHeader.Nav>
            <RadioGroup value={filters.status} onChange={this.handleStatusChange} >
              <RadioButton value="all">全部</RadioButton>
              <RadioButton value="create">待入库</RadioButton>
              <RadioButton value="receive">收货</RadioButton>
              <RadioButton value="putaway">上架</RadioButton>
              <RadioButton value="completed">已入库</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            toolbarActions={toolbarActions}
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
            columns={this.columns}
            dataSource={dataSource}
            rowSelection={rowSelection}
            rowKey="id"
            loading={loading}
          />
        </Content>
        <ReceivingDockPanel />
        <OrderDockPanel />
        <DelegationDockPanel />
        <ShipmentDockPanel />
      </QueueAnim>
    );
  }
}
