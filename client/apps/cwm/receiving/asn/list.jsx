import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Badge, Button, Breadcrumb, Layout, Radio, Select, Tag, notification, message } from 'antd';
import DataTable from 'client/components/DataTable';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/SearchBar';
import RowUpdater from 'client/components/rowUpdater';
import TrimSpan from 'client/components/trimSpan';
import PageHeader from 'client/components/PageHeader';
import PageHint from 'client/components/PageHint';
import connectNav from 'client/common/decorators/connect-nav';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { CWM_SHFTZ_APIREG_STATUS, CWM_ASN_STATUS, CWM_ASN_BONDED_REGTYPES } from 'common/constants';
import ReceivingDockPanel from '../dock/receivingDockPanel';
import { formatMsg } from '../message.i18n';
import { showDock, loadAsnLists, releaseAsn, cancelAsn, closeAsn, batchRelease } from 'common/reducers/cwmReceive';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../../transport/shipment/dock/shipmentDockPanel';

const { Content } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
function fetchData({ state, dispatch }) {
  dispatch(loadAsnLists({
    whseCode: state.cwmContext.defaultWhse.code,
    tenantId: state.account.tenantId,
    pageSize: state.cwmReceive.asnlist.pageSize,
    current: state.cwmReceive.asnlist.current,
    filters: state.cwmReceive.asnFilters,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
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
  }),
  { showDock, switchDefaultWhse, loadAsnLists, releaseAsn, cancelAsn, closeAsn, batchRelease }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class ReceivingASNList extends React.Component {
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
  componentWillReceiveProps(nextProps) {
    if (!nextProps.asnlist.loaded && !nextProps.asnlist.loading) {
      this.handleListReload();
    }
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: 'ASN编号',
    dataIndex: 'asn_no',
    width: 150,
    fixed: 'left',
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '采购订单号',
    width: 180,
    dataIndex: 'po_no',
  }, {
    title: '货主',
    width: 240,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={16} />,
  }, {
    title: '供应商',
    dataIndex: 'supplier_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: (o) => {
      const asnStatusKey = Object.keys(CWM_ASN_STATUS).filter(as => CWM_ASN_STATUS[as].value === o)[0];
      if (asnStatusKey) {
        return (<Badge status={CWM_ASN_STATUS[asnStatusKey].badge} text={CWM_ASN_STATUS[asnStatusKey].text} />);
      } else {
        return '';
      }
    },
  }, {
    title: '保税监管',
    dataIndex: 'bonded',
    width: 100,
    render: (bonded, record) => {
      if (bonded) {
        const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === record.bonded_intype)[0];
        return entType && <Tag color={entType.tagcolor}>{entType.ftztext}</Tag>;
      } else {
        return (<Tag>非保税</Tag>);
      }
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
            break;
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
            break;
        }
      }
    },
  }, {
    title: '预期到货日期',
    dataIndex: 'expect_receive_date',
    width: 120,
    render: exprecdate => exprecdate && moment(exprecdate).format('YYYY.MM.DD'),
    sorter: (a, b) => new Date(a.expect_receive_date).getTime() - new Date(b.expect_receive_date).getTime(),
  }, {
    title: '实际入库时间',
    dataIndex: 'received_date',
    width: 120,
    render: recdate => recdate && moment(recdate).format('MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.received_date).getTime() - new Date(b.received_date).getTime(),
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
    render: createdate => createdate && moment(createdate).format('MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
  }, {
    title: '创建人员',
    dataIndex: 'created_by',
    width: 80,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === CWM_ASN_STATUS.PENDING.value) {
        return (<span><RowUpdater onHit={this.handleReleaseASN} label="释放" row={record} />
          <span className="ant-divider" /><RowUpdater onHit={this.handleEditASN} label="修改" row={record} /></span>);
      } else {
        const inbndActions = (<span>
          {record.status === CWM_ASN_STATUS.INBOUND.value && <RowUpdater onHit={this.handleInbound} label="入库操作" row={record} />}
          {record.status === CWM_ASN_STATUS.DISCREPANT.value && <RowUpdater onHit={this.handleInbound} label="差异处理" row={record} />}
          {record.status === CWM_ASN_STATUS.COMPLETED.value && <RowUpdater onHit={this.handleInbound} label="入库详情" row={record} />}</span>);
        if (record.bonded) {
          return (<span>
            {inbndActions}
            <span className="ant-divider" />
            {record.reg_status === CWM_SHFTZ_APIREG_STATUS.pending ? <RowUpdater onHit={this.handleSupervision} label="海关备案" row={record} />
              : <RowUpdater onHit={this.handleSupervision} label="备案详情" row={record} />}
          </span>
          );
        } else {
          return (<span>{inbndActions}</span>);
        }
      }
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
    const filters = this.props.filters;
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      tenantId: this.props.tenantId,
      whseCode,
      pageSize: this.props.asnlist.pageSize,
      current: this.props.asnlist.current,
      filters,
    });
  }
  handleReleaseASN = (row) => {
    const { loginId } = this.props;
    const whseCode = this.props.defaultWhse.code;
    this.props.releaseAsn(row.asn_no, loginId, whseCode).then(
      (result) => {
        if (!result.error) {
          notification.success({
            message: '操作成功',
            description: `${row.asn_no} 已释放`,
          });
          this.handleListReload();
        }
      }
    );
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
    const filters = this.props.filters;
    this.props.loadAsnLists({
      whseCode: value,
      tenantId: this.props.tenantId,
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
      tenantId: this.props.tenantId,
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
      tenantId: this.props.tenantId,
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
      tenantId: this.props.tenantId,
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
      tenantId: this.props.tenantId,
      pageSize: this.props.asnlist.pageSize,
      current: this.props.asnlist.current,
      filters,
    });
  }
  handleAsnStockImport = () => {
    const filters = { ...this.props.filters, status: 'completed' };
    this.props.loadAsnLists({
      whseCode: this.props.defaultWhse.code,
      tenantId: this.props.tenantId,
      pageSize: this.props.asnlist.pageSize,
      current: 1,
      filters,
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { whses, defaultWhse, owners, suppliers, filters, loading } = this.props;
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
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          current: pagination.current,
          filters: newfilters,
        };
        return params;
      },
      remotes: this.props.asnlist,
    });
    let columns = this.columns;
    if (!defaultWhse.bonded) {
      columns = [...columns];
      columns.splice(6, 1);
    }
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('asnPlaceholder')} size="large" onInputSearch={this.handleSearch} value={filters.name} />
      <Select showSearch optionFilterProp="children" size="large" value={filters.ownerCode}
        onChange={this.handleOwnerChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      >
        <Option value="all" key="all">全部货主</Option>
        {owners.map(owner => (<Option key={owner.id} value={owner.id}>{owner.name}</Option>))}
      </Select>
      <Select showSearch optionFilterProp="children" size="large" value={filters.supplierCode}
        onChange={this.handleSupplierChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      >
        <Option value="all" key="all">全部供应商</Option>
        {suppliers.filter(supplier => filters.ownerCode !== 'all' ? filters.ownerCode === supplier.owner_partner_id : true)
        .map(supplier => (<Option key={supplier.code} value={supplier.code}>{supplier.name}</Option>))}
      </Select></span>);
    const bulkActions = filters.status === 'pending' && <Button size="large" icon="play-circle-o" onClick={this.handleBatchRelease}>批量释放</Button>;
    /* const popContent = filters.ownerCode === 'all' ? '先选择货主导入'
      : <a href={`${XLSX_CDN}/ASN库存导入模板_20170901.xlsx`}><Icon type="file-excel" />下载导入模板</a>;
      */
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                  {
                    whses.map(warehouse => (<Option key={warehouse.code} value={warehouse.code}>{warehouse.name}</Option>))
                  }
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('receivingASN')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup value={filters.status} onChange={this.handleStatusChange} size="large">
              <RadioButton value="all">全部</RadioButton>
              <RadioButton value="pending">{CWM_ASN_STATUS.PENDING.text}</RadioButton>
              <RadioButton value="inbound">{CWM_ASN_STATUS.INBOUND.text}</RadioButton>
              <RadioButton value="partial">{CWM_ASN_STATUS.DISCREPANT.text}</RadioButton>
              <RadioButton value="completed">{CWM_ASN_STATUS.COMPLETED.text}</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            <PageHint />
            <Button type="primary" size="large" icon="plus" onClick={this.handleCreateASN}>
              {this.msg('createASN')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable toolbarActions={toolbarActions} bulkActions={bulkActions}
            selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
            columns={this.columns} dataSource={dataSource} rowSelection={rowSelection} rowKey="asn_no" loading={loading}
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
