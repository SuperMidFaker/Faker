import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, Layout, Radio, Tag, message, Badge } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { loadDelgDecls, deleteDecl, setFilterReviewed } from 'common/reducers/cmsDeclare';
import { openEfModal } from 'common/reducers/cmsDelegation';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/search-bar';
import NavLink from 'client/components/nav-link';
import { format } from 'client/common/i18n/helpers';
import DeclStatusPopover from './declStatusPopover';
import messages from '../message.i18n';
import { DECL_STATUS, CMS_DECL_STATUS } from 'common/constants';

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
    delgdeclList: state.cmsDeclare.delgdeclList,
    listFilter: state.cmsDeclare.listFilter,
    customs: state.cmsDeclare.customs.map(cus => ({
      value: cus.customs_code,
      text: `${cus.customs_name}`,
    })),
  }),
  { loadDelgDecls, openEfModal, deleteDecl, setFilterReviewed }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class DelgDeclList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    delgdeclList: PropTypes.object.isRequired,
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
    title: this.msg('preEntryNo'),
    dataIndex: 'pre_entry_seq_no',
    fixed: 'left',
    width: 160,
    render: o => <NavLink to={`/scv/clearance/cds/${o}`}>{o}</NavLink>,
  }, {
    title: this.msg('entryId'),
    dataIndex: 'entry_id',
    width: 160,
    fixed: 'left',
    render: (o, record) => {
      // 用id字段表示为children数据
      if (record.id) {
        if (o) {
          return (
            <DeclStatusPopover results={record.results} entryId={o}>
              {o}
            </DeclStatusPopover>
          );
        }
      }
    },
  }, {
    title: '收发货人',
    dataIndex: 'trade_name',
    width: 160,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('agent'),
    dataIndex: 'customs_name',
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
    render: (o) => {
      const decl = CMS_DECL_STATUS.filter(st => st.value === o)[0];
      if (o === 0) {
        return <Badge status="default" text={decl && decl.text} />;
      } else if (o === 1) {
        return <Badge status="warning" text={decl && decl.text} />;
      } else if (o === 2) {
        return <Badge status="processing" text={decl && decl.text} />;
      } else if (o === 3) {
        return <Badge status="success" text={decl && decl.text} />;
      }
    },
  }, {
    title: '进出口日期',
    dataIndex: 'i_e_date',
    render: (o, record) => (record.id ?
      record.i_e_date && moment(record.i_e_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    render: (o, record) => (record.id ?
    record.created_date && moment(record.created_date).format('MM.DD HH:mm') : '-'),
  }, {
    title: '申报时间',
    dataIndex: 'd_date',
    render: (o, record) => (record.id ?
    record.d_date && moment(record.d_date).format('MM.DD HH:mm') : '-'),
  }, {
    title: '申报人',
    dataIndex: 'creater_login_id  ',
  }, {
    title: '回填日期',
    dataIndex: 'backfill_date',
    render: (o, record) => (record.id ?
    record.backfill_date && moment(record.backfill_date).format('YYYY.MM.DD') : '-'),
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadDelgDecls(params),
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
    remotes: this.props.delgdeclList,
  })
  handleTableLoad = (currentPage, filter) => {
    this.setState({ expandedKeys: [] });
    this.props.loadDelgDecls({
      ietype: this.props.ietype,
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter || this.props.listFilter),
      pageSize: this.props.delgdeclList.pageSize,
      currentPage: currentPage || this.props.delgdeclList.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleDeclNoFill = (row) => {
    this.props.openEfModal({
      entryHeadId: row.id,
      billSeqNo: row.bill_seq_no,
      delgNo: row.delg_no,
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
  handleDelete = (declId, billNo) => {
    this.props.deleteDecl(declId, billNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleReview = (row) => {
    this.props.setFilterReviewed(row.id, DECL_STATUS.reviewed).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleRecall = (row) => {
    this.props.setFilterReviewed(row.id, DECL_STATUS.proposed).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleSend = () => {

  }
  render() {
    const { delgdeclList, listFilter } = this.props;
    this.dataSource.remotes = delgdeclList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    let columns = [];
    columns = [...this.columns];
    columns.push({
      title: this.msg('opColumn'),
      width: 130,
      fixed: 'right',
      render: (o, record) => {
        if (record.status === 0) {
          return (
            <span />
          );
        } else if (record.status === 1) {
          return (
            <span />
          );
        }
      },
    });
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('clearance')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('customsDecl')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleIEChange} size="large">
            <RadioButton value="import">{this.msg('clearanceImport')}</RadioButton>
            <RadioButton value="export">{this.msg('clearanceExport')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup onChange={this.handleTypeChange} size="large">
            <RadioButton value="cdf">{this.msg('declCDF')}</RadioButton>
            <RadioButton value="ftz">{this.msg('declFTZ')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="proposed">{this.msg('filterProposed')}</RadioButton>
            <RadioButton value="reviewed">{this.msg('filterReviewed')}</RadioButton>
            <RadioButton value="declared">{this.msg('filterDeclared')}</RadioButton>
            <RadioButton value="finalized">{this.msg('filterFinalized')}</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools" />
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
                loading={delgdeclList.loading} scroll={{ x: 1600 }}
              />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
