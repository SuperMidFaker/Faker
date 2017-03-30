import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Radio, Progress, message, Popconfirm } from 'antd';
import moment from 'moment';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { loadDelgBill, deleteEntries } from 'common/reducers/cmsManifest';
import { loadBillForMake } from 'common/reducers/cmsDelegation';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/search-bar';
import DelegationInfoHubPanel from '../modals/DelegationInfoHubPanel';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import RowUpdater from 'client/components/rowUpdater';

const formatMsg = format(messages);
const { Header, Content } = Layout;
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
  { loadDelgBill, deleteEntries, loadBillForMake, showPreviewer }
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
    selectedRowKeys: [],
    searchInput: '',
  }

  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    fixed: 'left',
    width: 150,
    render: (o, record) =>
      // if (record.customs_tenant_id === this.props.tenantId && record.bill_status < 5) {
      //   return <NavLink to={`/clearance/${this.props.ietype}/manifest/${record.bill_seq_no}`}>{o}</NavLink>;
      // } else {
      //   return <NavLink to={`/clearance/${this.props.ietype}/manifest/view/${record.bill_seq_no}`}>{o}</NavLink>;
      // }
      <a onClick={() => this.handlePreview(o, record)}>{o}</a>,
  }, {
    title: '申报单位',
    dataIndex: 'customs_name',
    width: 160,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: '制单人',
    dataIndex: 'creater_name',
    width: 80,
  }, {
    title: '制单日期',
    width: 90,
    render: (o, record) => (record.id ?
    record.created_date && moment(record.created_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: '进度',
    width: 180,
    render: (o, record) => {
      const perVal = (record.bill_status * 25);
      return (<Progress percent={perVal} strokeWidth={5} showInfo={false} />);
    },
  }, {
    title: '委托方',
    dataIndex: 'send_name',
    width: 160,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: '提运单号',
    dataIndex: 'bl_wb_no',
    width: 220,
  }, {
    title: '发票号',
    width: 220,
    dataIndex: 'invoice_no',
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
    width: 100,
    render: (o) => {
      const cust = this.props.customs.filter(ct => ct.value === o)[0];
      let port = '';
      if (cust) {
        port = cust.text;
      }
      return <TrimSpan text={port} maxLen={14} />;
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
  }
  handleDelegationMake = (row) => {
    this.props.loadBillForMake(row.delg_no).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        const link = `/clearance/${this.props.ietype}/manifest/`;
        this.context.router.push(`${link}${row.bill_seq_no}`);
      }
    });
  }
  handleDelegationView = (row) => {
    this.props.loadBillForMake(row.delg_no).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        const link = `/clearance/${this.props.ietype}/manifest/view/`;
        this.context.router.push(`${link}${row.bill_seq_no}`);
      }
    });
  }
  handleDelegationRedo = (row) => {
    this.props.deleteEntries(row.bill_seq_no).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.handleTableLoad();
      }
    });
  }
  render() {
    const { delgBillList, listFilter, tenantId } = this.props;
    this.dataSource.remotes = delgBillList;
    let columns = [];
    columns = [...this.columns];
    columns.push({
      title: this.msg('opColumn'),
      width: 130,
      fixed: 'right',
      render: (o, record) => {
        if (record.customs_tenant_id === tenantId || record.customs_tenant_id === -1) {
          if (record.bill_status < 3) {
            return (
              <RowUpdater onHit={this.handleDelegationMake} label="编辑清单" row={record} />
            );
          } else if (record.bill_status >= 3 && record.entry_status === 0) {
            return (
              <span>
                <RowUpdater onHit={this.handleDelegationView} label="查看清单" row={record} />
                <span className="ant-divider" />
                <Popconfirm title="确定需要重新制单吗?" onConfirm={() => this.handleDelegationRedo(record)}>
                  <a role="button">重新制单</a>
                </Popconfirm>
              </span>
            );
          } else if (record.bill_status >= 3 && record.entry_status === 1) {
            return (
              <RowUpdater onHit={this.handleDelegationView} label="查看清单" row={record} />
            );
          }
        } else {
          return (
            <RowUpdater onHit={this.handleDelegationView} label="查看清单" row={record} />
          );
        }
      },
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.props.ietype === 'import' ? this.msg('importClearance') : this.msg('exportClearance')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('declManifest')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="wip">{this.msg('filterWIP')}</RadioButton>
            <RadioButton value="generated">{this.msg('filterGenerated')}</RadioButton>
          </RadioGroup>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel expandable">
              <Table rowSelection={rowSelection} columns={columns} rowKey="pre_entry_seq_no" dataSource={this.dataSource}
                loading={delgBillList.loading} scroll={{ x: 1800 }}
              />
            </div>
          </div>
        </Content>
        <DelegationInfoHubPanel ietype={this.props.ietype} />
      </QueueAnim>
    );
  }
}
