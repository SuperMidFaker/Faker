import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import FileSaver from 'file-saver';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Layout, Radio, Select, Button, Badge, Tag, message, notification } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/SearchBar';
import connectNav from 'client/common/decorators/connect-nav';
import ShippingDockPanel from '../dock/shippingDockPanel';
import AddToWaveModal from './modal/addToWaveModal';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { CWM_SHFTZ_APIREG_STATUS, CWM_SO_STATUS, CWM_SO_BONDED_REGTYPES, LINE_FILE_ADAPTOR_MODELS } from 'common/constants';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { loadSos, showDock, releaseSo, createWave, showAddToWave, batchRelease } from 'common/reducers/cwmShippingOrder';
import { exportNormalExitBySo } from 'common/reducers/cwmOutbound';
import { loadAdaptors } from 'common/reducers/saasLineFileAdaptor';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../../transport/shipment/dock/shipmentDockPanel';
import ImportDataPanel from 'client/components/ImportDataPanel';


const formatMsg = format(messages);
const { Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;

function fetchData({ state, dispatch }) {
  dispatch(loadSos({
    whseCode: state.cwmContext.defaultWhse.code,
    pageSize: state.cwmShippingOrder.solist.pageSize,
    current: state.cwmShippingOrder.solist.current,
    filters: state.cwmShippingOrder.soFilters,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    receivers: state.cwmContext.whseAttrs.receivers,
    carriers: state.cwmContext.whseAttrs.carriers,
    loginId: state.account.loginId,
    filters: state.cwmShippingOrder.soFilters,
    solist: state.cwmShippingOrder.solist,
    loading: state.cwmShippingOrder.solist.loading,
    tenantName: state.account.tenantName,
    userMembers: state.account.userMembers,
    adaptors: state.saasLineFileAdaptor.adaptors,
  }),
  {
    loadSos, switchDefaultWhse, showDock, releaseSo, createWave, showAddToWave, batchRelease, exportNormalExitBySo, loadAdaptors,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class ShippingOrderList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    createWaveEnable: true,
    importPanelVisible: false,
  }
  componentDidMount() {
    this.props.loadAdaptors('', [LINE_FILE_ADAPTOR_MODELS.CWM_SHIPPING_ORDER.key], true);
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.solist.loaded && !nextProps.solist.loading) {
      this.handleReload();
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: 'SO编号',
    width: 150,
    dataIndex: 'so_no',
    fixed: 'left',
    render: (o, record) => (
      <a onClick={() => this.handlePreview(o, record.outbound_no)}>
        {o}
      </a>),
  }, {
    title: '客户单号',
    dataIndex: 'cust_order_no',
    width: 180,
  }, {
    title: '货主',
    width: 200,
    dataIndex: 'owner_name',
  }, {
    title: '收货人',
    dataIndex: 'receiver_name',
    width: 180,
  }, {
    title: '承运人',
    dataIndex: 'carrier_name',
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="订单接收" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="已释放" />);
      } else if (o === 2) {
        return (<Badge status="warning" text="部分发货" />);
      } else if (o === 3) {
        return (<Badge status="success" text="发货完成" />);
      }
    },
  }, {
    title: '货物属性',
    width: 100,
    dataIndex: 'bonded',
    render: (bonded, record) => {
      if (bonded === 1) {
        const regtype = CWM_SO_BONDED_REGTYPES.filter(sbr => sbr.value === record.bonded_outtype)[0];
        if (regtype) {
          return (<Tag color={regtype.tagcolor}>{regtype.ftztext || '保税'}</Tag>);
        }
      } else if (bonded === -1) {
        return (<Tag>不限</Tag>);
      } else {
        return (<Tag>非保税</Tag>);
      }
    },
  }, {
    title: '监管状态',
    dataIndex: 'reg_status',
    width: 120,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="待备案" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="已发送" />);
      } else if (o === 2) {
        return (<Badge status="success" text="备案完成" />);
      }
    },
  }, {
    title: '要求出货日期',
    dataIndex: 'expect_shipping_date',
    width: 140,
    render: o => o && moment(o).format('YYYY.MM.DD'),
    sorter: (a, b) => new Date(a.expect_shipping_date).getTime() - new Date(b.expect_shipping_date).getTime(),
  }, {
    title: '实际出库时间',
    dataIndex: 'shipped_date',
    width: 140,
    render: o => o && moment(o).format('MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.shipped_date).getTime() - new Date(b.shipped_date).getTime(),
  }, {
    title: '创建时间',
    width: 140,
    dataIndex: 'created_date',
    render: o => moment(o).format('MM.DD HH:mm'),
    sorter: (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
  }, {
    title: '创建人员',
    dataIndex: 'created_by',
    width: 80,
    render: o => this.props.userMembers.find(member => member.login_id === o) && this.props.userMembers.find(member => member.login_id === o).name,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === CWM_SO_STATUS.PENDING.value) {
        return (<span>
          <RowAction icon="play-circle-o" label="释放" row={record} onClick={this.handleReleaseSO} />
          <RowAction onClick={this.handleEditSO} tooltip="修改" icon="edit" row={record} />
        </span>);
      } else {
        const outbndActions = (<span>
          {(record.status === CWM_SO_STATUS.OUTBOUND.value || record.status === CWM_SO_STATUS.PARTIAL.value)
            && <RowAction onClick={this.handleOutbound} icon="form" label="出库操作" row={record} />}
          {record.status === CWM_SO_STATUS.COMPLETED.value &&
            <RowAction onClick={this.handleOutbound} icon="eye-o" label="出库详情" row={record} />}
        </span>);
        if (record.bonded_outtype === 'transfer' || record.bonded_outtype === 'portion' || record.bonded_outtype === 'normal') {
          return (<span>
            {outbndActions}
            {record.reg_status === CWM_SHFTZ_APIREG_STATUS.pending ?
              <RowAction onClick={this.handleSupervision} icon="inbox" tooltip="海关备案" row={record} />
              : <RowAction onClick={this.handleSupervision} icon="inbox" tooltip="备案详情" row={record} />}
          </span>);
        } else {
          return (<span>{outbndActions}</span>);
        }
      }
    },
  }]
  handleSupervision = (row) => {
    const link = row.bonded_outtype === 'transfer' ? `/cwm/supervision/shftz/transfer/out/${row.so_no}`
      : `/cwm/supervision/shftz/release/${row.bonded_outtype}/${row.so_no}`;
    this.context.router.push(link);
  }
  handlePreview = (soNo, outboundNo) => {
    this.props.showDock(soNo, outboundNo);
  }
  handleReleaseSO = (record) => {
    const { loginId } = this.props;
    this.props.releaseSo(record.so_no, loginId).then((result) => {
      if (!result.error) {
        notification.success({
          message: '操作成功',
          description: `${record.so_no} 已释放`,
        });
        this.handleReload();
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
        this.handleReload();
        this.setState({
          selectedRowKeys: [],
        });
      }
    });
  }
  handleReload = () => {
    this.props.loadSos({
      whseCode: this.props.defaultWhse.code,
      pageSize: this.props.solist.pageSize,
      current: this.props.solist.current,
      filters: this.props.filters,
    }).then((result) => {
      if (!result.error) {
        this.setState({
          selectedRowKeys: [],
        });
      }
    });
  }
  handleCreateSO = () => {
    this.context.router.push('/cwm/shipping/order/create');
  }
  handleEditSO = (row) => {
    const link = `/cwm/shipping/order/${row.so_no}`;
    this.context.router.push(link);
  }
  handleOutbound = (row) => {
    const link = `/cwm/shipping/outbound/${row.outbound_no}`;
    this.context.router.push(link);
  }
  handleStatusChange = (ev) => {
    const filters = { ...this.props.filters, status: ev.target.value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadSos({
      whseCode,
      pageSize: this.props.solist.pageSize,
      current: this.props.solist.current,
      filters,
    });
    this.setState({
      selectedRowKeys: [],
    });
  }
  handleOwnerChange = (value) => {
    const filters = { ...this.props.filters, ownerCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAdaptors(`${value === 'all' ? '' : value}`, [LINE_FILE_ADAPTOR_MODELS.CWM_SHIPPING_ORDER.key], true);
    this.props.loadSos({
      whseCode,
      pageSize: this.props.solist.pageSize,
      current: this.props.solist.current,
      filters,
    });
  }
  handleReceiverChange = (value) => {
    const filters = { ...this.props.filters, receiverCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadSos({
      whseCode,
      pageSize: this.props.solist.pageSize,
      current: this.props.solist.current,
      filters,
    });
  }
  handleCarrierChange = (value) => {
    const filters = { ...this.props.filters, carrierCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadSos({
      whseCode,
      pageSize: this.props.solist.pageSize,
      current: this.props.solist.current,
      filters,
    });
  }
  handleSearch = (value) => {
    const filters = { ...this.props.filters, name: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadSos({
      whseCode,
      pageSize: this.props.solist.pageSize,
      current: this.props.solist.current,
      filters,
    });
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    const filters = this.props.filters;
    this.props.loadSos({
      whseCode: value,
      pageSize: this.props.solist.pageSize,
      current: this.props.solist.current,
      filters,
    });
  }
  handleCreateWave = () => {
    const { tenantName, defaultWhse, loginId } = this.props;
    const { selectedRowKeys } = this.state;
    this.props.createWave(selectedRowKeys, tenantName, defaultWhse.code, loginId).then((result) => {
      if (!result.error) {
        this.handleReload();
      }
    });
  }
  showAddToWaveModal = () => {
    const { selectedRows } = this.state;
    this.props.showAddToWave(selectedRows[0].owner_partner_id);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleExportExitVoucher = () => {
    const { selectedRows } = this.state;
    this.props.exportNormalExitBySo(selectedRows.map(sr => sr.so_no)).then((resp) => {
      if (!resp.error) {
        let xlsxno = selectedRows.slice(0, 2).map(sr => sr.so_no).join('_');
        if (selectedRows.length > 2) {
          xlsxno = `${xlsxno}等`;
        }
        FileSaver.saveAs(
          new window.Blob([Buffer.from(resp.data)], { type: 'application/octet-stream' }),
          `${xlsxno}_出区凭单.xlsx`
        );
      } else {
        notification.error({
          message: '导出失败',
          description: resp.error.message,
        });
      }
    });
  }
  render() {
    const {
      whses, defaultWhse, owners, receivers, carriers, filters, loading,
    } = this.props;
    let columns = this.columns;
    if (filters.status === 'inWave') {
      columns = [...columns];
      columns.splice(-1, 1);
    }
    if (!defaultWhse.bonded) {
      columns = [...columns];
      columns.splice(7, 1);
    }
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadSos(params),
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
      remotes: this.props.solist,
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        for (let i = 0; i < selectedRows.length; i++) {
          if (selectedRows[i].bonded) {
            this.setState({
              createWaveEnable: false,
            });
            break;
          }
          if (i > 0) {
            if (selectedRows[i].receiver_code !== selectedRows[i - 1].receiver_code && selectedRows[i].carrier_code !== selectedRows[i - 1].carrier_code) {
              this.setState({
                createWaveEnable: false,
              });
              break;
            }
          }
        }
        this.setState({ selectedRowKeys, selectedRows });
      },
    };
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('soPlaceholder')} onInputSearch={this.handleSearch} value={filters.name} />
      <span />
      <Select showSearch optionFilterProp="children" value={filters.ownerCode}
        onChange={this.handleOwnerChange} dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      >
        <Option value="all" key="all">全部货主</Option>
        {
            owners.map(owner => (<Option key={owner.id} value={owner.id}>{owner.name}</Option>))
          }
      </Select>
      <span />
      <Select showSearch optionFilterProp="children" value={filters.receiverCode}
        onChange={this.handleReceiverChange} dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      >
        <Option value="all" key="all">全部收货人</Option>
        {
            receivers.filter(receiver => filters.ownerCode !== 'all' ? filters.ownerCode === receiver.owner_partner_id : true)
            .map(receiver => (<Option key={receiver.code} value={receiver.code}>{receiver.name}</Option>))
          }
      </Select>
      <span />
      <Select showSearch optionFilterProp="children" value={filters.carrierCode}
        onChange={this.handleCarrierChange} dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      >
        <Option value="all" key="all">全部承运人</Option>
        {
            carriers.filter(carrier => filters.ownerCode !== 'all' ? filters.ownerCode === carrier.owner_partner_id : true)
            .map(carrier => (<Option key={carrier.code} value={carrier.code}>{carrier.name}</Option>))
          }
      </Select>
    </span>);
    const bulkActions = (<span>
      {filters.status === 'pending' && <Button onClick={this.handleBatchRelease}>释放</Button>}
      {(filters.status === 'partial' || filters.status === 'completed') && <Button onClick={this.handleExportExitVoucher}>导出出区凭单</Button>}
      {this.state.createWaveEnable && filters.status === 'pending' && <Button onClick={this.handleCreateWave}>创建波次计划</Button>}
      {this.state.createWaveEnable && filters.status === 'pending' && <Button onClick={this.showAddToWaveModal}>添加到波次计划</Button>}
    </span>
    );
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
                {this.msg('shippingOrder')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup value={filters.status} onChange={this.handleStatusChange} >
              <RadioButton value="all">全部</RadioButton>
              <RadioButton value="pending">订单接收</RadioButton>
              <RadioButton value="outbound">已释放</RadioButton>
              <RadioButton value="partial">部分发货</RadioButton>
              <RadioButton value="completed">发货完成</RadioButton>
            </RadioGroup>
            <span />
            <RadioGroup value={filters.status} onChange={this.handleStatusChange} >
              <RadioButton value="inWave">已加入波次计划</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            <Button onClick={() => { this.setState({ importPanelVisible: true }); }}>{this.msg('batchImport')}</Button>
            <Button type="primary" icon="plus" onClick={this.handleCreateSO}>
              {this.msg('createSO')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable columns={columns} rowSelection={rowSelection} dataSource={dataSource} rowKey="id"
            toolbarActions={toolbarActions} scroll={{ x: columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }} loading={loading}
            bulkActions={bulkActions} selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
          />
        </Content>
        <ShippingDockPanel />
        <OrderDockPanel />
        <DelegationDockPanel />
        <ShipmentDockPanel />
        <ImportDataPanel
          visible={this.state.importPanelVisible}
          adaptors={this.props.adaptors}
          endpoint={`${API_ROOTS.default}v1/cwm/shipping/import/orders`}
          formData={{
            tenantName: this.props.tenantName,
            loginId: this.props.loginId,
            whseCode: defaultWhse.code,
            whseName: defaultWhse.name,
          }}
          onClose={() => { this.setState({ importPanelVisible: false }); }}
          onUploaded={this.handleReload}
          template={`${XLSX_CDN}/SO批量导入模板.xlsx`}
        />
        <AddToWaveModal reload={this.handleReload} selectedRowKeys={this.state.selectedRowKeys} />
      </QueueAnim>
    );
  }
}
