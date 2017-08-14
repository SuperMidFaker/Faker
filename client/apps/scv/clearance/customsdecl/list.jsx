import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, Layout, Radio, Tag, message, Badge, Icon } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { loadCustomsDecls } from 'common/reducers/scvClearance';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import DeclStatusPopover from './declStatusPopover';
import NavLink from 'client/components/NavLink';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { CMS_DECL_STATUS } from 'common/constants';
import connectFetch from 'client/common/decorators/connect-fetch';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import RowUpdater from 'client/components/rowUpdater';
import { Logixon } from 'client/components/FontIcon';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  return dispatch(loadCustomsDecls({
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.scvClearance.customsFilters),
    pageSize: state.scvClearance.customsList.pageSize,
    current: state.scvClearance.customsList.current,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    customsList: state.scvClearance.customsList,
    customs: state.scvClearance.customsDeclParams.customs.map(cus => ({
      value: cus.customs_code,
      text: `${cus.customs_name}`,
    })),
    customsFilters: state.scvClearance.customsFilters,
    loading: state.scvClearance.customsDeclLoading,
  }),
  { loadCustomsDecls }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class ScvCustomsDeclList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    customsList: PropTypes.object.isRequired,
    customsFilters: PropTypes.object.isRequired,
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
    width: 160,
  }, {
    title: this.msg('declNo'),
    dataIndex: 'entry_id',
    width: 200,
    render: (entryNO, record) => {
      const ietype = record.i_e_type === 0 ? 'import' : 'export';
      const preEntryLink = (
        <NavLink to={`/clearance/${ietype}/customs/${record.bill_seq_no}/${record.pre_entry_seq_no}`}>
          {record.pre_entry_seq_no}
        </NavLink>);
      switch (record.status) {
        case CMS_DECL_STATUS.proposed.value:
        case CMS_DECL_STATUS.reviewed.value:
          return (
            <span>
              <Tag>预</Tag>
              {preEntryLink}
            </span>);
        case CMS_DECL_STATUS.sent.value:
          return (
            <span>
              <Tag>预</Tag>
              {preEntryLink}
              <PrivilegeCover module="clearance" feature={ietype} action="edit" key="entry_no">
                <RowUpdater onHit={this.handleDeclNoFill} row={record}
                  label={<Icon type="edit" />} tooltip="回填海关编号"
                />
              </PrivilegeCover>
            </span>);
        case CMS_DECL_STATUS.entered.value:
        case CMS_DECL_STATUS.released.value:
          return (
            <span>
              <DeclStatusPopover entryId={entryNO}><Tag color={record.status === CMS_DECL_STATUS.released.value ? 'green' : 'blue'}><Logixon type="customs-o" /></Tag></DeclStatusPopover>
              <NavLink to={`/clearance/${ietype}/customs/${record.bill_seq_no}/${record.pre_entry_seq_no}`}>{entryNO}</NavLink>
            </span>);
        default:
          return <span />;
      }
    },
  }, {
    title: '报关代理',
    dataIndex: 'ccb_name',
    width: 160,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: '提运单号',
    dataIndex: 'bl_wb_no',
    width: 160,
  }, {
    title: '订单号',
    dataIndex: 'order_no',
    width: 160,
  }, {
    title: '明细记录数',
    dataIndex: 'detail_count',
    width: 100,
    render: dc => !isNaN(dc) ? dc : null,
  }, {
    title: '收发货人',
    dataIndex: 'trade_name',
    width: 160,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: '进出口岸',
    dataIndex: 'i_e_port',
    width: 80,
    render: (o) => {
      const cust = this.props.customs.filter(ct => ct.value === o)[0];
      let port = '';
      if (cust) {
        port = cust.text;
      }
      return <TrimSpan text={port} maxLen={14} />;
    },
  }, {
    title: '类型',
    dataIndex: 'sheet_type',
    width: 80,
    render: (o) => {
      if (o === 'CDF') {
        return <Tag color="blue-inverse">报关单</Tag>;
      } else if (o === 'FTZ') {
        return <Tag color="blue">备案清单</Tag>;
      } else {
        return <span />;
      }
    },
  }, {
    title: '状态',
    width: 120,
    dataIndex: 'status',
    render: (ost) => {
      const declkey = Object.keys(CMS_DECL_STATUS).filter(stkey => CMS_DECL_STATUS[stkey].value === ost)[0];
      if (declkey) {
        const decl = CMS_DECL_STATUS[declkey];
        return <Badge status={decl.badge} text={decl.text} />;
      } else {
        return null;
      }
    },
  }, {
    title: '进出口日期',
    dataIndex: 'i_e_date',
    width: 100,
    render: (o, record) => (record.id ?
      record.i_e_date && moment(record.i_e_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 100,
    render: (o, record) => (record.id ?
    record.created_date && moment(record.created_date).format('MM.DD HH:mm') : '-'),
  }, {
    title: '申报时间',
    dataIndex: 'epsend_date',
    width: 100,
    render: (o, record) => (record.id ?
    record.d_date && moment(record.d_date).format('MM.DD HH:mm') : '-'),
  }, {
    title: '申报人员',
    dataIndex: 'epsend_login_name  ',
    width: 100,
  }, {
    title: '回执日期',
    dataIndex: 'backfill_date',
    width: 100,
    render: (o, record) => (record.id ?
    record.backfill_date && moment(record.backfill_date).format('YYYY.MM.DD') : '-'),
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadCustomsDecls(params),
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
      const filter = { ...this.props.customsFilters };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.customsList,
  })
  handleTableLoad = (currentPage, filter) => {
    this.setState({ expandedKeys: [] });
    this.props.loadCustomsDecls({
      ietype: this.props.ietype,
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter || this.props.customsFilters),
      pageSize: this.props.customsList.pageSize,
      current: currentPage || this.props.customsList.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleSearch = (searchVal) => {
    const filters = this.mergeFilters(this.props.customsFilters, searchVal);
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
    if (ev.target.value === this.props.customsFilters.status) {
      return;
    }
    const filter = { ...this.props.customsFilters, status: ev.target.value };
    this.handleTableLoad(1, filter);
  }
  handleIEChange = (e) => {
    if (e.target.value === this.props.customsFilters.ietype) {
      return;
    }
    const filter = { ...this.props.customsFilters, ietype: e.target.value };
    this.handleTableLoad(1, filter);
  }
  render() {
    const { customsList, customsFilters, loading } = this.props;
    this.dataSource.remotes = customsList;
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
              {this.msg('customsDecl')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={customsFilters.ietype} onChange={this.handleIEChange} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="import">{this.msg('clearanceImport')}</RadioButton>
            <RadioButton value="export">{this.msg('clearanceExport')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup value={customsFilters.status} onChange={this.handleRadioChange} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            {Object.keys(CMS_DECL_STATUS).map(declkey =>
              <RadioButton value={declkey} key={declkey}>{CMS_DECL_STATUS[declkey].text}</RadioButton>
            )}
          </RadioGroup>
          <div className="page-header-tools" />
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('customsSearchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout expandable">
              <Table rowSelection={rowSelection} columns={this.columns} rowKey="pre_entry_seq_no" dataSource={this.dataSource}
                loading={loading} scroll={{ x: 1600 }}
              />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
