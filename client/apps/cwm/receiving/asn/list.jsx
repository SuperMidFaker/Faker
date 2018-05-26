import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Badge, Button, Divider, Form, Layout, Menu, Select, Tag, notification, DatePicker } from 'antd';
import DataTable from 'client/components/DataTable';
import Drawer from 'client/components/Drawer';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import ToolbarAction from 'client/components/ToolbarAction';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import ExportDataPanel from 'client/components/ExportDataPanel';
import { showDock, loadAsnLists, releaseAsn, cancelAsn, closeAsn, batchRelease } from 'common/reducers/cwmReceive';
import { toggleExportPanel } from 'common/reducers/saasExport';
import { CWM_SHFTZ_APIREG_STATUS, CWM_ASN_STATUS, CWM_ASN_BONDED_REGTYPES, LINE_FILE_ADAPTOR_MODELS } from 'common/constants';
import { ShipmentDock, DelegationDock, ReceivingDock, FreightDock } from 'client/components/Dock';
import WhseSelect from '../../common/whseSelect';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const { Content } = Layout;
const { Option } = Select;
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
    showDock, loadAsnLists, releaseAsn, cancelAsn, closeAsn, batchRelease, toggleExportPanel,
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
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  columns = [{
    title: 'ASN编号',
    dataIndex: 'asn_no',
    width: 150,
    fixed: 'left',
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '客户单号',
    width: 240,
    dataIndex: 'cust_order_no',
  }, {
    title: '货主',
    width: 180,
    dataIndex: 'owner_name',
  }, {
    title: '供货商',
    width: 180,
    dataIndex: 'supplier_name',
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
    dataIndex: 'SPACER_COL',
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
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
      } else {
        this.handleReleaseError(result.error.message);
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
      } else {
        this.handleReleaseError(result.error.message);
      }
    });
  }
  handleReleaseError = (errorKey) => {
    if (errorKey === 'release_null_supplier') {
      notification.error({
        message: '释放失败',
        description: 'ASN存在供货商为空',
      });
    } else if (errorKey === 'release_detail_null_qty_no') {
      notification.error({
        message: '释放失败',
        description: 'ASN明细存在数量或货号为空',
      });
    } else {
      notification.error({
        message: '释放失败',
        description: errorKey,
      });
    }
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
    const { filters } = this.props;
    this.props.loadAsnLists({
      whseCode: value,
      pageSize: this.props.asnlist.pageSize,
      current: this.props.asnlist.current,
      filters,
    });
  }
  handleFilterMenuClick = (ev) => {
    const filters = { ...this.props.filters, status: ev.key };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      pageSize: this.props.asnlist.pageSize,
      current: 1,
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
      current: 1,
      filters,
    });
  }
  handleSupplierChange = (value) => {
    const filters = { ...this.props.filters, supplierCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      pageSize: this.props.asnlist.pageSize,
      current: 1,
      filters,
    });
  }
  handleDateChange = (data, dataString) => {
    const filters = { ...this.props.filters, startDate: dataString[0], endDate: dataString[1] };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      pageSize: this.props.asnlist.pageSize,
      current: 1,
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
  handleExport = () => {
    this.props.toggleExportPanel(true);
  }
  render() {
    const {
      defaultWhse, owners, suppliers, filters, loading,
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
        onChange={this.handleDateChange}
        value={dateVal}
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
      />
    </span>);
    const bulkActions = filters.status === 'pending' && <Button icon="play-circle-o" onClick={this.handleBatchRelease}>批量释放</Button>;
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            <WhseSelect onChange={this.handleWhseChange} />,
            this.msg('receivingASN'),
          ]}
        >
          <PageHeader.Actions>
            <ToolbarAction icon="download" label={this.gmsg('export')} onClick={this.handleExport} />
            <ToolbarAction primary icon="plus" label={this.gmsg('create')} onClick={this.handleCreateASN} />
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer width={160}>
            <Menu mode="inline" selectedKeys={[filters.status]} onClick={this.handleFilterMenuClick}>
              <Menu.Item key="all">
                {this.msg('allASN')}
              </Menu.Item>
              <Menu.ItemGroup key="inboundStatus" title={this.msg('inboundStatus')}>
                <Menu.Item key={CWM_ASN_STATUS.PENDING.key}>
                  {CWM_ASN_STATUS.PENDING.text}
                </Menu.Item>
                <Menu.Item key={CWM_ASN_STATUS.INBOUND.key}>
                  {CWM_ASN_STATUS.INBOUND.text}
                </Menu.Item>
                <Menu.Item key={CWM_ASN_STATUS.DISCREPANT.key}>
                  {CWM_ASN_STATUS.DISCREPANT.text}
                </Menu.Item>
                <Menu.Item key={CWM_ASN_STATUS.COMPLETED.key}>
                  {CWM_ASN_STATUS.COMPLETED.text}
                </Menu.Item>
              </Menu.ItemGroup>
              {defaultWhse.bonded &&
              <Menu.ItemGroup key="regStatus" title={this.msg('regStatus')}>
                <Menu.Item key="regPending">
                  待备案
                </Menu.Item>
                <Menu.Item key="regProcessing">
                  已发送
                </Menu.Item>
                <Menu.Item key="regCompleted">
                  备案完成
                </Menu.Item>
              </Menu.ItemGroup>}
            </Menu>
            <Divider />
            <Form layout="vertical">
              <Button icon="filter">{this.gmsg('manageFilters')}</Button>
            </Form>
          </Drawer>
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
            <ExportDataPanel
              type={Object.keys(LINE_FILE_ADAPTOR_MODELS)[5]}
              formData={{ whseCode: this.props.defaultWhse.code }}
            />
          </Content>
        </Layout>
        <ReceivingDock />
        <ShipmentDock />
        <DelegationDock />
        <FreightDock />
      </Layout>
    );
  }
}
