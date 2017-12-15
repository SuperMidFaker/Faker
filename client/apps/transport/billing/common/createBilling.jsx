import React from 'react';
import PropTypes from 'prop-types';
import { Button, InputNumber, Layout, Icon, Checkbox, Table, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadFeesByChooseModal, createBilling, updateBillingFees } from 'common/reducers/transportBilling';
import AddressColumn from '../../common/addressColumn';
import TrimSpan from 'client/components/trimSpan';
import BeforeFeesModal from './beforeFeesModal';
import ExceptionsPopover from '../../common/popover/exceptionsPopover';
import ShipmentDockPanel from '../../shipment/dock/shipmentDockPanel';
import { loadShipmtDetail } from 'common/reducers/shipment';
import ActualDate from '../../common/actualDate';
import OrderDockPanel from '../../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../../cms/common/dock/delegationDockPanel';

const formatMsg = format(messages);
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    billing: state.transportBilling.billing,
    billingFees: state.transportBilling.billingFees,
    saving: state.transportBilling.billingSaving,
  }),
  {
    loadFeesByChooseModal, createBilling, updateBillingFees, loadShipmtDetail,
  }
)
export default class CreateBilling extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
    billing: PropTypes.object.isRequired,
    billingFees: PropTypes.object.isRequired,
    loadFeesByChooseModal: PropTypes.func.isRequired,
    createBilling: PropTypes.func.isRequired,
    updateBillingFees: PropTypes.func.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }
  state = {
    beforeFeesModalVisible: false,
  }

  componentDidMount() {
    const { tenantId, type } = this.props;
    const {
      beginDate, endDate, chooseModel, partnerId, partnerTenantId,
    } = this.context.location.query;
    this.props.loadFeesByChooseModal({
      type,
      beginDate,
      endDate,
      chooseModel,
      partnerId,
      partnerTenantId,
      tenantId,
    });
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  toggleBeforeFeesModal = () => {
    this.setState({ beforeFeesModalVisible: !this.state.beforeFeesModalVisible });
  }
  handleSave = () => {
    const {
      loginId, tenantId, loginName, type,
    } = this.props;
    const {
      freightCharge,
      advanceCharge, excpCharge, adjustCharge, totalCharge,
    } = this.props.billing;
    const {
      beginDate, endDate, chooseModel, partnerTenantId, name,
    } = this.context.location.query;
    const fees = this.props.billingFees.data;
    if (fees.length === 0) {
      message.error('没有运单');
    } else {
      const shipmtCount = fees.filter(item => item.status === 1).length;
      const fee = fees[0];
      this.props.createBilling({
        tenantId,
        loginId,
        loginName,
        name,
        chooseModel,
        beginDate,
        endDate,
        freightCharge,
        advanceCharge,
        excpCharge,
        adjustCharge,
        totalCharge,
        srTenantId: fee.sr_tenant_id,
        srPartnerId: fee.sr_partner_id,
        srName: fee.sr_name,
        spTenantId: fee.sp_tenant_id,
        spPartnerId: fee.sp_partner_id,
        spName: fee.sp_name,
        toTenantId: partnerTenantId,
        shipmtCount,
        fees,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.context.router.push(`/transport/billing/${type}`);
        }
      });
    }
  }
  handleChangeAdjustCharges = (feeId, adjustCharges) => {
    const { tenantId } = this.props;
    let charge = adjustCharges;
    if (adjustCharges === undefined) {
      charge = 0;
    }
    this.props.updateBillingFees(tenantId, feeId, 'adjust_charge', charge);
  }
  handleChangeStatus = (feeId, status) => {
    const { tenantId } = this.props;
    let s = 0;
    if (status) s = 1;
    else s = 0;
    this.props.updateBillingFees(tenantId, feeId, 'status', s);
  }
  handleTableFooter = () => {
    const { billing } = this.props;
    return (
      <div>
        <span style={{ marginLeft: 10 }}>账单总金额: </span><span style={{ color: '#FF0000' }}>{billing.totalCharge}</span>
        <span style={{ marginLeft: 10 }}>代垫总金额: </span><span style={{ color: '#FF9933' }}>{billing.advanceCharge}</span>
        <span style={{ marginLeft: 10 }}>运费总金额: </span><span style={{ color: '#FF9933' }}>{billing.freightCharge}</span>
        <span style={{ marginLeft: 10 }}>特殊费用总金额: </span><span style={{ color: '#FF9933' }}>{billing.excpCharge}</span>
        <span style={{ marginLeft: 10 }}>调整总金额: </span><span style={{ color: '#FF9933' }}>{billing.adjustCharge}</span>
      </div>
    );
  }
  render() {
    const { type, saving } = this.props;
    const {
      beginDate, endDate, chooseModel, partnerName,
    } = this.context.location.query;
    const handleLableStyle = {
      marginRight: 30,
      lineHeight: 2,
      fontSize: 12,
    };
    const dataSource = this.props.billingFees.data;
    let partnerSourceType = '承运商';
    if (type === 'payable') {
      partnerSourceType = '承运商';
    } else if (type === 'receivable') {
      partnerSourceType = '客户';
    }
    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
      render: (o, record) => (<a onClick={() => this.props.loadShipmtDetail(record.shipmt_no, this.props.tenantId, 'sr', 'charge')}>{record.shipmt_no}</a>),
    }, {
      title: '客户单号',
      dataIndex: 'ref_external_no',
      render: o => <TrimSpan text={o} />,
    }, {
      title: '费率',
      dataIndex: 'charge_gradient',
    }, {
      title: '计费量',
      dataIndex: 'charge_amount',
    }, {
      title: '运费',
      dataIndex: 'total_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '特殊费用',
      dataIndex: 'excp_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '代垫费用',
      dataIndex: 'advance_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '调整金额',
      dataIndex: 'adjust_charge',
      render: (o, record) => (<InputNumber size="small" value={o || 0} step={0.01} onChange={value => this.handleChangeAdjustCharges(record.id, value)} />),
    }, {
      title: '最终费用',
      render(o, record) {
        let totalCharge = 0;
        if (record.advance_charge !== null) {
          totalCharge += record.advance_charge;
        }
        if (record.excp_charge !== null) {
          totalCharge += record.excp_charge;
        }
        if (record.adjust_charge !== null) {
          totalCharge += record.adjust_charge;
        }
        if (record.total_charge !== null) {
          totalCharge += record.total_charge;
        }
        return totalCharge.toFixed(2);
      },
    }, {
      title: '始发地',
      dataIndex: 'consigner_province',
      render(o, record) {
        return (<AddressColumn shipment={record} consignType="consigner" />);
      },
    }, {
      title: '目的地',
      dataIndex: 'consignee_province',
      render(o, record) {
        return (<AddressColumn shipment={record} consignType="consignee" />);
      },
    }, {
      title: '运输模式',
      dataIndex: 'transport_mode',
    }, {
      title: '实际提货时间',
      dataIndex: 'pickup_act_date',
      render: (o, record) => <ActualDate actDate={record.pickup_act_date} estDate={record.pickup_est_date} />,
    }, {
      title: '实际送货时间',
      dataIndex: 'deliver_act_date',
      render: (o, record) => <ActualDate actDate={record.deliver_act_date} estDate={record.deliver_est_date} />,
    }, {
      title: '异常',
      dataIndex: 'excp_count',
      render(o, record) {
        return (<ExceptionsPopover
          shipmtNo={record.shipmt_no}
          dispId={record.disp_id}
          excpCount={o}
        />);
      },
    }, {
      title: '回单',
      dataIndex: 'pod_status',
      render(o) {
        if (!o || o === 0) {
          return '';
        }
        return <Icon type="link" />;
      },
    }, {
      title: '是否入账',
      dataIndex: 'status',
      render: (o, record) => (<Checkbox defaultChecked={o === 1} onChange={e => this.handleChangeStatus(record.id, e.target.checked)} />),
    }];
    return (
      <div>
        <Header className="page-header">
          <span>{this.msg('createBilling')}</span>
          <div className="page-header-tools">
            <Button type="primary" onClick={this.handleSave} loading={saving}>{this.msg('save')}</Button>
          </div>
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <div className="toolbar">
              <span style={handleLableStyle}>{partnerSourceType}: <strong>{partnerName}</strong></span>
              <span style={handleLableStyle}>{this.msg('range')}: <strong>{moment(beginDate).format('YYYY-MM-DD')} ~ {moment(endDate).format('YYYY-MM-DD')}</strong></span>
              <span style={handleLableStyle}>{this.msg('chooseModel')}: <strong>{this.msg(chooseModel)}</strong></span>
              <Button type="default" className="pull-right" onClick={this.toggleBeforeFeesModal}>未入账运单</Button>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table dataSource={dataSource} columns={columns} rowKey="id" footer={this.handleTableFooter} />
            </div>
            <BeforeFeesModal type={type} visible={this.state.beforeFeesModalVisible} toggle={this.toggleBeforeFeesModal} />
          </div>
        </Content>
        <ShipmentDockPanel />
        <OrderDockPanel />
        <DelegationDockPanel />
      </div>
    );
  }
}
