import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, DatePicker, Icon, Layout, Menu, Radio, Tag, Tooltip, message, Popconfirm, Badge, Button, Select, Popover } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import PageHint from 'client/components/PageHint';
import ButtonToggle from 'client/components/ButtonToggle';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadCustomsDecls, loadTableParams, deleteDecl, setDeclReviewed, showSendDeclModal, openDeclReleasedModal, showBatchSendModal, showDeclMsgDock } from 'common/reducers/cmsDeclare';
import { toggleDeclMsgModal } from 'common/reducers/cmsCiqDeclare';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import { openEfModal } from 'common/reducers/cmsDelegation';
import { loadPartnersByTypes } from 'common/reducers/partner';
import { CMS_DECL_STATUS, CMS_DECL_TYPE, PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import RowAction from 'client/components/RowAction';
import { Logixon, Fontello } from 'client/components/FontIcon';
import OrderDockPanel from 'client/apps/scof/orders/docks/orderDockPanel';
import ShipmentDockPanel from 'client/apps/transport/shipment/dock/shipmentDockPanel';
import BatchSendModal from './modals/batchSendModal';
import FillCustomsNoModal from './modals/fillCustomsNoModal';
import DeclReleasedModal from './modals/declReleasedModal';
import SendDeclMsgModal from './modals/sendDeclMsgModal';
import DeclMsgPanel from './panel/declMsgPanel';
import DeclMsgModal from './modals/declMsgModal';
import DeclStatusPopover from '../common/popover/declStatusPopover';
import DelegationDockPanel from '../common/dock/delegationDockPanel';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Option } = Select;
const { OptGroup } = Select;
const { RangePicker } = DatePicker;

