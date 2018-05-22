import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Layout, Select, Tag, message, DatePicker } from 'antd';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import connectNav from 'client/common/decorators/connect-nav';
import { loadEntryRegDatas } from 'common/reducers/cwmShFtz';
import { showDock } from 'common/reducers/cwmReceive';
import PageHeader from 'client/components/PageHeader';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { CWM_ASN_BONDED_REGTYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import ReceivingDockPanel from '../../../receiving/dock/receivingDockPanel';
import ShipmentDockPanel from '../../../../scof/shipments/docks/shipmentDockPanel';
import DelegationDockPanel from '../../../../cms/common/dock/delegationDockPanel';
import DeliveryDockPanel from '../../../../transport/shipment/dock/shipmentDockPanel';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

@injectIntl
@connect(
  state => ({
    entryList: state.cwmShFtz.entryList,
    listFilter: state.cwmShFtz.listFilter,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    loading: state.cwmShFtz.loading,
    userMembers: state.account.userMembers,
  }),
  { loadEntryRegDatas, switchDefaultWhse, showDock }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZEntryList extends React.Component {
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
      listFilter.startDate = null;
      listFilter.endDate = null;
    }
    const filter = {
      ...listFilter, status, type: 'bonded', ownerView, filterNo: '',
    };
    this.handleEntryListLoad(null, null, filter);
  }
  componentWillReceiveProps(nextprops) {
    if (nextprops.whse.code !== this.props.whse.code) {
      this.handleEntryListLoad(1, nextprops.whse.code, this.props.listFilter);
    }
  }
  onDateChange = (data, dataString) => {
    const filters = { ...this.props.listFilter, startDate: dataString[0], endDate: dataString[1] };
    this.handleEntryListLoad(1, this.props.whse.code, filters);
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '进区凭单号/备案编号',
    width: 200,
    dataIndex: 'ftz_ent_no',
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
    width: 100,
    dataIndex: 'ftz_ent_type',
    render: (enttype) => {
      const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === enttype)[0];
      return entType && <Tag color={entType.tagcolor}>{entType.ftztext}</Tag>;
    },
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="待进区" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="已备案" />);
      } else if (o === 2) {
        return (<Badge status="success" text="已进区" />);
      }
      return '';
    },
  }, {
    title: '报关单号',
    dataIndex: 'pre_entry_seq_no',
    width: 180,
    render: (preno, row) => (row.cus_decl_no ? <span className="text-emphasis">{row.cus_decl_no}</span> : <span className="text-normal">{preno}</span>),
  }, {
    title: '货主',
    width: 180,
    dataIndex: 'owner_name',
  }, {
    title: '客户单号',
    dataIndex: 'po_no',
    width: 200,
  }, {
    title: '仓储企业',
    width: 180,
    dataIndex: 'wh_ent_name',
  }, {
    title: 'ASN编号',
    dataIndex: 'asn_no',
    width: 160,
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '报关日期',
    width: 120,
    dataIndex: 'cus_decl_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
      return '';
    },
  }, {
    title: '备案更新时间',
    width: 120,
    dataIndex: 'reg_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('MM.DD HH:mm')}`;
      }
      return '';
    },
  }, {
    title: '进区更新时间',
    width: 120,
    dataIndex: 'ftz_ent_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('MM.DD HH:mm')}`;
      }
      return '';
    },
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
    className: 'table-col-ops',
    width: 100,
    fixed: 'right',
    render: (o, record) => (record.status === 0 ?
      <RowAction onClick={this.handleDetail} icon="form" label="详情" row={record} /> :
      <RowAction onClick={this.handleDetail} icon="eye-o" label="详情" row={record} />),
  }]
  handlePreview = (asnNo) => {
    this.props.showDock(asnNo);
  }
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadEntryRegDatas(params),
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
    remotes: this.props.entryList,
  })
  handleEntryListLoad = (currentPage, whsecode, filter) => {
    const { whse, listFilter, entryList: { pageSize, current } } = this.props;
    const newfilter = filter || listFilter;
    this.props.loadEntryRegDatas({
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
  handleStatusChange = (value) => {
    if (value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: value };
    this.handleEntryListLoad(1, this.props.whse.code, filter);
  }
  handleTypeChange = (ev) => {
    if (ev.target.value === this.props.listFilter.type) {
      return;
    }
    const filter = { ...this.props.listFilter, type: ev.target.value };
    this.handleEntryListLoad(1, this.props.whse.code, filter);
  }
  handleCreateBtnClick = () => {
    this.context.router.push('/cwm/ftz/receive/reg');
  }
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/entry/${row.pre_entry_seq_no}`;
    this.context.router.push(link);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    this.handleEntryListLoad(1, value);
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.listFilter, filterNo: searchVal };
    this.handleEntryListLoad(1, this.props.whse.code, filters);
  }
  handleOwnerSelectChange = (value) => {
    const filters = { ...this.props.listFilter, ownerView: value };
    this.handleEntryListLoad(1, this.props.whse.code, filters);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { entryList, listFilter, owners } = this.props;
    let dateVal = [];
    if (listFilter.endDate) {
      dateVal = [moment(listFilter.startDate, 'YYYY-MM-DD'), moment(listFilter.endDate, 'YYYY-MM-DD')];
    }
    this.dataSource.remotes = entryList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('entrySearchPlaceholder')} onSearch={this.handleSearch} />
      <Select
        value={listFilter.status}
        onChange={this.handleStatusChange}
      >
        <Option value="all">全部状态</Option>
        <Option value="pending">待进区</Option>
        <Option value="processing">已备案</Option>
        <Option value="completed">已进区</Option>
      </Select>
      <Select
        showSearch
        optionFilterProp="children"
        value={listFilter.ownerView}
        onChange={this.handleOwnerSelectChange}
        defaultValue="all"
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        <Option value="all">全部货主</Option>
        {owners.map(data => (<Option
          key={data.customs_code}
          value={data.customs_code}
          search={`${data.partner_code}${data.name}`}
        >{data.name}
        </Option>))}
      </Select>
      <RangePicker
        onChange={this.onDateChange}
        value={dateVal}
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
      />
    </span>);
    return (
      <Layout>
        <PageHeader title={this.msg('ftzBondedEntryReg')} />
        <Content className="page-content" key="main">
          <DataTable
            defaultExpandAllRows
            toolbarActions={toolbarActions}
            rowSelection={rowSelection}
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
            columns={this.columns}
            dataSource={this.dataSource}
            indentSize={0}
            rowKey="id"
            loading={this.props.loading}
          />
          <ReceivingDockPanel />
          <ShipmentDockPanel />
          <DelegationDockPanel />
          <DeliveryDockPanel />
        </Content>
      </Layout>
    );
  }
}
