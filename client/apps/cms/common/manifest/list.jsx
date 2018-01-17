import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, DatePicker, Layout, Radio, Icon, Progress, message, Popconfirm, Tooltip, notification, Select } from 'antd';
import moment from 'moment';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import ButtonToggle from 'client/components/ButtonToggle';
import connectNav from 'client/common/decorators/connect-nav';
import { showPreviewer } from 'common/reducers/cmsDelegationDock';
import TrimSpan from 'client/components/trimSpan';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import { loadDelgBill, redoManifest } from 'common/reducers/cmsManifest';
import Templates from './template/templates';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';
import ShipmentDockPanel from '../../../transport/shipment/dock/shipmentDockPanel';
import DelegationDockPanel from '../dock/delegationDockPanel';
import { formatMsg } from '../message.i18n';


const { Header, Content, Sider } = Layout;

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Option } = Select;
const { OptGroup } = Select;
const { RangePicker } = DatePicker;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    delgBillList: state.cmsManifest.delgBillList,
    listFilter: state.cmsManifest.listFilter,
    clients: state.partner.partners,
    tradeModes: state.cmsManifest.formRequire.tradeModes,
    transModes: state.cmsManifest.formRequire.transModes,
    customs: state.cmsManifest.formRequire.customs,
  }),
  { loadDelgBill, redoManifest, showPreviewer }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class ManifestList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    delgBillList: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    showPreviewer: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    rightSiderCollapsed: true,
    selectedRowKeys: [],
    searchInput: '',
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    fixed: 'left',
    width: 120,
    render: (o, record) => <a onClick={() => this.handlePreview(o, record)}>{o}</a>,
  }, {
    title: '报关代理',
    dataIndex: 'customs_name',
    width: 160,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: '制单人员',
    dataIndex: 'preparer_name',
    width: 80,
  }, {
    title: '制单日期',
    width: 90,
    render: (o, record) => (record.id ?
      record.created_date && moment(record.created_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: <Tooltip title="表体记录数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'detail_count',
    width: 50,
    render: dc => (!isNaN(dc) ? dc : null),
  }, {
    title: '制单进度',
    width: 180,
    render: (o, record) => <Progress percent={record.bill_status} strokeWidth={5} />,
  }, {
    title: '客户',
    dataIndex: 'send_name',
    width: 220,
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '提运单号',
    dataIndex: 'bl_wb_no',
    width: 220,
  }, {
    title: '客户单号',
    width: 160,
    dataIndex: 'order_no',
  }, {
    title: '监管方式',
    dataIndex: 'trade_mode',
    width: 120,
    render: (o) => {
      const tradeMd = this.props.tradeModes.filter(tm => tm.value === o)[0];
      let trade = '';
      if (tradeMd) {
        trade = tradeMd.text;
      }
      return <TrimSpan text={trade} maxLen={14} />;
    },
  }, {
    title: '运输方式',
    dataIndex: 'traf_mode',
    width: 100,
    render: (o) => {
      const transMd = this.props.transModes.filter(tm => tm.value === o)[0];
      let trans = '';
      if (transMd) {
        trans = transMd.text;
      }
      return <TrimSpan text={trans} maxLen={14} />;
    },
  }, {
    title: '进出口岸',
    dataIndex: 'i_e_port',
    render: (o) => {
      const cust = this.props.customs.filter(ct => ct.value === o)[0];
      let port = '';
      if (cust) {
        port = cust.text;
      }
      return <TrimSpan text={port} maxLen={14} />;
    },
  }, {
    title: this.msg('opColumn'),
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.bill_status < 100) {
        return (
          <RowAction onClick={this.handleDelegationMake} label={<span><Icon type="edit" /> 编辑</span>} row={record} />
        );
      } else if (record.bill_status === 100) {
        return (
          <span>
            <RowAction onClick={this.handleDelegationView} label={<span><Icon type="eye-o" /> 查看</span>} row={record} />
            { record.revertable && <span className="ant-divider" />}
            { record.revertable && (<Popconfirm title="确定操作?" placement="topRight" onConfirm={() => this.handleManifestRedo(record)}>
              <Tooltip title="删除已生成的报关建议书，重新修改" placement="bottomLeft">
                <a role="presentation"><Icon type="reload" /></a>
              </Tooltip>
            </Popconfirm>)}
          </span>
        );
      }
    },
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadDelgBill(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        ietype: this.props.ietype,
        tenantId: this.props.tenantId,
        loginId: this.props.loginId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.delgBillList,
  })
  toggleRightSider = () => {
    this.setState({
      rightSiderCollapsed: !this.state.rightSiderCollapsed,
    });
  }
  handlePreview = (delgNo, record) => {
    let tabKey = 'customsDecl';
    if (record.status < 1) {
      tabKey = 'basic';
    }
    this.props.showPreviewer(delgNo, tabKey);
  }
  handleTableLoad = (currentPage, filter) => {
    this.setState({ expandedKeys: [] });
    this.props.loadDelgBill({
      ietype: this.props.ietype,
      tenantId: this.props.tenantId,
      loginId: this.props.loginId,
      filter: JSON.stringify(filter || this.props.listFilter),
      pageSize: this.props.delgBillList.pageSize,
      currentPage: currentPage || this.props.delgBillList.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.listFilter, filterNo: searchVal };
    this.handleTableLoad(1, filters);
  }
  handleClientSelectChange = (value) => {
    const clientView = { tenantIds: [], partnerIds: [] };
    if (value !== 'all') {
      const client = this.props.clients.find(clt => clt.partner_id === value);
      if (client.tid !== -1) {
        clientView.tenantIds.push(client.tid);
      } else {
        clientView.partnerIds.push(client.partner_id);
      }
    }
    const filters = { ...this.props.listFilter, clientView };
    this.handleTableLoad(1, filters);
  }
  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleTableLoad(1, filter);
    this.setState({ selectedRowKeys: [] });
  }
  handleDelegationMake = (row) => {
    const link = `/clearance/${this.props.ietype}/manifest/`;
    this.context.router.push(`${link}${row.bill_seq_no}`);
  }
  handleDelegationView = (row) => {
    const link = `/clearance/${this.props.ietype}/manifest/view/`;
    this.context.router.push(`${link}${row.bill_seq_no}`);
  }
  handleManifestRedo = (row) => {
    this.props.redoManifest(row.delg_no, row.bill_seq_no).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.openNotification(row.delg_no, row.bill_seq_no);
        this.handleTableLoad();
      }
    });
  }
  handleNotificationClose = (billSeqNo) => {
    const link = `/clearance/${this.props.ietype}/manifest/`;
    this.context.router.push(`${link}${billSeqNo}`);
  }
  openNotification = (delgNo, billSeqNo) => {
    const key = `open${Date.now()}`;
    notification.open({
      message: '已经重新制单',
      description: `${delgNo}已经重新进入制单中，如需查看请点击"进入"`,
      icon: <Icon type="check-circle-o" style={{ color: '#5bc52f' }} />,
      btn: <a onClick={() => { notification.close(key); this.handleNotificationClose(billSeqNo); }}>进入</a>,
      key,
    });
  }
  handleDateRangeChange = (value, dateString) => {
    const filters = { ...this.props.listFilter, acptDate: dateString };
    this.handleTableLoad(1, filters);
  }
  handleViewChange = (value) => {
    const filters = { ...this.props.listFilter, viewStatus: value };
    this.handleTableLoad(1, filters);
  }
  render() {
    const { delgBillList, listFilter, clients } = this.props;
    this.dataSource.remotes = delgBillList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <Layout>
        <Layout>
          <Header className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.props.ietype === 'import' ? this.msg('importClearance') : this.msg('exportClearance')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('declManifest')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} >
              <RadioButton value="all">{this.msg('all')}</RadioButton>
              <RadioButton value="wip">{this.msg('filterWIP')}</RadioButton>
              <RadioButton value="generated">{this.msg('filterGenerated')}</RadioButton>
            </RadioGroup>
            <div className="page-header-tools">
              <ButtonToggle iconOff="book" iconOn="book" onClick={this.toggleRightSider} >模板</ButtonToggle>
            </div>
          </Header>
          <Content className="main-content">
            <QueueAnim type={['bottom', 'up']}>
              <div className="page-body" key="body">
                <div className="toolbar">
                  <SearchBox placeholder={this.msg('searchPlaceholder')} onSearch={this.handleSearch} />
                  <span />
                  <Select
                    showSearch
                    optionFilterProp="children"
                    style={{ width: 160 }}
                    onChange={this.handleClientSelectChange}
                    defaultValue="all"
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{ width: 360 }}
                  >
                    <Option value="all">全部客户</Option>
                    {clients.map(data => (<Option
                      key={data.partner_id}
                      value={data.partner_id}
                      search={`${data.partner_code}${data.name}`}
                    >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
                    </Option>))}
                  </Select>
                  <span />
                  <Select
                    value={listFilter.viewStatus}
                    style={{ width: 160 }}
                    showSearch={false}
                    onChange={this.handleViewChange}
                  >
                    <OptGroup label="常用视图">
                      <Option value="all">全部清单</Option>
                      <Option value="my">我负责的清单</Option>
                    </OptGroup>
                  </Select>
                  <span />
                  <RangePicker
                    ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
                    onChange={this.handleDateRangeChange}
                  />
                  <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                    <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                  </div>
                </div>
                <div className="panel-body table-panel table-fixed-layout">
                  <Table
                    rowSelection={rowSelection}
                    columns={this.columns}
                    rowKey="delg_no"
                    dataSource={this.dataSource}
                    loading={delgBillList.loading}
                    scroll={{ x: 1800 }}
                  />
                </div>
              </div>
            </QueueAnim>
          </Content>
          <DelegationDockPanel ietype={this.props.ietype} />
          <OrderDockPanel />
          <ShipmentDockPanel />
        </Layout>
        <Sider
          trigger={null}
          defaultCollapsed
          collapsible
          collapsed={this.state.rightSiderCollapsed}
          width={480}
          collapsedWidth={0}
          className="right-sider"
        >
          <div className="right-sider-panel">
            <div className="panel-header">
              <h3>制单规则</h3>
            </div>
            <Templates ietype={this.props.ietype} />
          </div>
        </Sider>
      </Layout>
    );
  }
}
