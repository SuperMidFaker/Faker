import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Button, Layout, Radio, Select, Tag, message, DatePicker } from 'antd';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import connectNav from 'client/common/decorators/connect-nav';
import { loadReleaseRegDatas } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { CWM_SO_BONDED_REGTYPES } from 'common/constants';
import { showDock } from 'common/reducers/cwmShippingOrder';
import { format } from 'client/common/i18n/helpers';
import PageHeader from 'client/components/PageHeader';
import ShippingDockPanel from '../../../../shipping/dock/shippingDockPanel';
import OrderDockPanel from '../../../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../../../../transport/shipment/dock/shipmentDockPanel';
import messages from '../../message.i18n';


const formatMsg = format(messages);
const { Content } = Layout;
const { Option } = Select;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { RangePicker } = DatePicker;

@injectIntl
@connect(
  state => ({
    releaseList: state.cwmShFtz.releaseList,
    listFilter: state.cwmShFtz.listFilter,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    loading: state.cwmShFtz.loading,
    userMembers: state.account.userMembers,
  }),
  { loadReleaseRegDatas, switchDefaultWhse, showDock }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZReleaseList extends React.Component {
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
    const { listFilter } = this.props;
    let { status } = listFilter;
    let { ownerView } = listFilter;
    if (ownerView !== 'all' && this.props.owners.filter(owner => listFilter.ownerView === owner.customs_code).length === 0) {
      ownerView = 'all';
    }
    if (window.location.search.indexOf('dashboard') > 0 && window.localStorage && window.localStorage.bondedStatus) {
      const bondedStatus = JSON.parse(window.localStorage.bondedStatus);
      listFilter.startDate = bondedStatus.startDate;
      listFilter.endDate = bondedStatus.endDate;
      const newStatus = bondedStatus.status;
      status = newStatus;
    } else {
      if (['all', 'pending', 'processing', 'completed'].filter(stkey => stkey === status).length === 0) {
        status = 'all';
      }
      listFilter.startDate = '';
      listFilter.endDate = '';
    }
    const filter = {
      ...listFilter, status, type: 'portion', ownerView, filterNo: '',
    };
    this.handleReleaseListLoad(null, null, filter);
  }
  onDateChange = (data, dataString) => {
    const filters = { ...this.props.listFilter, startDate: dataString[0], endDate: dataString[1] };
    this.handleReleaseListLoad(1, this.props.whse.code, filters);
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '分拨出库单号/备案编号',
    dataIndex: 'ftz_rel_no',
    width: 200,
    fixed: 'left',
    render: (o, record) => {
      if (o) {
        return (
          <span className="text-emphasis">{o}</span>
        );
      }
      return (
        <span className="text-normal">{record.pre_entry_seq_no}</span>
      );
    },
  }, {
    title: '监管类型',
    dataIndex: 'ftz_rel_type',
    width: 100,
    render: (reltype) => {
      const regtype = CWM_SO_BONDED_REGTYPES.filter(sbr => sbr.value === reltype)[0];
      if (regtype) {
        return (<Tag color={regtype.tagcolor}>{regtype.ftztext}</Tag>);
      }
      return '';
    },
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (o) => {
      switch (o) {
        case 0:
          return (<Badge status="default" text="待备案" />);
        case 1:
          return (<Badge status="processing" text="终端处理" />);
        case 2:
          return (<Badge status="processing" text="已备案" />);
        case 3:
          return (<Badge status="processing" text="部分集中申请" />);
        case 4:
          return (<Badge status="processing" text="已集中申请" />);
        case 5:
          return (<Badge status="processing" text="部分清关" />);
        case 6:
          return (<Badge status="success" text="已清关" />);
        default:
          return '';
      }
    },
  }, {
    title: 'SO编号',
    dataIndex: 'so_no',
    width: 160,
    render: (o, record) => <a onClick={() => this.handlePreview(o, record.outbound_no)}>{o}</a>,
  }, {
    title: '客户单号',
    dataIndex: 'cust_order_no',
    width: 180,
  }, {
    title: '货主',
    width: 180,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '运输单位',
    width: 180,
    dataIndex: 'carrier_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '备案日期',
    width: 120,
    dataIndex: 'ftz_reg_date',
    render: regDate => regDate && moment(regDate).format('YYYY.MM.DD'),
  }, {
    title: '报关申请日期',
    width: 120,
    dataIndex: 'cus_decl_date',
    render: decldate => decldate && moment(decldate).format('YYYY.MM.DD'),
  }, {
    title: '创建人员',
    dataIndex: 'created_by',
    width: 80,
    render: o => this.props.userMembers.find(member => member.login_id === o) &&
     this.props.userMembers.find(member => member.login_id === o).name,
  }, {
    title: '创建时间',
    width: 120,
    dataIndex: 'created_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('MM.DD HH:mm')}`;
      }
      return '';
    },
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (o, record) => (record.status < 1 ?
      <RowAction onClick={this.handleDetail} icon="form" label="详情" row={record} /> :
      <RowAction onClick={this.handleDetail} icon="eye-o" label="详情" row={record} />),
  }]
  handlePreview = (soNo, outboundNo) => {
    this.props.showDock(soNo, outboundNo);
  }
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadReleaseRegDatas(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination) => {
      const params = {
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        whseCode: this.props.whse.code,
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.releaseList,
  })
  handleReleaseListLoad = (currentPage, whsecode, filter) => {
    const { listFilter, whse, releaseList: { pageSize, current } } = this.props;
    const newfilter = filter || listFilter;
    this.props.loadReleaseRegDatas({
      filter: JSON.stringify(newfilter),
      pageSize,
      currentPage: currentPage || current,
      whseCode: whsecode || whse.code,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleReleaseListLoad(1, this.props.whse.code, filter);
  }
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/release/${row.ftz_rel_type}/${row.so_no}`;
    this.context.router.push(link);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    this.handleReleaseListLoad(1, value);
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.listFilter, filterNo: searchVal };
    this.handleReleaseListLoad(1, this.props.whse.code, filters);
  }
  handleOwnerSelectChange = (value) => {
    const filters = { ...this.props.listFilter, ownerView: value };
    this.handleReleaseListLoad(1, this.props.whse.code, filters);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { releaseList, listFilter, owners } = this.props;
    let dateVal = [];
    if (listFilter.endDate) {
      dateVal = [moment(listFilter.startDate, 'YYYY-MM-DD'), moment(listFilter.endDate, 'YYYY-MM-DD')];
    }
    this.dataSource.remotes = releaseList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('releaseSearchPlaceholder')} onSearch={this.handleSearch} />
      <span />
      <Select
        showSearch
        optionFilterProp="children"
        style={{ width: 160 }}
        value={listFilter.ownerView}
        onChange={this.handleOwnerSelectChange}
        defaultValue="all"
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        <Option value="all">全部货主</Option>
        {owners.map(data => (<Option key={data.customs_code} value={data.customs_code} search={`${data.partner_code}${data.name}`}>{data.name}</Option>))}
      </Select>
      <RangePicker
        onChange={this.onDateChange}
        value={dateVal}
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
      />
    </span>);
    const bulkActions = (<span>
      {listFilter.status === 'completed' && <Button >集中报关</Button>}
    </span>);
    return (
      <Layout>
        <PageHeader title={this.msg('ftzRelPortionReg')}>
          <PageHeader.Nav>
            <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} >
              <RadioButton value="all">全部</RadioButton>
              <RadioButton value="pending">待备案</RadioButton>
              <RadioButton value="processing">终端处理</RadioButton>
              <RadioButton value="completed">已备案</RadioButton>
              <RadioButton value="applied">已集中申请</RadioButton>
              <RadioButton value="cleared">已清关</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            toolbarActions={toolbarActions}
            bulkActions={bulkActions}
            rowSelection={rowSelection}
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
            columns={this.columns}
            dataSource={this.dataSource}
            rowKey="id"
            loading={this.props.loading}
            indentSize={0}
          />
          <ShippingDockPanel />
          <OrderDockPanel />
          <DelegationDockPanel />
          <ShipmentDockPanel />
        </Content>
      </Layout>
    );
  }
}
