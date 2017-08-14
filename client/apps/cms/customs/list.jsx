import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, DatePicker, Dropdown, Menu, Icon, Layout, Radio, Tag, Tooltip, message, Popconfirm, Badge, Button, Select, Popover } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadCustomsDecls, deleteDecl, setDeclReviewed, showSendDeclModal, openDeclReleasedModal, showBatchSendModal } from 'common/reducers/cmsDeclare';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import { openEfModal } from 'common/reducers/cmsDelegation';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import NavLink from 'client/components/NavLink';
import RowUpdater from 'client/components/rowUpdater';
import FillCustomsNoModal from '../common/customs/modals/fillCustomsNoModal';
import DeclReleasedModal from '../common/customs/modals/declReleasedModal';
import DeclStatusPopover from '../common/customs/declStatusPopover';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { CMS_DECL_STATUS, CMS_DECL_TYPE } from 'common/constants';
import SendModal from '../common/customs/modals/sendModal';
import DelegationDockPanel from '../common/dock/delegationDockPanel';
import OrderDockPanel from 'client/apps/scof/orders/docks/orderDockPanel';
import ShipmentDockPanel from 'client/apps/transport/shipment/dock/shipmentDockPanel';
import BatchSendModal from '../common/customs/modals/batchSendModal';
import { Logixon, Fontello } from 'client/components/FontIcon';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const RangePicker = DatePicker.RangePicker;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    customslist: state.cmsDeclare.customslist,
    listFilter: state.cmsDeclare.listFilter,
    customs: state.cmsDeclare.customs.map(cus => ({
      value: cus.customs_code,
      text: cus.customs_name,
    })),
    trades: state.cmsDeclare.trades,
  }),
  { loadCustomsDecls,
    openEfModal,
    deleteDecl,
    setDeclReviewed,
    showSendDeclModal,
    showPreviewer,
    openDeclReleasedModal,
    showBatchSendModal }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class CustomsList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    // ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    customslist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    showSendDeclModal: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  componentDidMount() {
    let filters = { status: 'all', filterDate: [] };
    if (window.location.search.indexOf('inspect') > 0) {
      filters = { status: 'inspect' };
      if (window.localStorage && window.localStorage.cmsDelegationListFilters) {
        const listFilters = JSON.parse(window.localStorage.cmsDelegationListFilters);
        filters = { ...filters, filterDate: listFilters.acptDate };
      }
    }
    this.handleTableLoad(this.props.customslist.current, { ...this.props.listFilter, ...filters, filterNo: '' });
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 120,
    fixed: 'left',
    render: (o, record) => (
      <a onClick={() => this.handlePreview(o, record)}>
        {o}
      </a>),
  }, {
    title: this.msg('orderNo'),
    width: 180,
    dataIndex: 'order_no',
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: this.msg('declNo'),
    dataIndex: 'entry_id',
    width: 180,
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
              {preEntryLink}
            </span>);
        case CMS_DECL_STATUS.sent.value:
          return (
            <span>
              {preEntryLink}
              <PrivilegeCover module="clearance" feature="customs" action="edit" key="entry_no">
                <RowUpdater onHit={this.handleDeclNoFill} row={record}
                  label={<Icon type="edit" />} tooltip="回填海关编号"
                />
              </PrivilegeCover>
            </span>);
        case CMS_DECL_STATUS.entered.value:
        case CMS_DECL_STATUS.released.value:
          return (<NavLink to={`/clearance/${ietype}/customs/${record.bill_seq_no}/${record.pre_entry_seq_no}`}>{entryNO}</NavLink>);
        default:
          return <span />;
      }
    },
  }, {
    title: '类型',
    dataIndex: 'sheet_type',
    width: 100,
    render: (o, record) => {
      let child = <span />;
      if (record.i_e_type === 0) {
        if (o === 'CDF') {
          child = <Tag color="blue">进口报关单</Tag>;
        } else if (o === 'FTZ') {
          child = <Tag color="blue">进境备案清单</Tag>;
        }
      } else if (record.i_e_type === 1) {
        if (o === 'CDF') {
          child = <Tag color="cyan">出口报关单</Tag>;
        } else if (o === 'FTZ') {
          child = <Tag color="cyan">出境备案清单</Tag>;
        }
      }
      let entryDecType = '';
      if (record.pre_entry_dec_type !== null) {
        const decltype = CMS_DECL_TYPE.filter(ty => ty.value === (record.pre_entry_dec_type).toString())[0];
        entryDecType = decltype ? decltype.text : '';
        const content = (
          <div>
            <p>{`${entryDecType}`}</p>
            <p>{`${record.pre_entry_user_info || ''}`}</p>
          </div>
        );
        return <Popover placement="right" content={content}>{child}</Popover>;
      }
      return child;
    },
  }, {
    title: <Tooltip title="明细记录数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'detail_count',
    width: 50,
    render: dc => !isNaN(dc) ? dc : null,
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (ost, record) => {
      const declkey = Object.keys(CMS_DECL_STATUS).filter(stkey => CMS_DECL_STATUS[stkey].value === ost)[0];
      if (declkey) {
        const decl = CMS_DECL_STATUS[declkey];
        if (record.status > CMS_DECL_STATUS.sent.value) {
          return (<span><Badge status={decl.badge} text={decl.text} />
            <DeclStatusPopover entryId={record.entry_id}><a role="presentation"><Logixon type="customs-o" /></a></DeclStatusPopover>
          </span>);
        }

        return <Badge status={decl.badge} text={decl.text} />;
      } else {
        return null;
      }
    },
  }, {
    title: '海关查验',
    dataIndex: 'customs_inspect',
    className: 'cell-align-center',
    width: 80,
    render: (o, record) => {
      if (record.status > CMS_DECL_STATUS.sent.value) {
        if (record.customs_inspect === 1) {
          return <Tooltip title="报关单查验"><span><Fontello type="circle" color="red" /></span></Tooltip>;
        } else if (record.customs_inspect === 2) {
          return <Tooltip title="查验放行"><span><Fontello type="circle" color="green" /></span></Tooltip>;
        } else {
          return <Tooltip title="未查验"><span><Fontello type="circle" color="gray" /></span></Tooltip>;
        }
      } else {
        return null;
      }
    },
  }, {
    title: '收发货人',
    dataIndex: 'trade_name',
    width: 180,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: '进/出口口岸',
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
    title: '进/出口日期',
    dataIndex: 'i_e_date',
    width: 100,
    render: (o, record) => (record.id ?
      record.i_e_date && moment(record.i_e_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: '制单时间',
    dataIndex: 'created_date',
    width: 100,
    render: createdt => (createdt ? moment(createdt).format('MM.DD HH:mm') : '-'),
  }, {
    title: '发送时间',
    dataIndex: 'epsend_date',
    width: 100,
    render: sendDate => (sendDate ? moment(sendDate).format('MM.DD HH:mm') : '-'),
  }, {
    title: '回执时间',
    dataIndex: 'backfill_date',
    width: 100,
    render: backdt => (backdt ? moment(backdt).format('MM.DD HH:mm') : '-'),
  }, {
    title: '放行时间',
    dataIndex: 'clear_date',
    width: 100,
    render: clearDate => (clearDate ? moment(clearDate).format('MM.DD HH:mm') : '-'),
  }, {
    title: '申报单位',
    dataIndex: 'agent_name',
    width: 180,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: '报关人员',
    dataIndex: 'epsend_login_name',
    width: 100,
  }, {
    title: this.msg('opColumn'),
    width: 140,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === CMS_DECL_STATUS.proposed.value) {
        return (
          <span>
            <PrivilegeCover module="clearance" feature="customs" action="edit">
              <RowUpdater onHit={this.handleReview} label={<span><Icon type="check-circle-o" /> {this.msg('review')}</span>} row={record} />
            </PrivilegeCover>
          </span>
        );
      } else if (record.status === CMS_DECL_STATUS.reviewed.value) {
        return (
          <span>
            <PrivilegeCover module="clearance" feature="customs" action="edit">
              <RowUpdater onHit={this.handleShowSendDeclModal} label={<span><Icon type="mail" /> {this.msg('sendPackets')}</span>} row={record} />
            </PrivilegeCover>
            <span className="ant-divider" />
            <PrivilegeCover module="clearance" feature="customs" action="edit">
              <RowUpdater onHit={this.handleShowDeclReleasedModal} label={<span><Icon type="flag" />标记放行</span>} row={record} />
            </PrivilegeCover>
            <span className="ant-divider" />
            <PrivilegeCover module="clearance" feature="customs" action="edit">
              <RowUpdater onHit={this.handleRecall} label={<span><Icon type="left-circle-o" />{this.msg('recall')}</span>} row={record} />
            </PrivilegeCover>
          </span>
        );
      } else {
        const spanElems = [];
        if (record.status !== CMS_DECL_STATUS.released.value) {
          spanElems.push(
            <PrivilegeCover module="clearance" feature="customs" action="edit" key="clear">
              <RowUpdater onHit={this.handleShowDeclReleasedModal} row={record}
                label={<span><Icon type="flag" />放行确认</span>}
              />
            </PrivilegeCover>);
        }
        if (record.ep_send_filename && record.status === CMS_DECL_STATUS.sent.value) {
          spanElems.push(
            <Dropdown key="epsend" overlay={(
              <Menu>
                <Menu.Item key="edit">
                  <a role="presentation" onClick={() => this.handleEpSendXmlView(record.ep_send_filename)}><Icon type="eye-o" /> EDI报文</a>
                </Menu.Item>
              </Menu>)}
            >
              <a><Icon type="down" /></a>
            </Dropdown>);
        } else if (record.ep_receipt_filename && record.status === CMS_DECL_STATUS.entered.value) {
          spanElems.push(
            <Dropdown key="receipt" overlay={(<Menu>
              <Menu.Item key="edit">
                <a role="presentation" onClick={() => this.handleEpRecvXmlView(record.ep_receipt_filename)}><Icon type="eye-o" /> EDI回执</a>
              </Menu.Item>
            </Menu>)}
            >
              <a><Icon type="down" /></a>
            </Dropdown>);
        } else if (record.ep_receipt_filename && record.status === CMS_DECL_STATUS.released.value) {
          spanElems.push(<a role="presentation" onClick={() => this.handleEpRecvXmlView(record.ep_receipt_filename)}><Icon type="eye-o" /> EDI回执</a>);
        }
        if (spanElems.length === 2) {
          spanElems.splice(1, 0, <span className="ant-divider" key="divid1" />);
        }
        return (
          <span>
            {spanElems}
          </span>);
      }
    },
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
        ietype: this.props.listFilter.ietype,
        tenantId: this.props.tenantId,
        loginId: this.props.loginId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.customslist,
  })
  handleTableLoad = (currentPage, filter) => {
    const ie = filter ? filter.ietype : this.props.listFilter.ietype;
    this.props.loadCustomsDecls({
      ietype: ie,
      tenantId: this.props.tenantId,
      loginId: this.props.loginId,
      filter: JSON.stringify(filter || this.props.listFilter),
      pageSize: this.props.customslist.pageSize,
      currentPage: currentPage || this.props.customslist.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handlePreview = (delgNo) => {
    this.props.showPreviewer(delgNo, 'customsDecl');
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
    this.handleTableLoad(1, { ...filters });
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
  handleStatusFilter = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.setState({ selectedRowKeys: [] });
    this.handleTableLoad(1, filter);
  }
  handleIEFilter = (ev) => {
    if (ev.target.value === this.props.listFilter.ietype) {
      return;
    }
    const filter = { ...this.props.listFilter, ietype: ev.target.value, acptDate: [] };
    this.setState({ selectedRowKeys: [] });
    this.handleTableLoad(1, filter);
  }
  handleDelete = (declId, delgNo, billNo) => {
    this.props.deleteDecl(declId, delgNo, billNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleReview = (row) => {
    this.props.setDeclReviewed([row.id], CMS_DECL_STATUS.reviewed.value).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleListsReview = (ids) => {
    this.props.setDeclReviewed(ids, CMS_DECL_STATUS.reviewed.value).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
        this.setState({ selectedRowKeys: [] });
      }
    });
  }
  handleListsSend = (ids) => {
    this.props.showBatchSendModal({ tenantId: this.props.tenantId, ids });
    this.setState({ selectedRowKeys: [] });
  }
  handleRecall = (row) => {
    this.props.setDeclReviewed([row.id], CMS_DECL_STATUS.proposed.value).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleListsRecall = (ids) => {
    this.props.setDeclReviewed(ids, CMS_DECL_STATUS.proposed.value).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
        this.setState({ selectedRowKeys: [] });
      }
    });
  }
  handleShowSendDeclModal = (record) => {
    this.props.showSendDeclModal({
      visible: true,
      ietype: record.i_e_type === 0 ? 'import' : 'export',
      preEntrySeqNo: record.pre_entry_seq_no,
      delgNo: record.delg_no,
      agentCustCo: record.agent_custco });
  }
  handleEpSendXmlView = (filename) => {
    window.open(`${API_ROOTS.default}v1/cms/customs/epsend/xml?filename=${filename}`);
  }
  handleEpRecvXmlView = (filename) => {
    window.open(`${API_ROOTS.default}v1/cms/customs/eprecv/xml?filename=${filename}`);
  }
  handleShowDeclReleasedModal = (row) => {
    this.props.openDeclReleasedModal(row.entry_id, row.pre_entry_seq_no, row.delg_no, row.i_e_type);
  }
  handleTradesSelectChange = (value) => {
    let tradesView = {};
    if (value !== 'all') {
      tradesView = this.props.trades.find(data => data.id === value);
    }
    const filter = { ...this.props.listFilter, tradesView, acptDate: [] };
    this.handleTableLoad(1, filter);
  }
  handleViewChange = (value) => {
    const filter = { ...this.props.listFilter, viewStatus: value, acptDate: [] };
    this.handleTableLoad(1, filter);
  }
  handleDateRangeChange = (value, dateString) => {
    const filters = { ...this.props.listFilter, filterDate: dateString, acptDate: [] };
    this.handleTableLoad(1, filters);
  }
  render() {
    const { customslist, listFilter, trades } = this.props;
    this.dataSource.remotes = customslist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const status = this.props.listFilter.status;
    let dateVal = [];
    if (listFilter.filterDate.length > 0 && listFilter.filterDate[0] !== '') {
      dateVal = [moment(listFilter.filterDate[0]), moment(listFilter.filterDate[1])];
    }
    let bulkBtns = '';
    if (status === 'proposed') {
      bulkBtns = (
        <PrivilegeCover module="clearance" feature="customs" action="edit">
          <Button type="default" size="large" onClick={() => this.handleListsReview(this.state.selectedRowKeys)}>
          批量复核
        </Button>
        </PrivilegeCover>);
    } else if (status === 'reviewed') {
      bulkBtns = (
        <span>
          <PrivilegeCover module="clearance" feature="customs" action="edit">
            <Button type="primary" size="large" onClick={() => this.handleListsSend(this.state.selectedRowKeys)}>
            批量发送
          </Button>
          </PrivilegeCover>
          <Popconfirm title={'是否退回所有选择项？'} onConfirm={() => this.handleListsRecall(this.state.selectedRowKeys)}>
            <Button size="large">
            批量退回
          </Button>
          </Popconfirm>
        </span>);
    }
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('customsDecl')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={listFilter.ietype} onChange={this.handleIEFilter} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="import">{this.msg('import')}</RadioButton>
            <RadioButton value="export">{this.msg('export')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup value={listFilter.status} onChange={this.handleStatusFilter} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            {Object.keys(CMS_DECL_STATUS).map(declkey =>
              <RadioButton value={declkey} key={declkey}>{CMS_DECL_STATUS[declkey].text}</RadioButton>
            )}
          </RadioGroup>
          <span />
          <RadioGroup value={listFilter.status} onChange={this.handleStatusFilter} size="large">
            <RadioButton value="inspect">{this.msg('customsCheck')}</RadioButton>
          </RadioGroup>
          <div className="page-header-tools" />
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleTradesSelectChange} defaultValue="all"
                dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
              >
                <Option value="all">全部收发货人</Option>
                {trades.map(data => (<Option key={data.id} value={data.id}
                  search={`${data.code}${data.name}`}
                >{data.name}</Option>)
                )}
              </Select>
              <span />
              <Select size="large" value={listFilter.viewStatus} style={{ width: 160 }} showSearch={false}
                onChange={this.handleViewChange}
              >
                <OptGroup label="常用视图">
                  <Option value="all">全部委托</Option>
                  <Option value="my">我负责的委托</Option>
                </OptGroup>
              </Select>
              <span />
              <RangePicker size="large" value={dateVal}
                ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
                onChange={this.handleDateRangeChange}
              />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                {bulkBtns}
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout table-fixed-layout">
              <Table rowSelection={rowSelection} columns={this.columns} rowKey="id" dataSource={this.dataSource}
                loading={customslist.loading} scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
              />
            </div>
            <FillCustomsNoModal reload={this.handleTableLoad} />
            <DeclReleasedModal reload={this.handleTableLoad} />
            <SendModal reload={this.handleTableLoad} />
            <BatchSendModal reload={this.handleTableLoad} />
          </div>
        </Content>
        <DelegationDockPanel />
        <OrderDockPanel />
        <ShipmentDockPanel />
      </QueueAnim>
    );
  }
}
