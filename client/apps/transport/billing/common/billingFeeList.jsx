import React from 'react';
import PropTypes from 'prop-types';
import { Button, InputNumber, Layout, Checkbox, message, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { loadShipmtDetail } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import { loadFeesByBillingId, updateBillingFees, checkBilling, acceptBilling, editBilling } from 'common/reducers/transportBilling';
import TrimSpan from 'client/components/trimSpan';
import messages from '../message.i18n';
import ShipmentDockPanel from '../../shipment/dock/shipmentDockPanel';
import ExceptionsPopover from '../../common/popover/exceptionsPopover';
import ActualDate from '../../common/actualDate';
import DeliveryDockPanel from '../../../scof/shipments/docks/shipmentDockPanel';
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
    loadFeesByBillingId,
    updateBillingFees,
    checkBilling,
    acceptBilling,
    editBilling,
    loadShipmtDetail,
  }
)
export default class BillingFeeList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    updateBillingFees: PropTypes.func.isRequired,
    checkBilling: PropTypes.func.isRequired,
    acceptBilling: PropTypes.func.isRequired,
    editBilling: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
    operation: PropTypes.oneOf(['check', 'edit', 'view']),
    loadShipmtDetail: PropTypes.func.isRequired,
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
      loginId, tenantId, loginName, type, billing,
    } = this.props;
    const {
      id: billingId, freightCharge, advanceCharge, excpCharge, adjustCharge, totalCharge,
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
        freightCharge,
        advanceCharge,
        excpCharge,
        adjustCharge,
        totalCharge,
        modifyTimes,
        shipmtCount,
        fees,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.context.router.push(`/transport/billing/${type}`);
        }
      });
    } else {
      this.props.acceptBilling({
        tenantId, loginId, loginName, billingId,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.context.router.push(`/transport/billing/${type}`);
        }
      });
    }
  }
  handleEdit = () => {
    const {
      loginId, tenantId, loginName, type, billing,
    } = this.props;
    const {
      id: billingId, freightCharge, advanceCharge, excpCharge, adjustCharge, totalCharge,
    } = billing;
    const fees = this.props.billingFees.data;
    const shipmtCount = fees.filter(item => item.status === 1).length;
    if (this.state.changed) {
      this.props.editBilling({
        tenantId,
        loginId,
        loginName,
        billingId,
        freightCharge,
        advanceCharge,
        excpCharge,
        adjustCharge,
        totalCharge,
        shipmtCount,
        fees,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.context.router.push(`/transport/billing/${type}`);
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
        <span style={{ marginLeft: 10 }}>代垫总金额: </span><span style={{ color: '#FF9933' }}>{billing.advanceCharge}</span>
        <span style={{ marginLeft: 10 }}>运费总金额: </span><span style={{ color: '#FF9933' }}>{billing.freightCharge}</span>
        <span style={{ marginLeft: 10 }}>特殊费用总金额: </span><span style={{ color: '#FF9933' }}>{billing.excpCharge}</span>
        <span style={{ marginLeft: 10 }}>调整总金额: </span><span style={{ color: '#FF9933' }}>{billing.adjustCharge}</span>
      </div>
    );
  }
  handleChangeAdjustCharges = (feeId, adjustCharges) => {
    const { tenantId } = this.props;
    this.setState({ changed: true });
    let charge = adjustCharges;
    if (adjustCharges === undefined) {
      charge = 0;
    }
    this.props.updateBillingFees(tenantId, feeId, 'adjust_charge', charge);
  }
  handleChangeStatus = (feeId, status) => {
    const { tenantId } = this.props;
    this.setState({ changed: true });
    let s = 0;
    if (status) s = 1;
    else s = 0;
    this.props.updateBillingFees(tenantId, feeId, 'status', s);
  }
  renderOperation() {
    const { operation, saving } = this.props;
    if (operation === 'check') {
      return (
        <Button type="primary" onClick={this.handleAccept} loading={saving}>{this.msg('accept')}</Button>
      );
    } else if (operation === 'edit') {
      return (
        <Button type="primary" onClick={this.handleEdit} loading={saving}>{this.msg('save')}</Button>
      );
    }
    return '';
  }
  render() {
    const {
      billing, tenantId, operation, type,
    } = this.props;
    let partnerName = '';
    if (tenantId === billing.srTenantId) {
      partnerName = billing.spName;
    } else if (tenantId === billing.spTenantId) {
      partnerName = billing.srName;
    }
    let partnerSourceType = '承运商';
    if (type === 'payable') {
      partnerSourceType = '承运商';
    } else if (type === 'receivable') {
      partnerSourceType = '客户';
    }
    const handleLableStyle = {
      marginRight: 30,
      lineHeight: 2,
      fontSize: 14,
    };
    const dataSource = this.props.billingFees.data;
    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
      fixed: 'left',
      width: 150,
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
      dataIndex: 'charg_amount',
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
      render: (o, record) => {
        if (operation === 'view') {
          return o ? o.toFixed(2) : '';
        }
        return (<InputNumber size="small" value={o || 0} step={0.01} onChange={value => this.handleChangeAdjustCharges(record.id, value)} />);
      },
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
    }, {
      title: '目的地',
      dataIndex: 'consignee_province',
    }, {
      title: '运输模式',
      dataIndex: 'transport_mode',
    }, {
      title: '实际提货时间',
      dataIndex: 'pickup_act_date',
      render: (o, record) =>
        <ActualDate actDate={record.pickup_act_date} estDate={record.pickup_est_date} />,
    }, {
      title: '实际送货时间',
      dataIndex: 'deliver_act_date',
      render: (o, record) =>
        <ActualDate actDate={record.deliver_act_date} estDate={record.deliver_est_date} />,
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
    }, {
      title: '是否入账',
      dataIndex: 'status',
      fixed: 'right',
      width: 80,
      render: (o, record) => {
        if (operation === 'view') {
          return (<Checkbox disabled defaultChecked={o === 1 || o === 2} />);
        }
        return (<Checkbox
          defaultChecked={o === 1}
          onChange={e => this.handleChangeStatus(record.id, e.target.checked)}
        />);
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
          <div className="page-header-tools">
            {this.renderOperation()}
          </div>
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <div className="toolbar">
              <span style={handleLableStyle}>
                {partnerSourceType}: <strong>{partnerName}</strong>
              </span>
              <span style={handleLableStyle}>{this.msg('range')}: <strong>{moment(billing.beginDate).format('YYYY-MM-DD')} ~ {moment(billing.endDate).format('YYYY-MM-DD')}</strong></span>
              <span style={handleLableStyle}>{this.msg('chooseModel')}: <strong>{this.msg(billing.chooseModel)}</strong></span>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table dataSource={dataSource} columns={columns} rowKey="id" footer={this.handleTableFooter} scroll={{ x: 2000 }} />
            </div>
          </div>
        </Content>
        <ShipmentDockPanel />
        <DeliveryDockPanel />
        <DelegationDockPanel />
      </div>
    );
  }
}
