import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Button, message, Popconfirm } from 'antd';
import Table from 'client/components/remoteAntTable';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import BillingForm from './billingForm';
import { loadBillings, updateBilling, sendBilling, changeBillingsFilter, removeBilling } from 'common/reducers/transportBilling';
import { SHIPMENT_BILLING_STATUS } from 'common/constants';
import CancelChargeModal from '../modals/cancelChargeModal';
import TrimSpan from 'client/components/trimSpan';
import { createFilename } from 'client/util/dataTransform';
import SearchBar from 'client/components/search-bar';

const formatMsg = format(messages);

@injectIntl

@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    billings: state.transportBilling.billings,
  }),
  { loadBillings, updateBilling, sendBilling, changeBillingsFilter, removeBilling }
)

export default class BillingList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    loadBillings: PropTypes.func.isRequired,
    updateBilling: PropTypes.func.isRequired,
    sendBilling: PropTypes.func.isRequired,
    changeBillingsFilter: PropTypes.func.isRequired,
    removeBilling: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    billingFormVisible: false,
    cancelChargeModalVisible: false,
    billingId: -1,
    fromId: -1,
    totalCharge: 0,
  }
  componentDidMount() {
    this.handleTableLoad();
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.billings.searchValue !== nextProps.billings.searchValue) {
      this.handleTableLoad(nextProps.billings.searchValue);
    }
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleAddBtnClicked = () => {
    this.setState({
      billingFormVisible: true,
    });
  }
  toggleBillingForm = () => {
    this.setState({ billingFormVisible: !this.state.billingFormVisible });
  }
  toggleCancelChargeModal = () => {
    this.setState({ cancelChargeModalVisible: !this.state.cancelChargeModalVisible });
  }
  handleSendBilling = (billingId) => {
    const { loginId, tenantId, loginName } = this.props;
    this.props.sendBilling({ tenantId, loginId, loginName, billingId }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        message.info('发送成功');
        this.handleTableLoad();
      }
    });
  }
  handleRemoveBilling = (billingId) => {
    const { loginId, tenantId, loginName } = this.props;
    this.props.removeBilling({ tenantId, loginId, loginName, billingId }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        message.info('删除成功');
        this.handleTableLoad();
      }
    });
  }
  handleTableLoad = (searchValue) => {
    const { tenantId, type } = this.props;
    const { pageSize, currentPage } = this.props.billings;
    this.props.loadBillings({
      type,
      tenantId,
      pageSize,
      currentPage,
      searchValue: searchValue !== undefined ? searchValue : this.props.billings.searchValue,
    });
  }
  handleShowCancelChargeModal = (billingId, fromId, totalCharge) => {
    this.setState({ billingId, fromId, totalCharge });
    this.setState({ cancelChargeModalVisible: true });
  }
  handleExportExcel = () => {
    const { tenantId, type } = this.props;
    window.open(`${API_ROOTS.default}v1/transport/billing/exportBillingsExcel/${createFilename('billings')}.xlsx?tenantId=${tenantId}&type=${type}`);
    // this.handleClose();
  }
  handleSearchInput = (value) => {
    this.props.changeBillingsFilter('searchValue', value);
  }
  render() {
    const { tenantId, type } = this.props;
    const { searchValue } = this.props.billings;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadBillings(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.currentPage, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
      }),
      getParams: (pagination) => {
        const params = {
          type,
          tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          searchValue,
        };
        return params;
      },
      remotes: this.props.billings,
    });

    const columns = [{
      title: '账单名称',
      dataIndex: 'name',
      render(o, record) {
        return <Link to={`/transport/billing/${type}/view/${record.id}`}>{o}</Link>;
      },
    }, {
      title: '开始日期',
      dataIndex: 'begin_date',
      render(o) {
        return moment(o).format('YYYY.MM.DD');
      },
    }, {
      title: '结束日期',
      dataIndex: 'end_date',
      render(o) {
        return moment(o).format('YYYY.MM.DD');
      },
    }, {
      title: type === 'receivable' ? '客户' : '承运商',
      dataIndex: type === 'receivable' ? 'sr_name' : 'sp_name',
      render(o) {
        return <TrimSpan text={o} maxLen={10} />;
      },
    }, {
      title: '运单数量',
      dataIndex: 'shipmt_count',
    }, {
      title: '运单总费用',
      dataIndex: 'freight_charge',
    }, {
      title: '代垫总金额',
      dataIndex: 'advance_charge',
    }, {
      title: '特殊费用总金额',
      dataIndex: 'excp_charge',
    }, {
      title: '调整费用',
      dataIndex: 'adjust_charge',
      render(o) {
        return (<span style={{ color: '#FF0000' }}>{o}</span>);
      },
    }, {
      title: '账单总金额',
      dataIndex: 'total_charge',
      render(o) {
        return (<span style={{ color: '#FF9933' }}>{o}</span>);
      },
    }, {
      title: '核销金额',
      dataIndex: 'cancel_charge',
      render(o) {
        return (<span style={{ color: '#FF9933' }}>{o}</span>);
      },
    }, {
      title: '账单状态',
      dataIndex: 'status',
      render(o) {
        return SHIPMENT_BILLING_STATUS[o];
      },
    }, {
      title: '操作',
      dataIndex: 'id',
      render: (o, record) => {
        if (record.status === 1) {
          return (
            <div>
              <Popconfirm title="确定发送？" onConfirm={() => this.handleSendBilling(record.id)}>
                <a>发送</a>
              </Popconfirm>
              <span className="ant-divider" />
              <Link to={`/transport/billing/${type}/edit/${o}`}>修改</Link>
              <span className="ant-divider" />
              <Popconfirm title="确定删除？" onConfirm={() => this.handleRemoveBilling(record.id)}>
                <a>删除</a>
              </Popconfirm>
            </div>
          );
        } else if (record.status === 2) {
          return (
            <div>
              <Link to={`/transport/billing/${type}/view/${o}`}>查看</Link>
            </div>
          );
        } else if (record.status === 3) {
          return (
            <div>
              <Link to={`/transport/billing/${type}/check/${o}`}>{this.msg('checkBilling')}</Link>
            </div>
          );
        } else if (record.status === 4) {
          return (
            <div>
              <Link to={`/transport/billing/${type}/view/${o}`}>查看</Link>
            </div>
          );
        } else if (record.status === 5) {
          return (
            <div>
              <a onClick={() => this.handleShowCancelChargeModal(record.id, record.from_id, record.total_charge)}>核销</a>
            </div>
          );
        } else if (record.status === 6) {
          return (
            <div>
              <Link to={`/transport/billing/${type}/view/${o}`}>查看</Link>
            </div>
          );
        }
        return '';
      },
    }];

    return (
      <div>
        <header className="top-bar">
          <span>{this.msg(this.props.type)}{this.msg('billing')}</span>
          <div className="tools">
            <SearchBar placeholder="输入账单名称搜索" onInputSearch={this.handleSearchInput}
              value={this.props.billings.searchValue}
            />
          </div>
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary" onClick={this.handleAddBtnClicked}>{this.msg('createBilling')}</Button>
              <Button style={{ marginLeft: 16 }} onClick={this.handleExportExcel}>{this.msg('export')}</Button>
            </div>
            <div className="panel-body table-panel">
              <Table dataSource={dataSource} columns={columns} rowKey="id" />
            </div>
            <BillingForm type={this.props.type} visible={this.state.billingFormVisible} toggle={this.toggleBillingForm} />
            <CancelChargeModal visible={this.state.cancelChargeModalVisible} toggle={this.toggleCancelChargeModal}
              billingId={this.state.billingId} fromId={this.state.fromId} totalCharge={this.state.totalCharge} handleOk={this.handleTableLoad}
            />
          </div>
        </div>
      </div>

    );
  }
}
