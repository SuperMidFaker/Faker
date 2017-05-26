import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, Dropdown, Menu, Icon, Layout, Radio, Tag, Tooltip, message, Popconfirm, Badge, Button, Select } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadCustomsDecls, deleteDecl, setDeclReviewed, showSendDeclModal, openDeclReleasedModal, showBatchSendModal } from 'common/reducers/cmsDeclare';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import { openEfModal } from 'common/reducers/cmsDelegation';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/search-bar';
import NavLink from 'client/components/nav-link';
import RowUpdater from 'client/components/rowUpdater';
import FillCustomsNoModal from './modals/fillCustomsNoModal';
import DeclReleasedModal from './modals/declReleasedModal';
import DeclStatusPopover from './declStatusPopover';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { CMS_DECL_STATUS } from 'common/constants';
import SendModal from './modals/sendModal';
import DelegationDockPanel from '../dockhub/delegationDockPanel';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';
import ShipmentDockPanel from '../../../transport/shipment/dock/shipmentDockPanel';
import BatchSendModal from './modals/batchSendModal';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;
const OptGroup = Select.OptGroup;

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
    ietype: PropTypes.oneOf(['import', 'export']),
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
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 110,
    fixed: 'left',
    render: (o, record) => (
      <a onClick={() => this.handlePreview(o, record)}>
        {o}
      </a>),
  }, {
    title: this.msg('declNo'),
    dataIndex: 'entry_id',
    width: 200,
    fixed: 'left',
    render: (entryNO, record) => {
      const preEntryLink = (
        <NavLink to={`/clearance/${this.props.ietype}/customs/${record.bill_seq_no}/${record.pre_entry_seq_no}`}>
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
              <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit" key="entry_no">
                <RowUpdater onHit={this.handleDeclNoFill} row={record}
                  label={<Icon type="edit" />} tooltip="回填海关编号"
                />
              </PrivilegeCover>
            </span>);
        case CMS_DECL_STATUS.finalized.value:
        case CMS_DECL_STATUS.released.value:
          return (
            <span>
              <DeclStatusPopover entryId={entryNO}><Tag color={record.status === CMS_DECL_STATUS.released.value ? 'green' : 'blue'}>海关</Tag></DeclStatusPopover>
              <NavLink to={`/clearance/${this.props.ietype}/customs/${record.bill_seq_no}/${record.pre_entry_seq_no}`}>{entryNO}</NavLink>
            </span>);
        default:
          return <span />;
      }
    },
  }, {
    title: <Tooltip title="明细记录数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'detail_count',
    width: 50,
    render: dc => !isNaN(dc) ? dc : null,
  }, {
    title: '收发货人',
    dataIndex: 'trade_name',
    width: 160,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: '申报单位',
    dataIndex: 'agent_name',
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
    width: 100,
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
    render: createdt => (createdt ? moment(createdt).format('MM.DD HH:mm') : '-'),
  }, {
    title: '发送时间',
    dataIndex: 'epsend_date',
    width: 100,
    render: senddate => (senddate ? moment(senddate).format('MM.DD HH:mm') : '-'),
  }, {
    title: '发送人',
    dataIndex: 'epsend_login_name',
    width: 100,
  }, {
    title: '回执日期',
    dataIndex: 'backfill_date',
    width: 100,
    render: backdt => (backdt ? moment(backdt).format('YYYY.MM.DD') : '-'),
  }, {
    title: this.msg('opColumn'),
    width: 140,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === CMS_DECL_STATUS.proposed.value) {
        return (
          <span>
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
              <RowUpdater onHit={this.handleReview} label={<span><Icon type="check-circle-o" /> {this.msg('review')}</span>} row={record} />
            </PrivilegeCover>
            <span className="ant-divider" />
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
              <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelete(record.id, record.delg_no, record.bill_seq_no)}>
                <a role="presentation"><Icon type="delete" /></a>
              </Popconfirm>
            </PrivilegeCover>
          </span>
        );
      } else if (record.status === CMS_DECL_STATUS.reviewed.value) {
        return (
          <span>
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
              <RowUpdater onHit={this.handleShowSendDeclModal} label={<span><Icon type="mail" /> {this.msg('sendPackets')}</span>} row={record} />
            </PrivilegeCover>
            <span className="ant-divider" />
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
              <RowUpdater onHit={this.handleRecall} label={<span><Icon type="left-circle-o" />{this.msg('recall')}</span>} row={record} />
            </PrivilegeCover>
          </span>
        );
      } else {
        const spanElems = [];
        if (record.status !== CMS_DECL_STATUS.released.value) {
          spanElems.push(
            <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit" key="clear">
              <RowUpdater onHit={this.handleShowDeclReleasedModal} row={record}
                label={<span><Icon type="flag" />标记放行</span>}
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
        } else if (record.ep_receipt_filename && record.status > CMS_DECL_STATUS.sent.value) {
          spanElems.push(
            <Dropdown key="receipt" overlay={(<Menu>
              <Menu.Item key="edit">
                <a role="presentation" onClick={() => this.handleEpRecvXmlView(record.ep_receipt_filename)}><Icon type="eye-o" /> EDI回执</a>
              </Menu.Item>
            </Menu>)}
            >
              <a><Icon type="down" /></a>
            </Dropdown>);
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
        ietype: this.props.ietype,
        tenantId: this.props.tenantId,
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
    this.props.loadCustomsDecls({
      ietype: this.props.ietype,
      tenantId: this.props.tenantId,
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
    this.props.openDeclReleasedModal(row.entry_id, row.pre_entry_seq_no, row.delg_no);
  }
  handleTradesSelectChange = (value) => {
    let tradesView = {};
    if (value !== 'all') {
      tradesView = this.props.trades.find(data => data.id === value);
    }
    const filter = { ...this.props.listFilter, tradesView };
    this.handleTableLoad(1, filter);
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
    let bulkBtns = '';
    if (status === 'proposed') {
      bulkBtns = (
        <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
          <Button type="default" size="large" onClick={() => this.handleListsReview(this.state.selectedRowKeys)}>
          批量复核
        </Button>
        </PrivilegeCover>);
    } else if (status === 'reviewed') {
      bulkBtns = (
        <span>
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
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
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.props.ietype === 'import' ? this.msg('importOperation') : this.msg('exportOperation')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Icon type="file" /> {this.msg('customsDeclaration')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            {Object.keys(CMS_DECL_STATUS).map(declkey =>
              <RadioButton value={declkey} key={declkey}>{CMS_DECL_STATUS[declkey].text}</RadioButton>
            )}
          </RadioGroup>
          <div className="top-bar-tools" />
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleTradesSelectChange} defaultValue="all"
              >
                <OptGroup>
                  <Option value="all">全部收发货人</Option>
                  {trades.map(data => (<Option key={data.id} value={data.id}
                    search={`${data.code}${data.name}`}
                  >{data.name}</Option>)
                  )}
                </OptGroup>
              </Select>
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                {bulkBtns}
              </div>
            </div>
            <div className="panel-body table-panel expandable">
              <Table rowSelection={rowSelection} columns={this.columns} rowKey="id" dataSource={this.dataSource}
                loading={customslist.loading} scroll={{ x: 1750 }}
              />
            </div>
            <FillCustomsNoModal reload={this.handleTableLoad} />
            <DeclReleasedModal reload={this.handleTableLoad} />
            <SendModal ietype={this.props.ietype} reload={this.handleTableLoad} />
            <BatchSendModal ietype={this.props.ietype} reload={this.handleTableLoad} />
          </div>
        </Content>
        <DelegationDockPanel ietype={this.props.ietype} />
        <OrderDockPanel />
        <ShipmentDockPanel />
      </QueueAnim>
    );
  }
}
