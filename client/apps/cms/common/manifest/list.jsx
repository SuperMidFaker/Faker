import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Radio, Icon, Progress, message, Popconfirm, Tooltip, notification } from 'antd';
import moment from 'moment';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import ButtonToggle from 'client/components/ButtonToggle';
import connectNav from 'client/common/decorators/connect-nav';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/search-bar';
import DelegationDockPanel from '../dockhub/delegationDockPanel';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import RowUpdater from 'client/components/rowUpdater';
import { loadDelgBill, redoManifest } from 'common/reducers/cmsManifest';
import Templates from './template/templates';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';
import ShipmentDockPanel from '../../../transport/shipment/dock/shipmentDockPanel';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    delgBillList: state.cmsManifest.delgBillList,
    listFilter: state.cmsManifest.listFilter,
    tradeModes: state.cmsManifest.formRequire.tradeModes.map(tm => ({
      value: tm.trade_mode,
      text: `${tm.trade_abbr}`,
    })),
    transModes: state.cmsManifest.formRequire.transModes.map(tm => ({
      value: tm.trans_code,
      text: `${tm.trans_spec}`,
    })),
    customs: state.cmsManifest.formRequire.customs.map(cus => ({
      value: cus.customs_code,
      text: `${cus.customs_name}`,
    })),
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
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    fixed: 'left',
    width: 120,
    render: (o, record) => <a onClick={() => this.handlePreview(o, record)}>{o}</a>,
  }, {
    title: '明细记录数',
    dataIndex: 'detail_count',
    width: 100,
    render: dc => !isNaN(dc) ? dc : null,
  }, {
    title: '报关单位',
    dataIndex: 'customs_name',
    width: 160,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: '制单人',
    dataIndex: 'preparer_name',
    width: 80,
  }, {
    title: '制单日期',
    width: 90,
    render: (o, record) => (record.id ?
    record.created_date && moment(record.created_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: '制单进度',
    width: 180,
    render: (o, record) => <Progress percent={record.bill_status} strokeWidth={5} showInfo={false} />,
  }, {
    title: '委托方',
    dataIndex: 'send_name',
    width: 220,
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '提运单号',
    dataIndex: 'bl_wb_no',
    width: 220,
  }, {
    title: '订单号',
    width: 140,
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
          <RowUpdater onHit={this.handleDelegationMake} label={<span><Icon type="edit" /> 编辑</span>} row={record} />
        );
      } else if (record.bill_status === 100) {
        return (
          <span>
            <RowUpdater onHit={this.handleDelegationView} label={<span><Icon type="eye-o" /> 查看</span>} row={record} />
            { record.revertable && <span className="ant-divider" />}
            { record.revertable && (<Popconfirm title="确定操作?" placement="topRight" onConfirm={() => this.handleManifestRedo(record)}>
              <Tooltip title="删除已生成的报关建议书，重新修改" placement="bottomLeft">
                <a role="button"><Icon type="reload" /></a>
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
    const filters = this.mergeFilters(this.props.listFilter, searchVal);
    this.handleTableLoad(1, filters);
  }
  mergeFilters(curFilters, value) {
    const newFilters = {};
    Object.keys(curFilters).forEach((key) => {
      if (key !== 'filterNo') {
        newFilters[key] = curFilters[key];
      }
    });
    if (value !== null && value !== undefined && value !== '') {
      newFilters.filterNo = value;
    }
    return newFilters;
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
  render() {
    const { delgBillList, listFilter } = this.props;
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
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.props.ietype === 'import' ? this.msg('importClearance') : this.msg('exportClearance')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Icon type="file-text" /> {this.msg('declManifest')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} size="large">
              <RadioButton value="all">{this.msg('all')}</RadioButton>
              <RadioButton value="wip">{this.msg('filterWIP')}</RadioButton>
              <RadioButton value="generated">{this.msg('filterGenerated')}</RadioButton>
            </RadioGroup>
            <div className="top-bar-tools">
              <ButtonToggle size="large" iconOff="book" iconOn="book" onClick={this.toggleRightSider} />
            </div>
          </Header>
          <Content className="main-content">
            <QueueAnim type={['bottom', 'up']}>
              <div className="page-body" key="body">
                <div className="toolbar">
                  <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
                  <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                    <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                  </div>
                </div>
                <div className="panel-body table-panel">
                  <Table rowSelection={rowSelection} columns={this.columns} rowKey="delg_no" dataSource={this.dataSource}
                    loading={delgBillList.loading} scroll={{ x: 1800 }}
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
              <h3>清单模板</h3>
            </div>
            <Templates ietype={this.props.ietype} />
          </div>
        </Sider>
      </Layout>
    );
  }
}
