import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, message, Progress } from 'antd';
import moment from 'moment';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { loadDelgBill } from 'common/reducers/cmsManifest';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/search-bar';
import NavLink from 'client/components/nav-link';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

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
  moduleName: 'scv',
})
export default class SCVManifestList extends Component {
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
    width: 110,
    render: (o, record) => {
      if (record.customs_tenant_id === this.props.tenantId && record.bill_status < 5) {
        return <NavLink to={`/scv/manifest/${record.bill_seq_no}`}>{o}</NavLink>;
      } else {
        return <NavLink to={`/clearance/manifest/view/${record.bill_seq_no}`}>{o}</NavLink>;
      }
    },
  }, {
    title: '申报单位',
    dataIndex: 'customs_name',
    width: 160,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: '制单日期',
    width: 90,
    render: (o, record) => (record.id ?
    record.created_date && moment(record.created_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: '进度',
    width: 180,
    render: (o, record) => {
      const perVal = (record.bill_status * 20);
      return (<Progress percent={perVal} strokeWidth={5} showInfo={false} />);
    },
  }, {
    title: '提运单号',
    dataIndex: 'bl_wb_no',
    width: 220,
  }, {
    title: '发票号',
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
  render() {
    const { delgBillList } = this.props;
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
              {this.msg('clearance')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('declManifest')}
            </Breadcrumb.Item>
          </Breadcrumb>
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
                loading={delgBillList.loading} scroll={{ x: 1400 }}
              />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
