import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Button, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import BillingForm from './billingForm';
import { loadBillings, updateBilling, sendBilling } from 'common/reducers/cmsBilling';
import { SHIPMENT_BILLING_STATUS } from 'common/constants';
import TrimSpan from 'client/components/trimSpan';
import { createFilename } from 'client/util/dataTransform';

const formatMsg = format(messages);

@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    billings: state.cmsBilling.billings,
  }),
  { loadBillings, updateBilling, sendBilling }
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
  }
  componentDidMount() {
    this.handleTableLoad();
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
  handleSendBilling = (billingId) => {
    const { tenantId } = this.props;
    this.props.sendBilling({ tenantId, billingId }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        message.info('发送成功');
        this.handleTableLoad();
      }
    });
  }
  handleTableLoad = () => {
    const { tenantId, type } = this.props;
    const { pageSize, currentPage } = this.props.billings;
    this.props.loadBillings({
      type,
      tenantId,
      pageSize,
      currentPage,
    });
  }
  handleShowCancelChargeModal = (billingId, fromId) => {
    this.setState({ billingId, fromId });
    this.setState({ cancelChargeModalVisible: true });
  }
  handleExportExcel = () => {
    const { tenantId, type } = this.props;
    window.open(`${API_ROOTS.default}v1/clearance/billing/exportBillingsExcel/${createFilename('billings')}.xlsx?tenantId=${tenantId}&type=${type}`);
    this.handleClose();
  }
  render() {
    const { tenantId, type } = this.props;
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
        };
        return params;
      },
      remotes: this.props.billings,
    });

    const columns = [{
      title: '账单名称',
      dataIndex: 'name',
      render(o, record) {
        return <Link to={`/clearance/billing/${type}/view/${record.id}`}>{o}</Link>;
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
      title: type === 'receivable' ? '客户' : '供应商',
      dataIndex: type === 'receivable' ? 'send_name' : 'recv_name',
      render(o) {
        return <TrimSpan text={o} maxLen={10} />;
      },
    }, {
      title: '服务费用',
      dataIndex: 'serv_charge',
      render(o) {
        return (<span style={{ color: '#0000FF' }}>{o}</span>);
      },
    }, {
      title: '代垫费用',
      dataIndex: 'advance_charge',
      render(o) {
        return (<span style={{ color: '#0000FF' }}>{o}</span>);
      },
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
      render: (o, record) => {
        if (record.status === 1) {
          return (
            <div>
              <a onClick={() => this.handleSendBilling(record._id)}>发送</a>
              <span className="ant-divider" />
              <Link to={`/clearance/billing/${type}/edit/${o}`}>修改</Link>
            </div>
          );
        } else if (record.status === 2) {
          return (
            <div>
              <Link to={`/clearance/billing/${type}/view/${o}`}>查看</Link>
            </div>
          );
        } else if (record.status === 3) {
          return (
            <div>
              <Link to={`/clearance/billing/${type}/check/${o}`}>{this.msg('checkBilling')}</Link>
            </div>
          );
        } else if (record.status === 4) {
          return (
            <div>
              <Link to={`/clearance/billing/${type}/view/${o}`}>查看</Link>
            </div>
          );
        } else if (record.status === 5) {
          return (
            <div>
              <a onClick={() => this.handleShowCancelChargeModal(record.id, record.from_id)}>核销</a>
            </div>
          );
        } else if (record.status === 6) {
          return (
            <div>
              <Link to={`/clearance/billing/${type}/view/${o}`}>查看</Link>
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
          </div>
        </div>
      </div>

    );
  }
}
