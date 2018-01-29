import React from 'react';
import PropTypes from 'prop-types';
import { Button, InputNumber, Layout, Checkbox, message, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadFeesByBillingId, updateBillingFees, checkBilling, acceptBilling, editBilling } from 'common/reducers/crmBilling';
import TrimSpan from 'client/components/trimSpan';
import TrsShipmtNoColumn from '../../common/trsShipmtNoColumn';
import CcbDelgNoColumn from '../../common/ccbDelgNoColumn';
// import OrderDockPanel from '../../orders/docks/orderDockPanel';
import { loadOrderDetail } from 'common/reducers/sofOrders';

const formatMsg = format(messages);
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
    billing: state.crmBilling.billing,
    billingFees: state.crmBilling.billingFees,
    loading: state.crmBilling.loading,
  }),
  {
    loadFeesByBillingId, updateBillingFees, checkBilling, acceptBilling, editBilling, loadOrderDetail,
  }
)
export default class BillingFeeList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    billing: PropTypes.object.isRequired,
    billingFees: PropTypes.object.isRequired,
    loadFeesByBillingId: PropTypes.func.isRequired,
    updateBillingFees: PropTypes.func.isRequired,
    checkBilling: PropTypes.func.isRequired,
    acceptBilling: PropTypes.func.isRequired,
    editBilling: PropTypes.func.isRequired,
    operation: PropTypes.oneOf(['check', 'edit', 'view']),
    loadOrderDetail: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    changed: false,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleAccept = () => {
    const {
      loginId, tenantId, loginName, billing,
    } = this.props;
    const {
      id: billingId, ccbCharge, trsCharge, adjustCharge, totalCharge,
    } = billing;
    const fees = this.props.billingFees.data;
    const modifyTimes = billing.modifyTimes + 1;
    const shipmtCount = fees.filter(item => item.status === 1).length;
    if (this.state.changed) {
      this.props.checkBilling({
        tenantId,
        loginId,
        loginName,
        billingId,
        ccbCharge,
        trsCharge,
        adjustCharge,
        totalCharge,
        modifyTimes,
        shipmtCount,
        fees,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.context.router.push('/scof/billing');
        }
      });
    } else {
      this.props.acceptBilling({
        tenantId, loginId, loginName, billingId,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.context.router.push('/scof/billing');
        }
      });
    }
  }
  handleEdit = () => {
    const {
      loginId, tenantId, loginName, billing,
    } = this.props;
    const {
      id: billingId, ccbCharge, trsCharge, adjustCharge, totalCharge,
    } = billing;
    const fees = this.props.billingFees.data;
    const shipmtCount = fees.filter(item => item.status === 1).length;
    if (this.state.changed) {
      this.props.editBilling({
        tenantId,
        loginId,
        loginName,
        billingId,
        ccbCharge,
        trsCharge,
        adjustCharge,
        totalCharge,
        shipmtCount,
        fees,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.context.router.push('/scof/billing');
        }
      });
    } else {
      message.info('没有任何修改');
    }
  }
  handleTableFooter = () => {
    const { billing } = this.props;
    return (
      <div>
        <span style={{ marginLeft: 10 }}>账单总金额: </span><span style={{ color: '#FF0000' }}>{billing.totalCharge}</span>
        <span style={{ marginLeft: 10 }}>清关总金额: </span><span style={{ color: '#FF9933' }}>{billing.ccbCharge}</span>
        <span style={{ marginLeft: 10 }}>运输总金额: </span><span style={{ color: '#FF9933' }}>{billing.trsCharge}</span>
        <span style={{ marginLeft: 10 }}>调整总金额: </span><span style={{ color: '#FF9933' }}>{billing.adjustCharge}</span>
      </div>
    );
  }
  handleChangeAdjustCharges = (orderNo, adjustCharges) => {
    const { tenantId, tenantName } = this.props;
    this.setState({ changed: true });
    let charge = adjustCharges;
    if (adjustCharges === undefined) {
      charge = 0;
    }
    this.props.updateBillingFees(tenantId, tenantName, orderNo, 'adjust_charge', charge);
  }
  handleChangeStatus = (orderNo, status) => {
    const { tenantId, tenantName } = this.props;
    this.setState({ changed: true });
    let s = 0;
    if (status) s = 1;
    else s = 0;
    this.props.updateBillingFees(tenantId, tenantName, orderNo, 'status', s);
  }
  renderOperation() {
    const { operation } = this.props;
    if (operation === 'check') {
      return (
        <div className="toolbar-right">
          <Button type="primary" onClick={this.handleAccept}>{this.msg('accept')}</Button>
        </div>
      );
    } else if (operation === 'edit') {
      return (
        <div className="toolbar-right">
          <Button type="primary" onClick={this.handleEdit}>{this.msg('save')}</Button>
        </div>
      );
    }
    return '';
  }
  render() {
    const { billing, operation, loading } = this.props;
    const handleLableStyle = {
      marginRight: 30,
      lineHeight: 2,
      fontSize: 14,
    };
    const dataSource = this.props.billingFees.data;
    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_order_no',
      render: o => (<a onClick={() => this.props.loadOrderDetail(o, this.props.tenantId)}>{o}</a>),
    }, {
      title: '客户单号',
      dataIndex: 'cust_order_no',
      render: o => <TrimSpan text={o} />,
    }, {
      title: '委托编号',
      dataIndex: 'ccb_delg_no',
      render: o => <CcbDelgNoColumn nos={o} />,
    }, {
      title: '报关服务费',
      key: 'ccb_server_charge',
      dataIndex: 'ccb_server_charge',
      render: o => (o ? o.toFixed(2) : ''),
    }, {
      title: '报关代垫费用',
      key: 'ccb_cush_charge',
      dataIndex: 'ccb_cush_charge',
      render: o => (o ? o.toFixed(2) : ''),
    }, {
      title: '报关费用合计',
      key: 'ccbTotalCharge',
      dataIndex: 'ccbTotalCharge',
      render: (o, record) => {
        const charge = record.ccb_server_charge + record.ccb_cush_charge;
        return charge.toFixed(2);
      },
    }, {
      title: '运输单号',
      dataIndex: 'trs_shipmt_no',
      render(o) {
        return <TrsShipmtNoColumn nos={o} />;
      },
    }, {
      title: '基本运费',
      key: 'trs_freight_charge',
      dataIndex: 'trs_freight_charge',
      render: o => (o ? o.toFixed(2) : ''),
    }, {
      title: '特殊费用',
      key: 'trs_excp_charge',
      dataIndex: 'trs_excp_charge',
      render: o => (o ? o.toFixed(2) : ''),
    }, {
      title: '运输代垫费用',
      key: 'trs_advance_charge',
      dataIndex: 'trs_advance_charge',
      render: o => (o ? o.toFixed(2) : ''),
    }, {
      title: '运输费用合计',
      key: 'trsTotalCharge',
      dataIndex: 'trsTotalCharge',
      render: (o, record) => {
        const charge = record.trs_freight_charge + record.trs_excp_charge + record.trs_advance_charge;
        return charge.toFixed(2);
      },
    }, {
      title: '订单总费用',
      key: 'total_charge',
      dataIndex: 'total_charge',
      render: o => (o ? o.toFixed(2) : ''),
    }, {
      title: '调整金额',
      dataIndex: 'adjust_charge',
      render: (o, record) => (<InputNumber size="small" value={o} onChange={value => this.handleChangeAdjustCharges(record.shipmt_order_no, value)} />),
    }, {
      title: '最终费用',
      render: (o, record) => {
        const charge = record.ccb_server_charge + record.ccb_cush_charge + record.trs_freight_charge +
        record.trs_excp_charge + record.trs_advance_charge + record.adjust_charge;
        return charge.toFixed(2);
      },
    }, {
      title: '是否入账',
      dataIndex: 'status',
      fixed: 'right',
      width: 80,
      render: (o, record) => {
        if (operation === 'view') {
          return (<Checkbox disabled checked={o === 1 || o === 2} />);
        }
        return (<Checkbox checked={o === 1} onChange={e => this.handleChangeStatus(record.shipmt_order_no, e.target.checked)} />);
      },
    }, {
      title: '更新',
      dataIndex: 'last_updated_tenant_name',
      fixed: 'right',
      width: 150,
      render(o) {
        return <TrimSpan text={o} maxLen={10} />;
      },
    }, {
      title: '更新时间',
      dataIndex: 'last_updated_date',
      fixed: 'right',
      width: 150,
      render(o) {
        return o ? moment(o).format('YYYY.MM.DD HH:mm:ss') : '';
      },
    }];
    return (
      <div>
        <Header className="page-header">
          <span>{this.msg(`${operation}Billing`)}</span>
        </Header>
        <div className="page-header-tools">
          {this.renderOperation()}
        </div>
        <Content className="main-content">
          <div className="page-body">
            <div className="toolbar">
              <span style={handleLableStyle}>客户: <strong>{billing.customerName}</strong></span>
              <span style={handleLableStyle}>{this.msg('range')}: <strong>{moment(billing.beginDate).format('YYYY-MM-DD')} ~ {moment(billing.endDate).format('YYYY-MM-DD')}</strong></span>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table dataSource={dataSource} columns={columns} rowKey="id" footer={this.handleTableFooter} scroll={{ x: 2000 }} loading={loading} />
            </div>
          </div>
        </Content>
        {/* <OrderDockPanel stage="billing" />
        */}
      </div>
    );
  }
}
