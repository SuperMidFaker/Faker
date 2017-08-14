import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Radio, message, Progress } from 'antd';
import moment from 'moment';
import QueueAnim from 'rc-queue-anim';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import Table from 'client/components/remoteAntTable';
import { loadManifests, loadManifestTableParams } from 'common/reducers/scvClearance';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import NavLink from 'client/components/nav-link';
import { formatMsg } from '../message.i18n';

const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  return [
    dispatch(loadManifestTableParams()),
    dispatch(loadManifests({
      tenantId: state.account.tenantId,
      filter: JSON.stringify(state.scvClearance.manifestFilters),
      pageSize: state.scvClearance.manifestList.pageSize,
      current: state.scvClearance.manifestList.current,
    }))];
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loading: state.scvClearance.manifestLoading,
    manifestList: state.scvClearance.manifestList,
    filters: state.scvClearance.manifestFilters,
    tradeModes: state.scvClearance.manifestParams.tradeModes,
    transModes: state.scvClearance.manifestParams.transModes,
    customs: state.scvClearance.manifestParams.customs,
  }),
  { loadManifests }
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
    manifestList: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }

  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('billSeqNo'),
    dataIndex: 'bill_seq_no',
    // fixed: 'left',
    width: 160,
    render: (o, record) => {
      const iePath = record.i_e_type === 0 ? 'import' : 'export';
      return <NavLink to={`/clearance/${iePath}/manifest/view/${record.bill_seq_no}`}>{o}</NavLink>;
    },
  }, {
    title: '申报单位',
    dataIndex: 'ccb_name',
    width: 180,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: '提运单号',
    dataIndex: 'bl_wb_no',
    width: 100,
  }, {
    title: '订单号',
    dataIndex: 'order_no',
    width: 100,
  }, {
    title: '明细记录数',
    dataIndex: 'detail_count',
    width: 100,
    render: dc => !isNaN(dc) ? dc : null,
  }, {
    title: '制单日期',
    width: 90,
    render: (o, record) => (record.id ?
    record.created_date && moment(record.created_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: '进度',
    width: 180,
    dataIndex: 'bill_status',
    render: progress => <Progress percent={progress} strokeWidth={5} showInfo={false} />,
  }, {
    title: '发票号',
    dataIndex: 'invoice_no',
    width: 180,
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
    fetcher: params => this.props.loadManifests(params),
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
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      const filter = { ...this.props.filters };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.manifestList,
  })
  handleTableLoad = (currentPage, filter) => {
    this.setState({ expandedKeys: [] });
    this.props.loadManifests({
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter || this.props.listFilter),
      pageSize: this.props.manifestList.pageSize,
      current: currentPage || this.props.manifestList.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleIeChange = (ev) => {
    const filters = { ...this.props.filters, ietype: ev.target.value };
    this.handleTableLoad(1, filters);
  }
  handleStatusChange = (ev) => {
    const filters = { ...this.props.filters, status: ev.target.value };
    this.handleTableLoad(1, filters);
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.filters, filterNo: searchVal };
    this.handleTableLoad(1, filters);
  }
  render() {
    const { manifestList, filters, loading } = this.props;
    this.dataSource.remotes = manifestList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('clearance')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('declManifest')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleIeChange} size="large" value={filters.ietype}>
            <RadioButton value="all">{this.msg('filterAll')}</RadioButton>
            <RadioButton value="import">进口</RadioButton>
            <RadioButton value="export">出口</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup value={filters.status} onChange={this.handleStatusChange} size="large">
            <RadioButton value="all">{this.msg('filterAll')}</RadioButton>
            <RadioButton value="wip">{this.msg('filterWIP')}</RadioButton>
            <RadioButton value="generated">{this.msg('filterGenerated')}</RadioButton>
          </RadioGroup>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('maniSearchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout expandable">
              <Table rowSelection={rowSelection} columns={this.columns} rowKey="id" dataSource={this.dataSource}
                loading={loading} scroll={{ x: 1630 }}
              />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
