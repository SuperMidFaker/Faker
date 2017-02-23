import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Radio, message, Tag } from 'antd';
import moment from 'moment';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { loadDelgBill } from 'common/reducers/cmsManifest';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/search-bar';
import NavLink from 'client/components/nav-link';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

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
  }),
  { loadDelgBill }
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
    title: this.msg('billNo'),
    dataIndex: 'bill_seq_no',
    fixed: 'left',
    width: 170,
    render: o => <NavLink to={`/clearance/${this.props.ietype}/manifest/${o}`}>{o}</NavLink>,
  }, {
    title: '委托方',
    dataIndex: 'send_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '申报单位',
    dataIndex: 'customs_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '订单号',
    dataIndex: 'contr_no',
  }, {
    title: '提运单号',
    dataIndex: 'bl_wb_no',
  }, {
    title: '发票号',
    dataIndex: 'invoice_no',
  }, {
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
  }, {
    title: '检验检疫',
    width: 100,
    dataIndex: 'ciq_inspect',
    render: (o) => {
      if (o === 'NL') {
        return <Tag color="#ccc">一般报检</Tag>;
      } else if (o === 'LA' || o === 'LB') {
        return <Tag color="#fa0">法定检验</Tag>;
      }
      return <span />;
    },
  }, {
    title: '监管方式',
    dataIndex: 'trade_mode',
  }, {
    title: '运输方式',
    dataIndex: 'traf_mode',
  }, {
    title: '进出口岸',
    dataIndex: 'i_e_port',
  }, {
    title: '创建时间',
    render: (o, record) => (record.id ?
    record.created_date && moment(record.created_date).format('MM.DD HH:mm') : '-'),
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
              <Table rowSelection={rowSelection} columns={this.columns} rowKey="pre_entry_seq_no" dataSource={this.dataSource}
                loading={delgBillList.loading} scroll={{ x: 1000 }}
              />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
