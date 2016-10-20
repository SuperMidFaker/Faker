import React, { PropTypes } from 'react';
import { Button, InputNumber, Checkbox, message, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { updateBillingFees, checkBilling, acceptBilling, editBilling } from 'common/reducers/cmsBilling';
import TrimSpan from 'client/components/trimSpan';

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
    billing: state.cmsBilling.billing,
    billingFees: state.cmsBilling.billingFees,
  }),
  { updateBillingFees, checkBilling, acceptBilling, editBilling }
)

export default class BillingFeeList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    billing: PropTypes.object.isRequired,
    billingFees: PropTypes.object.isRequired,
    updateBillingFees: PropTypes.func.isRequired,
    checkBilling: PropTypes.func.isRequired,
    acceptBilling: PropTypes.func.isRequired,
    editBilling: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
    operation: PropTypes.oneOf(['check', 'edit', 'view']),
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
    const modifyTimes = billing.modifyTimes || 0 + 1;
    if (this.state.changed) {
      this.props.checkBilling({
        tenantId, loginId, loginName, billingId, adjustCharge, totalCharge,
        modifyTimes, fees,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.context.router.push(`/clearance/billing/${type}`);
        }
      });
    } else {
      this.props.acceptBilling({ tenantId, loginId, loginName, billingId }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.context.router.push(`/clearance/billing/${type}`);
        }
      });
    }
  }
  handleEdit = () => {
    const { loginId, tenantId, loginName, type, billing } = this.props;
    const { id: billingId, adjustCharge, totalCharge } = billing;
    const fees = this.props.billingFees.data;
    if (this.state.changed) {
      this.props.editBilling({
        tenantId, loginId, loginName, billingId, adjustCharge, totalCharge, fees,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.context.router.push(`/clearance/billing/${type}`);
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
        <span style={{ marginLeft: 10 }}>服务费总金额: </span><span style={{ color: '#FF9933' }}>{billing.servCharge}</span>
        <span style={{ marginLeft: 10 }}>调整总金额: </span><span style={{ color: '#FF9933' }}>{billing.adjustCharge}</span>
      </div>
    );
  }
  handleChangeAdjustCharges = (dispId, adjustCharges) => {
    const { tenantId } = this.props;
    this.setState({ changed: true });
    let charge = adjustCharges;
    if (adjustCharges === undefined) {
      charge = 0;
    }
    this.props.updateBillingFees(tenantId, dispId, 'adjust_charge', charge);
  }
  handleChangeStatus = (dispId, status) => {
    const { tenantId } = this.props;
    this.setState({ changed: true });
    let s = 0;
    if (status) s = 1;
    else s = 0;
    this.props.updateBillingFees(tenantId, dispId, 'billing_status', s);
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
    if (tenantId === billing.sendTenantId) {
      partnerName = billing.recvName;
    } else if (tenantId === billing.recvTenantId) {
      partnerName = billing.sendName;
    }
    let updataName = '';
    if (billing.modifyTenantId === billing.recvTenantId) {
      updataName = billing.recvName;
    } else if (billing.modifyTenantId === billing.sendTenantId) {
      updataName = billing.sendName;
    }
    const handleLableStyle = {
      marginRight: 30,
      lineHeight: 2,
      fontSize: 14,
    };
    const handleStateStyle = {
      float: 'right',
      marginLeft: 20,
      lineHeight: 2,
      fontSize: 12,
    };
    const dataSource = this.props.billingFees.data;
    const columns = [ {
      title: '委托编号',
      dataIndex: 'delg_no',
      width: 120,
    }, {
      title: '合作方',
      width: 160,
      render() {
        return <TrimSpan text={partnerName} maxLen={10} />;
      },
    }, {
      title: '发票号',
      dataIndex: 'invoice_no',
      width: 120,
    }, {
      title: '服务费用',
      dataIndex: 'serv_charge',
      width: 120,
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '代垫费用',
      dataIndex: 'advance_charge',
      width: 120,
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '调整金额',
      dataIndex: 'adjust_charge',
      width: 120,
      render: (o, record) => {
        return (<InputNumber size="small" defaultValue={o} step={0.01} onChange={value => this.handleChangeAdjustCharges(record.disp_id, value)} />);
      },
    }, {
      title: '最终费用',
      width: 120,
      render(o, record) {
        let total = 0;
        if (record.advance_charge !== null) {
          total += record.advance_charge;
        }
        if (record.serv_charge !== null) {
          total += record.serv_charge;
        }
        if (record.adjust_charge) {
          total += record.adjust_charge;
        }
        return total.toFixed(2);
      },
    }, {
      title: '是否入账',
      dataIndex: 'billing_status',
      width: 120,
      render: (o, record) => {
        return (<Checkbox defaultChecked={o === 1} onChange={e => this.handleChangeStatus(record.disp_id, e.target.checked)} />);
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
              <span style={handleStateStyle}>{this.msg('lastUpdateTime')}: <strong>{moment(billing.modifyTime).format('YYYY-MM-DD')}</strong></span>
              <span style={handleStateStyle}>{this.msg('lastUpdate')}: <strong>{updataName}</strong></span>
            </div>
            <div className="panel-body table-panel">
              <Table dataSource={dataSource} columns={columns} rowKey="id" footer={this.handleTableFooter} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
