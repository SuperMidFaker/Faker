import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Badge, Button, Breadcrumb, Layout, Radio, Select, Tag, notification, message, DatePicker } from 'antd';
import DataTable from 'client/components/DataTable';
import QueueAnim from 'rc-queue-anim';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import TrimSpan from 'client/components/trimSpan';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { showDock, loadAsnLists, releaseAsn, cancelAsn, closeAsn, batchRelease } from 'common/reducers/cwmReceive';
import { CWM_SHFTZ_APIREG_STATUS, CWM_ASN_STATUS, CWM_ASN_BONDED_REGTYPES } from 'common/constants';
import ReceivingDockPanel from '../dock/receivingDockPanel';
import { formatMsg } from '../message.i18n';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../../transport/shipment/dock/shipmentDockPanel';

const { Content } = Layout;
const { Option } = Select;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { RangePicker } = DatePicker;

@injectIntl
@connect(
  state => ({
    tenantName: state.account.tenantName,
    customsCode: state.account.customsCode,
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    filters: state.cwmReceive.asnFilters,
    asnlist: state.cwmReceive.asnlist,
    loading: state.cwmReceive.asnlist.loading,
    owners: state.cwmContext.whseAttrs.owners,
    suppliers: state.cwmContext.whseAttrs.suppliers,
    loginId: state.account.loginId,
    loginName: state.account.username,
    userMembers: state.account.userMembers,
  }),
  {
    showDock, switchDefaultWhse, loadAsnLists, releaseAsn, cancelAsn, closeAsn, batchRelease,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class ReceivingASNList extends React.Component {
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
    const filters = {
      status: 'all', ownerCode: 'all', supplierCode: 'all', startDate: '', endDate: '',
    };
    if (window.location.search.indexOf('pending') > 0 && window.localStorage && window.localStorage.cwmReceiveInboundLists) {
      const cwmReceiveInboundLists = JSON.parse(window.localStorage.cwmReceiveInboundLists);
      filters.startDate = cwmReceiveInboundLists.startDate;
      filters.endDate = cwmReceiveInboundLists.endDate;
      filters.status = cwmReceiveInboundLists.status;
    }
    this.props.loadAsnLists({
      whseCode: this.props.defaultWhse.code,
      pageSize: this.props.asnlist.pageSize,
      current: this.props.asnlist.current,
      filters,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.asnlist.loaded && !nextProps.asnlist.loading) {
      this.handleListReload();
    }
  }
  onDateChange = (data, dataString) => {
    const filters = { ...this.props.filters, startDate: dataString[0], endDate: dataString[1] };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      pageSize: this.props.asnlist.pageSize,
      current: this.props.asnlist.current,
      filters,
    });
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: 'ASN编号',
    dataIndex: 'asn_no',
    width: 150,
    fixed: 'left',
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '客户单号',
    width: 180,
    dataIndex: 'po_no',
  }, {
    title: '货主',
    width: 240,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={16} />,
  }, {
    title: '供货商',
    dataIndex: 'supplier_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: (o) => {
      const asnStatusKey = Object.keys(CWM_ASN_STATUS).filter(as =>
        CWM_ASN_STATUS[as].value === o)[0];
      if (asnStatusKey) {
        return (<Badge
          status={CWM_ASN_STATUS[asnStatusKey].badge}
          text={CWM_ASN_STATUS[asnStatusKey].text}
        />);
      }
      return '';
    },
  }, {
    title: '保税监管',
    dataIndex: 'bonded',
    width: 100,
    render: (bonded, record) => {
      if (bonded) {
        const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype =>
          regtype.value === record.bonded_intype)[0];
        return entType && <Tag color={entType.tagcolor}>{entType.ftztext}</Tag>;
      }
      return (<Tag>非保税</Tag>);
    },
  }, {
    title: '监管状态',
    dataIndex: 'reg_status',
    width: 100,
    render: (o, record) => {
      if (record.bonded_intype === 'transfer') {
        switch (o) {
          case CWM_SHFTZ_APIREG_STATUS.pending:
            return (<Badge status="default" text="未接收" />);
          case CWM_SHFTZ_APIREG_STATUS.processing:
            return (<Badge status="processing" text="数据比对" />);
          case CWM_SHFTZ_APIREG_STATUS.completed:
            return (<Badge status="success" text="接收完成" />);
          default:
            return null;
        }
      } else {
        switch (o) {
          case CWM_SHFTZ_APIREG_STATUS.pending:
            return (<Badge status="default" text="待备案" />);
          case CWM_SHFTZ_APIREG_STATUS.processing:
            return (<Badge status="processing" text="已发送" />);
          case CWM_SHFTZ_APIREG_STATUS.completed:
            return (<Badge status="success" text="备案完成" />);
          default:
            return null;
        }
      }
    },
  }, {
    title: '预期到货日期',
    dataIndex: 'expect_receive_date',
    width: 140,
    render: exprecdate => exprecdate && moment(exprecdate).format('YYYY.MM.DD'),
    sorter: (a, b) => new Date(a.expect_receive_date).getTime()
    - new Date(b.expect_receive_date).getTime(),
  }, {
    title: '实际入库时间',
    dataIndex: 'received_date',
    width: 140,
    render: recdate => recdate && moment(recdate).format('MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.received_date).getTime() - new Date(b.received_date).getTime(),
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 140,
    render: createdate => createdate && moment(createdate).format('MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
  }, {
    title: '创建人员',
    dataIndex: 'created_by',
    width: 80,
    render: o => this.props.userMembers.find(member => member.login_id === o)
    && this.props.userMembers.find(member => member.login_id === o).name,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === CWM_ASN_STATUS.PENDING.value) {
        return (<span>
          <RowAction onClick={this.handleReleaseASN} icon="play-circle-o" label="释放" row={record} />
          <RowAction onClick={this.handleEditASN} icon="edit" tooltip="修改" row={record} />
        </span>);
      }
      return (<span>
        {record.status === CWM_ASN_STATUS.INBOUND.value && <RowAction onClick={this.handleInbound} icon="form" label="入库操作" row={record} />}
        {record.status === CWM_ASN_STATUS.DISCREPANT.value && <RowAction onClick={this.handleInbound} label="差异处理" row={record} />}
        {record.status === CWM_ASN_STATUS.COMPLETED.value && <RowAction onClick={this.handleInbound} icon="eye-o" label="入库详情" row={record} />}
      </span>);
    },
  }]
  handlePreview = (asnNo) => {
    this.props.showDock(asnNo);
  }
  handleComplete = (row) => {
    this.props.closeAsn(row.asn_no).then((result) => {
      if (!result.error) {
        this.handleListReload();
      }
    });
  }
  handleCreateASN = () => {
    this.context.router.push('/cwm/receiving/asn/create');
  }
  handleEditASN = (row) => {
    const link = `/cwm/receiving/asn/${row.asn_no}`;
    this.context.router.push(link);
  }
  handleDeleteASN = (row) => {
    this.props.cancelAsn(row.asn_no).then((result) => {
      if (!result.error) {
        this.handleListReload();
      }
    });
  }
  handleListReload = () => {
    const { filters } = this.props;
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      pageSize: this.props.asnlist.pageSize,
      current: this.props.asnlist.current,
      filters,
    });
  }
  handleReleaseASN = (row) => {
    const { loginId } = this.props;
    const whseCode = this.props.defaultWhse.code;
    this.props.releaseAsn(row.asn_no, loginId, whseCode).then((result) => {
      if (!result.error) {
        notification.success({
          message: '操作成功',
          description: `${row.asn_no} 已释放`,
        });
        this.handleListReload();
      } else if (result.error.message === 'release_null_supplier') {
        notification.error({
          message: '释放失败',
          description: `${row.asn_no} 供货商为空`,
        });
      }
    });
  }
  handleBatchRelease = () => {
    const { selectedRowKeys } = this.state;
    const { loginId } = this.props;
    this.props.batchRelease(selectedRowKeys, loginId).then((result) => {
      if (!result.error) {
        const msg = selectedRowKeys.join(',');
        notification.success({
          message: '操作成功',
          description: `${msg} 已释放`,
        });
        this.handleListReload();
        this.setState({
          selectedRowKeys: [],
        });
      } else if (result.error.message === 'release_null_supplier') {
        notification.error({
          message: '释放失败',
          description: 'ASN存在供货商为空',
        });
      }
    });
  }
  handleInbound = (row) => {
    const link = `/cwm/receiving/inbound/${row.inbound_no}`;
    this.context.router.push(link);
  }
  handleSupervision = (row) => {
    const link = row.bonded_intype === 'transfer' ? `/cwm/supervision/shftz/transfer/in/${row.asn_no}` : `/cwm/supervision/shftz/entry/${row.asn_no}`;
    this.context.router.push(link);
  }
  handleDisprepancy = () => {
    // TODO
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    const { filters } = this.props;
    this.props.loadAsnLists({
      whseCode: value,
      pageSize: this.props.asnlist.pageSize,
      current: this.props.asnlist.current,
      filters,
    });
  }
  handleStatusChange = (ev) => {
    const filters = { ...this.props.filters, status: ev.target.value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      pageSize: this.props.asnlist.pageSize,
      current: this.props.asnlist.current,
      filters,
    });
    this.setState({
      selectedRowKeys: [],
    });
  }
  handleOwnerChange = (value) => {
    const filters = { ...this.props.filters, ownerCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      pageSize: this.props.asnlist.pageSize,
      current: this.props.asnlist.current,
      filters,
    });
  }
  handleSupplierChange = (value) => {
    const filters = { ...this.props.filters, supplierCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      pageSize: this.props.asnlist.pageSize,
      current: this.props.asnlist.current,
      filters,
    });
  }
  handleSearch = (value) => {
    const filters = { ...this.props.filters, name: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      pageSize: this.props.asnlist.pageSize,
      current: 1,
      filters,
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const {
      whses, defaultWhse, owners, suppliers, filters, loading,
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
      fetcher: params => this.props.loadAsnLists(params),
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
      remotes: this.props.asnlist,
    });
    let { columns } = this;
    if (!defaultWhse.bonded) {
      columns = [...columns];
      columns.splice(6, 1);
    }
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('asnPlaceholder')} onSearch={this.handleSearch} />
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
        {owners.map(owner => (<Option key={owner.id} value={owner.id}>{owner.name}</Option>))}
      </Select>
      <Select
        showSearch
        optionFilterProp="children"
        value={filters.supplierCode}
        onChange={this.handleSupplierChange}
        defaultValue="all"
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        <Option value="all" key="all">全部供货商</Option>
        {suppliers.filter(supplier => (filters.ownerCode !== 'all' ? filters.ownerCode === supplier.owner_partner_id : true))
            .map(supplier => (
              <Option key={supplier.code} value={supplier.code}>
                {supplier.name}</Option>))}
      </Select>
      <RangePicker
        onChange={this.onDateChange}
        value={dateVal}
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
      />
    </span>);
    const bulkActions = filters.status === 'pending' && <Button icon="play-circle-o" onClick={this.handleBatchRelease}>批量释放</Button>;
    /* const popContent = filters.ownerCode === 'all' ? '先选择货主导入'
      : <a href={`${XLSX_CDN}/ASN库存导入模板_20170901.xlsx`}><Icon type="file-excel" />下载导入模板</a>;
      */
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                  {
                    whses.map(warehouse => (<Option key={warehouse.code} value={warehouse.code}>
                      {warehouse.name}</Option>))
                  }
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('receivingASN')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup value={filters.status} onChange={this.handleStatusChange} >
              <RadioButton value="all">全部</RadioButton>
              <RadioButton value="pending">{CWM_ASN_STATUS.PENDING.text}</RadioButton>
              <RadioButton value="inbound">{CWM_ASN_STATUS.INBOUND.text}</RadioButton>
              <RadioButton value="partial">{CWM_ASN_STATUS.DISCREPANT.text}</RadioButton>
              <RadioButton value="completed">{CWM_ASN_STATUS.COMPLETED.text}</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            <Button type="primary" icon="plus" onClick={this.handleCreateASN}>
              {this.msg('createASN')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            toolbarActions={toolbarActions}
            bulkActions={bulkActions}
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
            columns={this.columns}
            dataSource={dataSource}
            rowSelection={rowSelection}
            rowKey="asn_no"
            loading={loading}
            locale={{ emptyText: '没有当前状态的ASN' }}
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