function mergeFilters(curFilters, value) {
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

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    customslist: state.cmsDeclare.customslist,
    listFilter: state.cmsDeclare.listFilter,
    clients: state.partner.partners,
    customs: state.cmsDeclare.listRequire.customs,
    // trades: state.cmsDeclare.trades,
  }),
  {
    loadCustomsDecls,
    loadTableParams,
    loadPartnersByTypes,
    openEfModal,
    deleteDecl,
    setDeclReviewed,
    showSendDeclModal,
    showPreviewer,
    openDeclReleasedModal,
    showBatchSendModal,
    showDeclMsgDock,
    toggleDeclMsgModal,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class CustomsList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,

    showSendDeclModal: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRows: [],
    selectedRowKeys: [],
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
    this.props.loadPartnersByTypes(
      this.props.tenantId,
      [PARTNER_ROLES.CUS, PARTNER_ROLES.DCUS], PARTNER_BUSINESSE_TYPES.clearance
    );
    this.props.loadTableParams();
    this.handleTableLoad(this.props.customslist.current, { ...this.props.listFilter, ...filters, filterNo: '' });
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('declNo'),
    dataIndex: 'entry_id',
    width: 200,
    fixed: 'left',
    render: (entryNO, record) => {
      switch (record.status) {
        case CMS_DECL_STATUS.proposed.value:
        case CMS_DECL_STATUS.reviewed.value:
          return (
            <span className="text-normal">
              {record.pre_entry_seq_no}
            </span>);
        case CMS_DECL_STATUS.sent.value:
          return (
            <span>
              <span className="text-normal" style={{ marginRight: 4 }}>
                {record.pre_entry_seq_no}
              </span>
              <PrivilegeCover module="clearance" feature="customs" action="edit" key="entry_no">
                <RowAction shape="circle"
                  onClick={this.handleDeclNoFill}
                  row={record}
                  label={<Icon type="edit" />}
                  tooltip="回填海关编号"
                />
              </PrivilegeCover>
            </span>);
        case CMS_DECL_STATUS.entered.value:
        case CMS_DECL_STATUS.released.value:
          return (<span className="text-emphasis">{entryNO}</span>);
        default:
          return <span />;
      }
    },
  }, {
    title: <Tooltip title="申报项数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'detail_count',
    width: 50,
    render: dc => (!Number.isNaN(Number(dc)) ? dc : null),
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
        const decltype = CMS_DECL_TYPE.filter(ty =>
          ty.value === (record.pre_entry_dec_type).toString())[0];
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
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 120,
    render: (o, record) => (
      <a onClick={ev => this.handlePreview(record, ev)}>
        {o}
      </a>),
  }, {
    title: this.msg('orderNo'),
    width: 180,
    dataIndex: 'order_no',
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: this.msg('packCount'),
    width: 60,
    dataIndex: 'pack_count',
  }, {
    title: this.msg('grossWt'),
    width: 80,
    dataIndex: 'gross_wt',
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (ost, record) => {
      const declkey = Object.keys(CMS_DECL_STATUS).filter(stkey =>
        CMS_DECL_STATUS[stkey].value === ost)[0];
      if (declkey) {
        const decl = CMS_DECL_STATUS[declkey];
        if (record.status > CMS_DECL_STATUS.sent.value) {
          return (<span><Badge status={decl.badge} text={decl.text} />
            <DeclStatusPopover entryId={record.entry_id}><a role="presentation"><Logixon type="customs-o" /></a></DeclStatusPopover>
          </span>);
        }

        return <Badge status={decl.badge} text={decl.text} />;
      }
      return null;
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
        }
        return <Tooltip title="未查验"><span><Fontello type="circle" color="gray" /></span></Tooltip>;
      }
      return null;
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
    title: '监管方式',
    dataIndex: 'trade_mode',
    width: 100,
  }, {
    title: '提运单号',
    dataIndex: 'bl_wb_no',
    width: 180,
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
    width: 120,
  }, {
    title: this.msg('opColumn'),
    dataIndex: 'OPS_COL',
    width: 140,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === CMS_DECL_STATUS.proposed.value) {
        return (
          <span>
            <RowAction onClick={this.handleDetail} icon="eye-o" label={this.msg('viewDetail')} row={record} />
            <PrivilegeCover module="clearance" feature="customs" action="edit">
              <RowAction onClick={this.handleReview} icon="check-circle-o" tooltip={this.msg('review')}row={record} />
            </PrivilegeCover>
          </span>
        );
      }
      const spanElems = [];
      if (record.status === CMS_DECL_STATUS.reviewed.value) {
        spanElems.push(<PrivilegeCover module="clearance" feature="customs" action="edit" key="send">
          <RowAction onClick={this.handleShowSendDeclModal} icon="mail" tooltip={this.msg('sendDeclMsg')} row={record} />
        </PrivilegeCover>);
      }
      if (record.status === CMS_DECL_STATUS.sent.value) {
        spanElems.push(<RowAction overlay={<Menu onClick={this.showDeclMsgModal}><Menu.Item key={`${record.sent_file}|sent`}>{this.msg('viewDeclMsg')}</Menu.Item></Menu>} row={record} />);
      }
      if (record.status === CMS_DECL_STATUS.entered.value) {
        spanElems.push(<PrivilegeCover module="clearance" feature="customs" action="edit" key="clear">
          <RowAction onClick={this.handleShowDeclReleasedModal}
            row={record}
            icon="flag"
            tooltip={this.msg('markReleased')}
          />
        </PrivilegeCover>);
      }
      if (record.status >= CMS_DECL_STATUS.entered.value) {
        spanElems.push(<RowAction overlay={<Menu>
          {record.sent_file && <Menu.Item key={`${record.sent_file}|sent`}>{this.msg('viewDeclMsg')}</Menu.Item>}
          {record.return_file && <Menu.Item key={`${record.return_file}|return`}>{this.msg('viewResultMsg')}</Menu.Item>}
        </Menu>}
          row={record}
        />);
      }
      return (<span>
        <RowAction onClick={this.handleDetail} icon="eye-o" label={this.msg('viewDetail')} row={record} />
        {spanElems}
      </span>);
    },
  }]
  showDeclMsgModal = ({ key }) => {
    const [fileName, fileType] = key.split('|');
    this.props.toggleDeclMsgModal(true, fileName, fileType);
  }
  dataSource = new DataTable.DataSource({
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
  handlePreview = (record, ev) => {
    ev.stopPropagation();
    this.props.showPreviewer(record.delg_no, 'customsDecl');
  }
  handleDeclNoFill = (row) => {
    this.props.openEfModal({
      entryHeadId: row.id,
      billSeqNo: row.bill_seq_no,
      delgNo: row.delg_no,
    });
  }
  handleSearch = (searchVal) => {
    const filters = mergeFilters(this.props.listFilter, searchVal);
    this.handleTableLoad(1, { ...filters });
  }
  handleDetail = (record) => {
    // ev.preventDefault();
    const ietype = record.i_e_type === 0 ? 'import' : 'export';
    const link = `/clearance/cusdecl/${ietype}/${record.bill_seq_no}/${record.pre_entry_seq_no}`;
    this.context.router.push(link);
  }
  handleOpenInWindow = (record, ev) => {
    ev.stopPropagation();
    const ietype = record.i_e_type === 0 ? 'import' : 'export';
    const link = `/clearance/cusdecl/${ietype}/${record.bill_seq_no}/${record.pre_entry_seq_no}`;
    window.open(link);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [], selectedRows: [] });
  }
  handleStatusFilter = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleDeselectRows();
    this.handleTableLoad(1, filter);
  }
  handleIEFilter = (ev) => {
    if (ev.target.value === this.props.listFilter.ietype) {
      return;
    }
    const filter = { ...this.props.listFilter, ietype: ev.target.value, acptDate: [] };
    this.handleDeselectRows();
    this.handleTableLoad(1, filter);
  }
  handleClientSelectChange = (value) => {
    const clientView = { tenantIds: [], partnerIds: [] }; // FIXME should not use two ids
    if (value !== -1) {
      const client = this.props.clients.find(clt => clt.partner_id === value);
      if (client.partner_id !== null) {
        clientView.partnerIds.push(client.partner_id);
      } else {
        clientView.tenantIds.push(client.tid);
      }
    }
    const filter = { ...this.props.listFilter, clientView };
    this.handleDeselectRows();
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
  handleBatchReview = (ids) => {
    this.props.setDeclReviewed(ids, CMS_DECL_STATUS.reviewed.value).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleDeselectRows();
        this.handleTableLoad();
      }
    });
  }
  handleBatchSend= (ids) => {
    this.props.showBatchSendModal({ tenantId: this.props.tenantId, ids });
    this.handleDeselectRows();
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
  handleBatchRecall = (ids) => {
    this.props.setDeclReviewed(ids, CMS_DECL_STATUS.proposed.value).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
        this.handleDeselectRows();
      }
    });
  }
  handleShowSendDeclModal = (record) => {
    this.props.showSendDeclModal({
      defaultDecl: {
        channel: record.dec_channel,
        dectype: record.pre_entry_dec_type,
        appuuid: record.ep_app_uuid,
      },
      visible: true,
      ietype: record.i_e_type === 0 ? 'import' : 'export',
      preEntrySeqNo: record.pre_entry_seq_no,
      delgNo: record.delg_no,
      agentCustCo: record.agent_custco,
    });
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
  toggleRightSider = () => {
    this.props.showDeclMsgDock();
  }
  render() {
    const { customslist, listFilter } = this.props;
    this.dataSource.remotes = customslist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      selectedRows: this.state.selectedRows,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
      },
    };
    const { status } = this.props.listFilter;
    let dateVal = [];
    if (listFilter.filterDate.length > 0 && listFilter.filterDate[0] !== '') {
      dateVal = [moment(listFilter.filterDate[0]), moment(listFilter.filterDate[1])];
    }
    let bulkActions = '';
    if (this.state.selectedRows.length > 0) {
      if (status === 'proposed') {
        bulkActions = (
          <PrivilegeCover module="clearance" feature="customs" action="edit">
            <Button type="default" onClick={() => this.handleBatchReview(this.state.selectedRowKeys)}>
              批量复核
            </Button>
          </PrivilegeCover>);
      } else if (status === 'reviewed') {
        const ietype = this.state.selectedRows[0].i_e_type;
        const sameIeType = this.state.selectedRows.filter(sr =>
          sr.i_e_type === ietype).length === this.state.selectedRows.length;
        bulkActions = (
          <span>
            {sameIeType && <PrivilegeCover module="clearance" feature="customs" action="edit">
              <Button type="primary" onClick={() => this.handleBatchSend(this.state.selectedRowKeys)}>
                批量发送
              </Button>
            </PrivilegeCover>}
            <Popconfirm title="是否退回所有选择项？" onConfirm={() => this.handleBatchRecall(this.state.selectedRowKeys)}>
              <Button>
                批量退回
              </Button>
            </Popconfirm>
          </span>);
      }
    }
    let clientPid = -1;
    if (listFilter.clientView.partnerIds.length > 0) {
      [clientPid] = listFilter.clientView.partnerIds;
    }
    const clients = [{
      name: '全部客户',
      partner_id: -1,
    }].concat(this.props.clients);
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
      <Select showSearch
        optionFilterProp="children"
        style={{ width: 160 }}
        onChange={this.handleClientSelectChange}
        value={clientPid}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        {clients.map(data => (<Option key={data.name} value={data.partner_id}>
          {data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
        </Option>))}
      </Select>
      {/*
        <Select showSearch optionFilterProp="children" style={{ width: 160 }}
        onChange={this.handleTradesSelectChange} defaultValue="all"
        dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      >
        <Option value="all">全部收发货人</Option>
        {trades.map(data => (<Option key={data.id} value={data.id}
          search={`${data.code}${data.name}`}
        >{data.name}</Option>)
        )}
      </Select>
      */}
      <Select value={listFilter.viewStatus}
        style={{ width: 160 }}
        showSearch={false}
        onChange={this.handleViewChange}
      >
        <OptGroup label="常用视图">
          <Option value="all">全部委托</Option>
          <Option value="my">我负责的委托</Option>
        </OptGroup>
      </Select>
      <RangePicker value={dateVal}
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
        onChange={this.handleDateRangeChange}
      />
    </span>);
    return (
      <Layout>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('customsDecl')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Nav>
              <RadioGroup value={listFilter.ietype} onChange={this.handleIEFilter}>
                <RadioButton value="all">{this.msg('all')}</RadioButton>
                <RadioButton value="import">{this.msg('import')}</RadioButton>
                <RadioButton value="export">{this.msg('export')}</RadioButton>
              </RadioGroup>
              <span />
              <RadioGroup value={listFilter.status} onChange={this.handleStatusFilter}>
                <RadioButton value="all">{this.msg('all')}</RadioButton>
                {Object.keys(CMS_DECL_STATUS).map(declkey =>
                  (<RadioButton key={declkey} value={declkey}>
                    {CMS_DECL_STATUS[declkey].text}</RadioButton>))}
              </RadioGroup>
              <span />
              <RadioGroup value={listFilter.status} onChange={this.handleStatusFilter}>
                <RadioButton value="inspect">{this.msg('customsCheck')}</RadioButton>
              </RadioGroup>
            </PageHeader.Nav>
            <PageHeader.Actions>
              <PageHint />
              <ButtonToggle tooltip="报文收发记录"
                iconOn="double-right"
                iconOff="double-left"
                onClick={this.toggleRightSider}
              />
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable toolbarActions={toolbarActions}
              bulkActions={bulkActions}
              rowSelection={rowSelection}
              selectedRowKeys={this.state.selectedRowKeys}
              handleDeselectRows={this.handleDeselectRows}
              columns={this.columns}
              dataSource={this.dataSource}
              rowKey="id"
              loading={customslist.loading}
              onRow={record => ({
                onClick: () => {},
                onDoubleClick: () => { this.handleDetail(record); },
                onContextMenu: () => {},
                onMouseEnter: () => {},
                onMouseLeave: () => {},
              })}
            />
            <FillCustomsNoModal reload={this.handleTableLoad} />
            <DeclReleasedModal reload={this.handleTableLoad} />
            <SendDeclMsgModal reload={this.handleTableLoad} />
            <BatchSendModal reload={this.handleTableLoad} />
          </Content>
        </Layout>
        <DeclMsgPanel />
        <DelegationDockPanel />
        <OrderDockPanel />
        <ShipmentDockPanel />
        <DeclMsgModal />
      </Layout>
    );
  }
}
