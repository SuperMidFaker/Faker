import React, { PropTypes } from 'react';
import { Button, InputNumber, Checkbox, message, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadFeesByBillingId, updateBillingFees, checkBilling, acceptBilling, editBilling } from 'common/reducers/transportBilling';
import TrimSpan from 'client/components/trimSpan';
import PreviewPanel from '../../shipment/modals/preview-panel';
import { loadShipmtDetail } from 'common/reducers/shipment';
import ExceptionListPopover from '../../tracking/land/modals/exception-list-popover';
import ActDate from '../../common/actDate';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    billing: state.transportBilling.billing,
    billingFees: state.transportBilling.billingFees,
  }),
  { loadFeesByBillingId, updateBillingFees, checkBilling, acceptBilling, editBilling, loadShipmtDetail }
)
export default class BillingFeeList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    billing: PropTypes.object.isRequired,
    billingFees: PropTypes.object.isRequired,
    loadFeesByBillingId: PropTypes.func.isRequired,
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
    const { loginId, tenantId, loginName, type, billing } = this.props;
    const { id: billingId, adjustCharge, totalCharge } = billing;
    const fees = this.props.billingFees.data;
    const modifyTimes = billing.modifyTimes + 1;
    const shipmtCount = fees.filter(item => item.status === 1).length;
    if (this.state.changed) {
      this.props.checkBilling({
        tenantId, loginId, loginName, billingId, adjustCharge, totalCharge,
        modifyTimes, shipmtCount, fees,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.context.router.push(`/transport/billing/${type}`);
        }
      });
    } else {
      this.props.acceptBilling({ tenantId, loginId, loginName, billingId }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.context.router.push(`/transport/billing/${type}`);
        }
      });
    }
  }
  handleEdit = () => {
    const { loginId, tenantId, loginName, type, billing } = this.props;
    const { id: billingId, adjustCharge, totalCharge } = billing;
    const fees = this.props.billingFees.data;
    const shipmtCount = fees.filter(item => item.status === 1).length;
    if (this.state.changed) {
      this.props.editBilling({
        tenantId, loginId, loginName, billingId, adjustCharge, totalCharge,
        shipmtCount, fees,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
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
    const { operation } = this.props;
    if (operation === 'check') {
      return (
        <div className="tools">
          <Button type="primary" onClick={this.handleAccept}>{this.msg('accept')}</Button>
        </div>
      );
    } else if (operation === 'edit') {
      return (
        <div className="tools">
          <Button type="primary" onClick={this.handleEdit}>{this.msg('save')}</Button>
        </div>
      );
    }
    return '';
  }
  render() {
    const { billing, tenantId, operation } = this.props;
    let partnerName = '';
    if (tenantId === billing.srTenantId) {
      partnerName = billing.spName;
    } else if (tenantId === billing.spTenantId) {
      partnerName = billing.srName;
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
      render: (o, record) => {
        return (<a onClick={() => this.props.loadShipmtDetail(record.shipmt_no, this.props.tenantId, 'sr', 'charge', record)}>{record.shipmt_no}</a>);
      },
    }, {
      title: '客户',
      render() {
        return <TrimSpan text={partnerName} maxLen={10} />;
      },
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
        return (<InputNumber size="small" defaultValue={o} step={0.01} onChange={value => this.handleChangeAdjustCharges(record.id, value)} />);
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
      render: (o, record) => {
        return <ActDate actDate={record.pickup_act_date} estDate={record.pickup_est_date} />;
      },
    }, {
      title: '实际交货时间',
      dataIndex: 'deliver_act_date',
      render: (o, record) => {
        return <ActDate actDate={record.deliver_act_date} estDate={record.deliver_est_date} />;
      },
    }, {
      title: '异常',
      dataIndex: 'excp_count',
      render(o, record) {
        return (<ExceptionListPopover
          shipmtNo={record.shipmt_no}
          dispId={record.disp_id}
          excpCount={o}
          onShowExcpModal={() => {}}
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
        return (<Checkbox defaultChecked={o === 1} onChange={e => this.handleChangeStatus(record.id, e.target.checked)} />);
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
        <header className="top-bar">
          {this.renderOperation()}
          <span>{this.msg(`${operation}Billing`)}</span>
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <span style={handleLableStyle}>{this.msg('partner')}: <strong>{partnerName}</strong></span>
              <span style={handleLableStyle}>{this.msg('range')}: <strong>{moment(billing.beginDate).format('YYYY-MM-DD')} ~ {moment(billing.endDate).format('YYYY-MM-DD')}</strong></span>
              <span style={handleLableStyle}>{this.msg('chooseModel')}: <strong>{this.msg(billing.chooseModel)}</strong></span>
            </div>
            <div className="panel-body table-panel">
              <Table dataSource={dataSource} columns={columns} rowKey="id" footer={this.handleTableFooter} scroll={{ x: 2000 }} />
            </div>
          </div>
        </div>
        <PreviewPanel stage="billing" />
      </div>
    );
  }
}