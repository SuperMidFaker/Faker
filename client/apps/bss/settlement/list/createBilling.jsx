import React from 'react';
import PropTypes from 'prop-types';
import { Button, InputNumber, Layout, Checkbox, Table, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { loadFeesByChooseModal, loadClearanceFeesByChooseModal, loadTransportFeesByChooseModal,
  createBilling, updateBillingFees, showBeforeFeesModal } from 'common/reducers/crmBilling';
import { loadOrderDetail } from 'common/reducers/crmOrders';
import TrimSpan from 'client/components/trimSpan';
import BeforeFeesModal from './beforeFeesModal';
// import OrderDockPanel from '../../orders/docks/orderDockPanel';
import TrsShipmtNoColumn from '../../common/trsShipmtNoColumn';
import CcbDelgNoColumn from '../../common/ccbDelgNoColumn';
import { CRM_ORDER_MODE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
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
  }),
  {
    loadFeesByChooseModal,
    loadClearanceFeesByChooseModal,
    loadTransportFeesByChooseModal,
    createBilling,
    updateBillingFees,
    loadOrderDetail,
    showBeforeFeesModal,
  }
)
export default class CreateBilling extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    billing: PropTypes.object.isRequired,
    billingFees: PropTypes.object.isRequired,
    loadFeesByChooseModal: PropTypes.func.isRequired,
    loadClearanceFeesByChooseModal: PropTypes.func.isRequired,
    loadTransportFeesByChooseModal: PropTypes.func.isRequired,
    createBilling: PropTypes.func.isRequired,
    updateBillingFees: PropTypes.func.isRequired,
    loadOrderDetail: PropTypes.func.isRequired,
    showBeforeFeesModal: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }

  componentWillMount() {
    const { tenantId } = this.props;
    const { beginDate, endDate, partnerId } = this.context.location.query;
    this.props.loadFeesByChooseModal({
      beginDate,
      endDate,
      partnerId,
      tenantId,
    }).then((result) => {
      if (!result.error) {
        const shipmtOrders = [];
        this.props.billingFees.data.forEach((item) => {
          shipmtOrders.push({
            trs_shipmt_no: item.trs_shipmt_no,
            ccb_delg_no: item.ccb_delg_no,
            shipmt_order_no: item.shipmt_order_no,
          });
        });
        this.props.loadTransportFeesByChooseModal(shipmtOrders);
        this.props.loadClearanceFeesByChooseModal(shipmtOrders);
      }
    });
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)

  handleSave = () => {
    const {
      loginId, tenantId, tenantName, loginName,
    } = this.props;
    const {
      ccbCharge, trsCharge, adjustCharge, totalCharge,
    } = this.props.billing;
    const {
      beginDate, endDate, partnerName, partnerId, partnerCode, partnerTenantId, name,
    } = this.context.location.query;
    const fees = this.props.billingFees.data.map(item => ({
      ...item,
      customer_tenant_id: partnerTenantId,
      customer_partner_id: partnerId,
      customer_name: partnerName,
      last_updated_tenant_name: tenantName,
    }));
    if (fees.length === 0) {
      message.error('没有运单');
    } else {
      const shipmtCount = fees.filter(item => item.status === 1).length;
      this.props.createBilling({
        tenantId,
        loginId,
        loginName,
        name,
        beginDate,
        endDate,
        ccbCharge,
        trsCharge,
        adjustCharge,
        totalCharge,
        customerTenantId: Number(partnerTenantId),
        customerPartnerId: Number(partnerId),
        customerName: partnerName,
        customerCode: partnerCode,
        shipmtCount,
        fees,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.context.router.push('/scof/billing');
        }
      });
    }
  }
  handleChangeAdjustCharges = (orderNo, adjustCharges) => {
    const { tenantId, tenantName } = this.props;
    let charge = adjustCharges;
    if (adjustCharges === undefined) {
      charge = 0;
    }
    this.props.updateBillingFees(tenantId, tenantName, orderNo, 'adjust_charge', charge);
  }
  handleChangeStatus = (orderNo, status) => {
    const { tenantId, tenantName } = this.props;
    let s = 0;
    if (status) s = 1;
    else s = 0;
    this.props.updateBillingFees(tenantId, tenantName, orderNo, 'status', s);
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
  renderTransportCharge = (o, record) => {
    if (record.shipmt_order_mode.indexOf(CRM_ORDER_MODE.transport) >= 0) {
      return o ? o.toFixed(2) : '';
    } else {
      return '';
    }
  }
  renderClearanceCharge = (o, record) => {
    if (record.shipmt_order_mode.indexOf(CRM_ORDER_MODE.clearance) >= 0) {
      return o ? o.toFixed(2) : '';
    } else {
      return '';
    }
  }
  render() {
    // const { } = this.props;
    const { beginDate, endDate, partnerName } = this.context.location.query;
    const handleLableStyle = {
      marginRight: 30,
      lineHeight: 2,
      fontSize: 12,
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
      render: this.renderClearanceCharge,
    }, {
      title: '报关代垫费用',
      key: 'ccb_cush_charge',
      dataIndex: 'ccb_cush_charge',
      render: this.renderClearanceCharge,
    }, {
      title: '报关费用合计',
      key: 'ccbTotalCharge',
      dataIndex: 'ccbTotalCharge',
      render: this.renderClearanceCharge,
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
      render: this.renderTransportCharge,
    }, {
      title: '特殊费用',
      key: 'trs_excp_charge',
      dataIndex: 'trs_excp_charge',
      render: this.renderTransportCharge,
    }, {
      title: '运输代垫费用',
      key: 'trs_advance_charge',
      dataIndex: 'trs_advance_charge',
      render: this.renderTransportCharge,
    }, {
      title: '运输费用合计',
      key: 'trsTotalCharge',
      dataIndex: 'trsTotalCharge',
      render: this.renderTransportCharge,
    }, {
      title: '订单总费用',
      key: 'total_charge',
      dataIndex: 'total_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '调整金额',
      dataIndex: 'adjust_charge',
      render: (o, record) => (<InputNumber size="small" value={o} onChange={value => this.handleChangeAdjustCharges(record.shipmt_order_no, value)} />),
    }, {
      title: '最终费用',
      render(o, record) {
        let finalFee = 0;
        if (record.ccbTotalCharge) finalFee += record.ccbTotalCharge;
        if (record.trsTotalCharge) finalFee += record.trsTotalCharge;
        if (record.adjust_charge) finalFee += record.adjust_charge;
        return finalFee.toFixed(2);
      },
    }, {
      title: '是否入账',
      dataIndex: 'status',
      render: (o, record) => (<Checkbox checked={o === 1} onChange={e => this.handleChangeStatus(record.shipmt_order_no, e.target.checked)} />),
    }];
    return (
      <div>
        <Header className="page-header">
          <span>{this.msg('createBilling')}</span>
        </Header>
        <div className="page-header-tools">
          <Button type="primary" onClick={this.handleSave}>{this.msg('save')}</Button>
        </div>
        <Content className="main-content">
          <div className="page-body">
            <div className="toolbar">
              <span style={handleLableStyle}>客户: <strong>{partnerName}</strong></span>
              <span style={handleLableStyle}>{this.msg('range')}: <strong>{moment(beginDate).format('YYYY-MM-DD')} ~ {moment(endDate).format('YYYY-MM-DD')}</strong></span>
              <Button type="default" className="pull-right" onClick={() => this.props.showBeforeFeesModal(true)}>未入账运单</Button>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table dataSource={dataSource} columns={columns} rowKey="id" footer={this.handleTableFooter} />
            </div>
            <BeforeFeesModal />
          </div>
        </Content>
        {/* <OrderDockPanel stage="billing" />
        */}
      </div>
    );
  }
}
