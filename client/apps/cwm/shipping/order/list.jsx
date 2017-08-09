import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, DatePicker, Dropdown, Icon, Layout, Menu, Radio, Select, Button, Badge, Tag, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import RowUpdater from 'client/components/rowUpdater';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import connectNav from 'client/common/decorators/connect-nav';
import ExcelUpload from 'client/components/excelUploader';
import ShippingDockPanel from '../dock/shippingDockPanel';
import AddToWaveModal from './modal/addToWaveModal';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { CWM_SHFTZ_APIREG_STATUS, CWM_SO_STATUS } from 'common/constants';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { loadSos, showDock, releaseSo, createWave, showAddToWave } from 'common/reducers/cwmShippingOrder';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../cms/common/dock/delegationDockPanel';
import ShipmentDockPanel from '../../../transport/shipment/dock/shipmentDockPanel';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;
const { RangePicker } = DatePicker;

function fetchData({ state, dispatch }) {
  dispatch(loadSos({
    whseCode: state.cwmContext.defaultWhse.code,
    tenantId: state.account.tenantId,
    pageSize: state.cwmShippingOrder.solist.pageSize,
    current: state.cwmShippingOrder.solist.current,
    filters: state.cwmShippingOrder.soFilters,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    loginId: state.account.loginId,
    filters: state.cwmShippingOrder.soFilters,
    solist: state.cwmShippingOrder.solist,
    loading: state.cwmShippingOrder.solist.loading,
    tenantName: state.account.tenantName,
  }),
  { loadSos, switchDefaultWhse, showDock, releaseSo, createWave, showAddToWave }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class ShippingOrderList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    searchInput: '',
    createWaveEnable: true,
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.solist.loaded && !nextProps.solist.loading) {
      this.handleReload();
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: 'SO编号',
    width: 180,
    dataIndex: 'so_no',
    fixed: 'left',
    render: (o, record) => (
      <a onClick={() => this.handlePreview(o, record.outbound_no)}>
        {o}
      </a>),
  }, {
    title: '货主',
    width: 200,
    dataIndex: 'owner_name',
  }, {
    title: '客户订单号',
    dataIndex: 'cust_order_no',
    width: 150,
  }, {
    title: '收货人',
    dataIndex: 'receiver_name',
    width: 180,
  }, {
    title: '承运人',
    dataIndex: 'carrier_name',
  }, {
    title: '要求出货日期',
    dataIndex: 'expect_shipping_date',
    width: 120,
    render: o => o && moment(o).format('YYYY.MM.DD'),
  }, {
    title: '发货时间',
    dataIndex: 'shipped_date',
    width: 120,
    render: o => o && moment(o).format('MM.DD HH:mm'),
  }, {
    title: '创建时间',
    width: 120,
    dataIndex: 'created_date',
    render: o => moment(o).format('MM.DD HH:mm'),
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
    render: (o) => {
      if (o === 1) {
        return (<Tag color="blue">保税</Tag>);
      } else if (o === 0) {
        return (<Tag>非保税</Tag>);
      }
    },
  }, {
    title: '备案状态',
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
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === CWM_SO_STATUS.PENDING.value) {
        return (<span><RowUpdater label="释放" row={record} onHit={this.handleReleaseSO} /><span className="ant-divider" /><RowUpdater onHit={this.handleEditSO} label="修改" row={record} /><span className="ant-divider" /><RowUpdater label="取消" row={record} /></span>);
      } else if (record.status === CWM_SO_STATUS.OUTBOUND.value) {
        if (record.bonded && record.reg_status === CWM_SHFTZ_APIREG_STATUS.pending) {
          return (<span><RowUpdater onHit={this.handleOutbound} label="出库操作" row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleReleaseReg} label="出区备案" row={record} /></span>);
        } else {
          return (<span><RowUpdater onHit={this.handleOutbound} label="出库操作" row={record} /></span>);
        }
      } else if (record.status === CWM_SO_STATUS.PARTIAL.value) {
      } else if (record.status === CWM_SO_STATUS.COMPLETED.value) {
        if (record.bonded && record.reg_status === CWM_SHFTZ_APIREG_STATUS.pending) {
          return (<span>
            <RowUpdater onHit={this.handleOutbound} label="出库详情" row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleReleaseReg} label="备案详情" row={record} />
          </span>);
        } else {
          return (<span><RowUpdater onHit={this.handleOutbound} label="出库详情" row={record} /></span>);
        }
      }
    },
  }]
  handleReleaseReg = (row) => {
    this.context.router.push(`/cwm/supervision/shftz/release/${row.so_no}`);
  }
  handlePreview = (soNo, outboundNo) => {
    this.props.showDock(soNo, outboundNo);
  }
  handleReleaseSO = (record) => {
    const { loginId } = this.props;
    this.props.releaseSo(record.so_no, loginId).then((result) => {
      if (!result.error) {
        this.handleReload();
      }
    });
  }
  handleReload = () => {
    this.props.loadSos({
      whseCode: this.props.defaultWhse.code,
      tenantId: this.props.tenantId,
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
      tenantId: this.props.tenantId,
      pageSize: this.props.solist.pageSize,
      current: this.props.solist.current,
      filters,
    });
  }
  handleOwnerChange = (value) => {
    const filters = { ...this.props.filters, ownerCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadSos({
      whseCode,
      tenantId: this.props.tenantId,
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
      tenantId: this.props.tenantId,
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
      tenantId: this.props.tenantId,
      pageSize: this.props.solist.pageSize,
      current: this.props.solist.current,
      filters,
    });
  }
  createWave = () => {
    const { tenantId, tenantName, defaultWhse, loginId } = this.props;
    const { selectedRowKeys } = this.state;
    this.props.createWave(selectedRowKeys, tenantId, tenantName, defaultWhse.code, loginId).then((result) => {
      if (!result.error) {
        this.handleReload();
      }
    });
  }
  showAddToWaveModal = () => {
    const { selectedRows } = this.state;
    this.props.showAddToWave(selectedRows[0].owner_partner_id);
  }
  handleSoStockImport = () => {
    this.handleReload();
  }
  render() {
    const { whses, defaultWhse, owners, filters, loading } = this.props;
    let columns = this.columns;
    if (filters.status === 'inWave') {
      columns = [...columns];
      columns.splice(-1, 1);
    }
    if (!defaultWhse.bonded) {
      columns = [...columns];
      columns.splice(10, 1);
    }
    const dataSource = new Table.DataSource({
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
          tenantId: this.props.tenantId,
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
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                {
                  whses.map(warehouse => (<Option value={warehouse.code} key={warehouse.code}>{warehouse.name}</Option>))
                }
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('shippingOrder')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={filters.status} onChange={this.handleStatusChange} size="large">
            <RadioButton value="all">全部</RadioButton>
            <RadioButton value="pending">订单接收</RadioButton>
            <RadioButton value="outbound">已释放</RadioButton>
            <RadioButton value="partial">部分发货</RadioButton>
            <RadioButton value="completed">发货完成</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup value={filters.status} onChange={this.handleStatusChange} size="large">
            <RadioButton value="inWave">已加入波次计划</RadioButton>
          </RadioGroup>
          <div className="page-header-tools">
            <Dropdown.Button size="large" overlay={<Menu />}>
              <ExcelUpload endpoint={`${API_ROOTS.default}v1/cwm/shipping/import/orders`}
                formData={{
                  data: JSON.stringify({
                    tenantId: this.props.tenantId,
                    tenantName: this.props.tenantName,
                    loginId: this.props.loginId,
                    whseCode: defaultWhse.code,
                    whseName: defaultWhse.name,
                  }),
                }} onUploaded={this.handleSoStockImport}
              >
                <Icon type="upload" /> {this.msg('batchImport')}
              </ExcelUpload>
            </Dropdown.Button>
            <Button type="primary" size="large" icon="plus" onClick={this.handleCreateSO}>
              {this.msg('createSO')}
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} value={filters.name} />
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleOwnerChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
              >
                <Option value="all" key="all">全部货主</Option>
                {
                  owners.map(owner => (<Option key={owner.id} value={owner.id}>{owner.name}</Option>))
                }
              </Select>
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleReceiverChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
              >
                <Option value="all" key="all">全部收货人</Option>
                {
                  owners.map(owner => (<Option key={owner.id} value={owner.id}>{owner.name}</Option>))
                }
              </Select>
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleCarrierChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
              >
                <Option value="all" key="all">全部承运人</Option>
                {
                  owners.map(owner => (<Option key={owner.id} value={owner.id}>{owner.name}</Option>))
                }
              </Select>
              <span />
              <RangePicker allowClear size="large" ranges={{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }} onChange={this.handleDateRangeChange} />
              <div className="toolbar-right" />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                {this.state.createWaveEnable && filters.status === 'pending' && <Button size="large" onClick={this.createWave}>创建波次计划</Button>}
                {this.state.createWaveEnable && filters.status === 'pending' && <Button size="large" onClick={this.showAddToWaveModal}>添加到波次计划</Button>}
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table columns={columns} rowSelection={rowSelection} dataSource={dataSource} rowKey="so_no"
                scroll={{ x: columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }} loading={loading}
              />
            </div>
          </div>
        </Content>
        <ShippingDockPanel />
        <OrderDockPanel />
        <DelegationDockPanel />
        <ShipmentDockPanel />
        <AddToWaveModal reload={this.handleReload} selectedRowKeys={this.state.selectedRowKeys} />
      </QueueAnim>
    );
  }
}
