import React, { PropTypes } from 'react';
import { Button, InputNumber, Icon, Checkbox, Table, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadFeesByChooseModal, createBilling, updateBillingFees } from 'common/reducers/transportBilling';
import { renderConsignLoc } from '../../common/consignLocation';
import TrimSpan from 'client/components/trimSpan';

const formatMsg = format(messages);

@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    billing: state.transportBilling.billing,
    billingFees: state.transportBilling.billingFees,
  }),
  { loadFeesByChooseModal, createBilling, updateBillingFees }
)

export default class CreateBilling extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
    billing: PropTypes.object.isRequired,
    billingFees: PropTypes.object.isRequired,
    loadFeesByChooseModal: PropTypes.func.isRequired,
    createBilling: PropTypes.func.isRequired,
    updateBillingFees: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    const { tenantId, type } = this.props;
    const { beginDate, endDate, chooseModel, partnerId, partnerTenantId } = this.props.billing;
    this.props.loadFeesByChooseModal({
      type,
      beginDate: moment(beginDate).format('YYYY-MM-DD 00:00:00'),
      endDate: moment(endDate).format('YYYY-MM-DD 23:59:59'),
      chooseModel,
      partnerId,
      partnerTenantId,
      tenantId,
    });
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleSave = () => {
    const { loginId, tenantId, type } = this.props;
    const { beginDate, endDate, chooseModel, partnerTenantId, name, freightCharge,
    advanceCharge, excpCharge, adjustCharge, totalCharge } = this.props.billing;
    const fees = this.props.billingFees.data;
    if (fees.length === 0) {
      message.error('没有运单');
    } else {
      const shipmtCount = fees.filter(item => item.status === 1).length;
      const fee = fees[0];
      this.props.createBilling({
        tenantId, loginId, name, chooseModel, beginDate: moment(beginDate).format('YYYY-MM-DD 00:00:00'),
        endDate: moment(endDate).format('YYYY-MM-DD 23:59:59'), freightCharge,
        advanceCharge, excpCharge, adjustCharge, totalCharge, srTenantId: fee.sr_tenant_id, srName: fee.sr_name,
        spTenantId: fee.sp_tenant_id, spName: fee.sp_name, toTenantId: partnerTenantId,
        shipmtCount, fees,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.context.router.push(`/transport/billing/${type}`);
        }
      });
    }
  }
  handleChangeAdjustCharges = (feeId, adjustCharges) => {
    this.props.updateBillingFees(null, feeId, 'adjust_charge', adjustCharges);
  }
  handleChangeStatus = (feeId, status) => {
    let s = 0;
    if (status) s = 1;
    else s = 0;
    this.props.updateBillingFees(null, feeId, 'status', s);
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
    const { type, billing } = this.props;

    const handleLableStyle = {
      marginRight: 30,
      lineHeight: 2,
      fontSize: 14,
    };
    const dataSource = this.props.billingFees.data;
    let partnerSourceType = 'sp';
    if (type === 'payable') {
      partnerSourceType = 'sp';
    } else if (type === 'receivable') {
      partnerSourceType = 'sr';
    }
    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
    }, {
      title: '客户',
      dataIndex: `${partnerSourceType}_name`,
      render(o) {
        return <TrimSpan text={o} maxLen={10} />;
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
      title: '异常',
      dataIndex: 'excp_count',
    }, {
      title: '始发地',
      dataIndex: 'consigner_province',
      render(o, record) {
        return (<TrimSpan text={renderConsignLoc(record, 'consigner')} maxLen={8} />);
      },
    }, {
      title: '目的地',
      dataIndex: 'consignee_province',
      render(o, record) {
        return (<TrimSpan text={renderConsignLoc(record, 'consignee')} maxLen={8} />);
      },
    }, {
      title: '实际提货时间',
      dataIndex: 'pickup_act_date',
      render(o) {
        return moment(o).format('YYYY.MM.DD');
      },
    }, {
      title: '实际交货时间',
      dataIndex: 'deliver_act_date',
      render(o) {
        return moment(o).format('YYYY.MM.DD');
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
      render: (o, record) => {
        return (<Checkbox defaultChecked={o === 1} onChange={e => this.handleChangeStatus(record.id, e.target.checked)} />);
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
