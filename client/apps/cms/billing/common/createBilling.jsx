import React, { PropTypes } from 'react';
import { Button, InputNumber, Checkbox, Table, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadDispsByChooseModal, loadExpsByDisp, createBilling, updateBillingFees } from 'common/reducers/cmsBilling';
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
    dispIds: state.cmsBilling.dispIds,
    billingFees: state.cmsBilling.billingFees,
  }),
  { loadDispsByChooseModal, loadExpsByDisp, createBilling, updateBillingFees }
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
    loadDispsByChooseModal: PropTypes.func.isRequired,
    createBilling: PropTypes.func.isRequired,
    dispIds: PropTypes.array.isRequired,
    updateBillingFees: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    const { tenantId, type } = this.props;
    const { beginDate, endDate, chooseModel, partnerId, partnerTenantId } = this.props.billing;
    this.props.loadDispsByChooseModal({
      type,
      beginDate: moment(beginDate).format('YYYY-MM-DD 00:00:00'),
      endDate: moment(endDate).format('YYYY-MM-DD 23:59:59'),
      chooseModel,
      partnerId,
      partnerTenantId,
      tenantId,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.dispIds !== this.props.dispIds) {
      this.props.loadExpsByDisp(nextProps.dispIds, this.props.tenantId);
    }
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleSave = () => {
    const { loginId, tenantId, loginName, type } = this.props;
    const { beginDate, endDate, chooseModel, partnerTenantId, name,
    advanceCharge, servCharge, adjustCharge, totalCharge } = this.props.billing;
    const fees = this.props.billingFees.data;
    if (fees.length === 0) {
      message.error('没有费用');
    } else {
      this.props.createBilling({
        tenantId, loginId, loginName, name, chooseModel,
        beginDate: moment(beginDate).format('YYYY-MM-DD 00:00:00'),
        endDate: moment(endDate).format('YYYY-MM-DD 23:59:59'),
        advanceCharge, servCharge, adjustCharge, totalCharge,
        toTenantId: partnerTenantId, fees,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.context.router.push(`/clearance/billing/${type}`);
        }
      });
    }
  }
  handleChangeAdjustCharges = (Id, adjustCharges) => {
    const { tenantId } = this.props;
    let charge = adjustCharges;
    if (adjustCharges === undefined) {
      charge = 0;
    }
    this.props.updateBillingFees(tenantId, Id, 'adjust_charge', charge);
  }
  handleChangeStatus = (Id, status) => {
    const { tenantId } = this.props;
    let s = 0;
    if (status) s = 1;
    else s = 0;
    this.props.updateBillingFees(tenantId, Id, 'billing_status', s);
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
  render() {
    const { type, billing } = this.props;
    const handleLableStyle = {
      marginRight: 30,
      lineHeight: 2,
      fontSize: 14,
    };
    const dataSource = this.props.billingFees.data;
    let partnerSourceType = 'send';
    if (type === 'payable') {
      partnerSourceType = 'recv';
    } else if (type === 'receivable') {
      partnerSourceType = 'send';
    }
    const columns = [{
      title: '委托编号',
      dataIndex: 'delg_no',
      width: 120,
    }, {
      title: '合作方',
      dataIndex: `${partnerSourceType}_name`,
      width: 160,
      render(o) {
        return <TrimSpan text={o} maxLen={10} />;
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
          <div className="tools">
            <Button type="primary" onClick={this.handleSave}>{this.msg('save')}</Button>
          </div>
          <span>{this.msg('createBilling')}</span>
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <span style={handleLableStyle}>{this.msg('partner')}: <strong>{billing.partnerName}</strong></span>
              <span style={handleLableStyle}>{this.msg('range')}: <strong>{moment(billing.beginDate).format('YYYY-MM-DD')} ~ {moment(billing.endDate).format('YYYY-MM-DD')}</strong></span>
              <span style={handleLableStyle}>{this.msg('chooseModel')}: <strong>{this.msg(billing.chooseModel)}</strong></span>
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
