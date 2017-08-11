import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Badge, Button, Breadcrumb, Dropdown, Menu, Icon, Layout, Radio, Select, Tag, notification, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import TrimSpan from 'client/components/trimSpan';
import ExcelUpload from 'client/components/excelUploader';
import connectNav from 'client/common/decorators/connect-nav';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { CWM_SHFTZ_APIREG_STATUS, CWM_ASN_STATUS } from 'common/constants';
import ReceivingDockPanel from '../dock/receivingDockPanel';
import { formatMsg } from '../message.i18n';
import { showDock, loadAsnLists, releaseAsn, cancelAsn, closeAsn, batchRelease } from 'common/reducers/cwmReceive';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../../transport/shipment/dock/shipmentDockPanel';

const { Header, Content } = Layout;
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
    title: 'ANS编号',
    dataIndex: 'asn_no',
    width: 180,
    fixed: 'left',
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '货主',
    width: 200,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={16} />,
  }, {
    title: '采购订单号',
    width: 150,
    dataIndex: 'po_no',
  }, {
    title: '供应商',
    dataIndex: 'seller_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '预期到货日期',
    dataIndex: 'expect_receive_date',
    width: 120,
    render: exprecdate => exprecdate && moment(exprecdate).format('YYYY.MM.DD'),
  }, {
    title: '收货时间',
    dataIndex: 'received_date',
    width: 120,
    render: recdate => recdate && moment(recdate).format('MM.DD HH:mm'),
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
    render: createdate => createdate && moment(createdate).format('MM.DD HH:mm'),
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
    title: '货物属性',
    dataIndex: 'bonded',
    width: 100,
    render: (bonded) => {
      if (bonded) {
        return (<Tag color="blue">保税</Tag>);
      } else {
        return (<Tag>非保税</Tag>);
      }
    },
  }, {
    title: '备案状态',
    dataIndex: 'reg_status',
    width: 100,
    render: (o) => {
      if (o === CWM_SHFTZ_APIREG_STATUS.pending) {
        return (<Badge status="default" text="待备案" />);
      } else if (o === CWM_SHFTZ_APIREG_STATUS.sent) {
        return (<Badge status="processing" text="已发送" />);
      } else if (o === CWM_SHFTZ_APIREG_STATUS.completed) {
        return (<Badge status="success" text="备案完成" />);
      }
    },
  }, {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === CWM_ASN_STATUS.PENDING.value) {
        return (<span><RowUpdater onHit={this.handleReleaseASN} label="释放" row={record} />
          <span className="ant-divider" /><RowUpdater onHit={this.handleEditASN} label="修改" row={record} /></span>);
      } else if (record.status === CWM_ASN_STATUS.INBOUND.value) {
        if (record.bonded && record.reg_status === CWM_SHFTZ_APIREG_STATUS.pending) {
          return (<span>
            <RowUpdater onHit={this.handleInbound} label="入库操作" row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleEntryReg} label="进区备案" row={record} />
          </span>);
        } else {
          return (<span><RowUpdater onHit={this.handleInbound} label="入库操作" row={record} /></span>);
        }
      } else if (record.status === CWM_ASN_STATUS.EXCEPTION.value) {
        return (<span>
          <RowUpdater onHit={this.handleInbound} label="入库操作" row={record} />
          { record.asn_no && <span className="ant-divider" />}
          { record.asn_no && <RowUpdater onHit={this.handleComplete} label="关闭收货" row={record} />}
        </span>);
      } else if (record.status === CWM_ASN_STATUS.COMPLETED.value) {
        if (record.bonded && record.reg_status === CWM_SHFTZ_APIREG_STATUS.pending) {
          return (<span>
            <RowUpdater onHit={this.handleInbound} label="入库详情" row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleEntryReg} label="备案详情" row={record} />
          </span>);
        } else {
          return (<span><RowUpdater onHit={this.handleInbound} label="入库详情" row={record} /></span>);
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
  handleEntryReg = (row) => {
    const link = `/cwm/supervision/shftz/entry/${row.asn_no}`;
    this.context.router.push(link);
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
  render() {
    const { whses, defaultWhse, owners, filters, loading } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const dataSource = new Table.DataSource({
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
      columns.splice(9, 1);
    }
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
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
          <RadioGroup value={filters.status} onChange={this.handleStatusChange} size="large">
            <RadioButton value="all">全部</RadioButton>
            <RadioButton value="pending">{CWM_ASN_STATUS.PENDING.text}</RadioButton>
            <RadioButton value="inbound">{CWM_ASN_STATUS.INBOUND.text}</RadioButton>
            <RadioButton value="partial">{CWM_ASN_STATUS.EXCEPTION.text}</RadioButton>
            <RadioButton value="completed">{CWM_ASN_STATUS.COMPLETED.text}</RadioButton>
          </RadioGroup>
          <div className="page-header-tools">
            {filters.status === 'completed' && filters.ownerCode !== 'all' &&
            <Dropdown.Button size="large" overlay={<Menu />}>
              <ExcelUpload endpoint={`${API_ROOTS.default}v1/cwm/receiving/import/asn/stocks`}
                formData={{
                  data: JSON.stringify({
                    tenantId: this.props.tenantId,
                    tenantName: this.props.tenantName,
                    customsCode: this.props.customsCode,
                    loginId: this.props.loginId,
                    loginName: this.props.loginName,
                    whseCode: defaultWhse.code,
                    whseName: defaultWhse.name,
                    owner: owners.filter(owner => owner.id === filters.ownerCode)[0],
                  }),
                }} onUploaded={this.handleAsnStockImport}
              >
                <Icon type="upload" /> 导入库存ASN
                </ExcelUpload>
            </Dropdown.Button>
              }
            <Button type="primary" size="large" icon="plus" onClick={this.handleCreateASN}>
              {this.msg('createASN')}
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('asnPlaceholder')} size="large" onInputSearch={this.handleSearch} value={filters.name} />
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleOwnerChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
              >
                <Option value="all" key="all">全部货主</Option>
                {
                  owners.map(owner => (<Option key={owner.id} value={owner.id}>{owner.name}</Option>))
                }
              </Select>
              <div className="toolbar-right" />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                {filters.status === 'pending' && <Button size="large" onClick={this.handleBatchRelease}>释放</Button>}
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table columns={columns} rowSelection={rowSelection} dataSource={dataSource} rowKey="asn_no"
                scroll={{ x: columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }} loading={loading}
              />
            </div>
          </div>
        </Content>
        <ReceivingDockPanel />
        <OrderDockPanel />
        <DelegationDockPanel />
        <ShipmentDockPanel />
      </QueueAnim>
    );
  }
}
