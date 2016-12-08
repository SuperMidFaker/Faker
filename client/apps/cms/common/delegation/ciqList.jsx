import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Badge, message, Tag } from 'antd';
import Table from 'client/components/remoteAntTable';
import { PARTNER_BUSINESSES, CMS_CIQ_STATUS, CIQ_SUP_STATUS } from 'common/constants';
import { loadCiqTable, loadCertBrokers, setDispStatus, loadDisp, loadDelgDisp,
  setCiqFinish, loadCMQParams, matchCQuote, openAcceptModal,
} from 'common/reducers/cmsDelegation';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import RowUpdater from './rowUpdater';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    ciqlist: state.cmsDelegation.ciqlist,
    listFilter: state.cmsDelegation.listFilter,
    saved: state.cmsDelegation.saved,
    preStatus: state.cmsDelegation.preStatus,
    cMQParams: state.cmsDelegation.cMQParams,
    delgDispShow: state.cmsDelegation.delgDispShow,
  }),
  { loadCiqTable, loadCertBrokers, setDispStatus,
    loadDisp, loadDelgDisp, setCiqFinish, loadCMQParams, matchCQuote,
    openAcceptModal }
)
export default class CiqList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    ciqlist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    saved: PropTypes.bool.isRequired,
  }
  state = {
    expandedKeys: [],
  }
  componentDidMount() {
    this.props.loadCertBrokers(this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.saved !== this.props.saved) {
      this.handleTableLoad();
    }
    if (nextProps.preStatus !== this.props.preStatus) {
      if (nextProps.preStatus === 'ciqaccepted') {
        this.handleTableLoad();
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 120,
    render: o => (
      <a onClick={() => this.handlePreview(o)}>
        {o}
      </a>),
  }, {
    title: this.msg('delgClient'),
    width: 200,
    dataIndex: 'send_name',
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: this.msg('orderNo'),
    width: 140,
    dataIndex: 'order_no',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('invoiceNo'),
    width: 140,
    dataIndex: 'invoice_no',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('waybillLadingNo'),
    width: 200,
    dataIndex: 'bl_wb_no',
  }, {
    title: this.msg('ciqType'),
    width: 100,
    dataIndex: 'ciq_type',
    render: (o) => {
      if (o === 'NL') {
        return <Tag color="#ccc">一般报检</Tag>;
      } else if (o === 'LA' || o === 'LB') {
        return <Tag color="#fa0">法定检验</Tag>;
      }
      return <span />;
    },
  }, {
    title: this.msg('inspbroker'),
    width: 180,
    dataIndex: 'recv_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('ciqStatus'),
    width: 130,
    dataIndex: 'status',
    render: (o, record) => {
      const CMS_STATUS = (record.type === 1) ? CMS_CIQ_STATUS : CIQ_SUP_STATUS;
      const decl = CMS_STATUS.filter(st => st.value === o)[0];
      if (record.status === 1) {
        return <Badge status="processing" text={decl && decl.text} />;
      } else if (record.status === 4) {
        return <Badge status="success" text={decl && decl.text} />;
      } else {
        return <Badge status="default" text={decl && decl.text} />;
      }
    },
  }, {
    title: this.msg('lastActTime'),
    width: 150,
    dataIndex: 'last_act_time',
    render: (o) => {
      if (o) {
        return moment(o).format('MM.DD HH:mm');
      }
    },
  }, {
    title: this.msg('opColumn'),
    width: 140,
    render: (record) => {
      if (record.status === 0 && record.type === 1) {
        return (
          <RowUpdater onHit={this.handleAccept} label={this.msg('accepting')} row={record} />
        );
      } else if (record.status === 1 && record.type === 1) {
        return (
          <RowUpdater onHit={this.handleCiqFinish} label={this.msg('ciqFinish')} row={record} />
        );
      } else if (record.status === 0 && record.type === 2) {
        return (
          <RowUpdater onHit={() => this.handleDelegationCancel(record, 'ciq')} label={this.msg('delgRecall')} row={record} />
        );
      } else {
        return (
          <RowUpdater label={this.msg('declareView')} />
        );
      }
    },
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadCiqTable(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters) => {
      const params = {
        ietype: this.props.ietype,
        filter: JSON.stringify(filters),
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.ciqlist,
  })
  handleMQParam = (delgNo) => {
    this.props.loadCMQParams(this.props.tenantId, delgNo, 2).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        }
      });
  }
  handleMatchQuote = (params) => {
    this.props.matchCQuote(params).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.handleTableLoad();
        }
      });
  }
  handleAccept = (row) => {
    this.props.openAcceptModal({
      tenantId: this.props.tenantId,
      dispatchIds: [row.id],
      type: 'ciq',
    });
  }
  handleCiqFinish = (row) => {
    this.props.setCiqFinish(row.delg_no).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.handleTableLoad();
        }
      });
  }
  handleDelegationAssign = (row, type) => {
    this.props.loadDelgDisp(
      row.delg_no,
      this.props.tenantId,
      PARTNER_BUSINESSES.CIB,
      type);
    this.props.setDispStatus({ delgDispShow: true });
  }
  handleDelegationCancel = (row, type) => {
    this.props.loadDisp(
      row.delg_no,
      this.props.tenantId,
      PARTNER_BUSINESSES.CIB,
      type);
    this.props.setDispStatus({ delgDispShow: true });
  }
  handleTableLoad = (currentPage, filter) => {
    this.setState({ expandedKeys: [] });
    this.props.loadCiqTable({
      ietype: this.props.ietype,
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter || this.props.listFilter),
      pageSize: this.props.ciqlist.pageSize,
      currentPage: currentPage || this.props.ciqlist.current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handlePreview = (delgNo) => {
    this.props.showPreviewer(delgNo);
  }
  render() {
    const { ciqlist } = this.props;
    this.dataSource.remotes = ciqlist;
    return (
      <Table columns={this.columns} dataSource={this.dataSource}
        loading={ciqlist.loading} rowKey="delg_no"
      />);
  }
}
