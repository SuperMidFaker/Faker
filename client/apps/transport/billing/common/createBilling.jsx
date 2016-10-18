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
import BeforeFeesModal from './beforeFeesModal';
import ExceptionListPopover from '../../tracking/land/modals/exception-list-popover';
import PreviewPanel from '../../shipment/modals/preview-panel';
import { loadShipmtDetail } from 'common/reducers/shipment';

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
  { loadFeesByChooseModal, createBilling, updateBillingFees, loadShipmtDetail }
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
    const { beginDate, endDate, chooseModel, partnerId, partnerTenantId } = this.context.location.query;
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
  toggleBeforeFeesModal = () => {
    this.setState({ beforeFeesModalVisible: !this.state.beforeFeesModalVisible });
  }
  handleSave = () => {
    const { loginId, tenantId, loginName, type } = this.props;
    const { freightCharge,
    advanceCharge, excpCharge, adjustCharge, totalCharge } = this.props.billing;
    const { beginDate, endDate, chooseModel, partnerTenantId, name } = this.context.location.query;
    const fees = this.props.billingFees.data;
    if (fees.length === 0) {
      message.error('没有运单');
    } else {
      const shipmtCount = fees.filter(item => item.status === 1).length;
      const fee = fees[0];
      this.props.createBilling({
        tenantId, loginId, loginName, name, chooseModel, beginDate: moment(beginDate).format('YYYY-MM-DD 00:00:00'),
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
    const { type } = this.props;
    const { beginDate, endDate, chooseModel, partnerName } = this.context.location.query;
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
      render: (o, record) => {
        return (<a onClick={() => this.props.loadShipmtDetail(record.shipmt_no, this.props.tenantId, 'sr', 'charge', record)}>{record.shipmt_no}</a>);
      },
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
      title: '运输模式',
      dataIndex: 'transport_mode',
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
              <span style={handleLableStyle}>{partnerSourceType}: <strong>{partnerName}</strong></span>
              <span style={handleLableStyle}>{this.msg('range')}: <strong>{moment(beginDate).format('YYYY-MM-DD')} ~ {moment(endDate).format('YYYY-MM-DD')}</strong></span>
              <span style={handleLableStyle}>{this.msg('chooseModel')}: <strong>{this.msg(chooseModel)}</strong></span>
              <Button type="default" className="pull-right" onClick={this.toggleBeforeFeesModal}>未入账运单</Button>
            </div>
            <div className="panel-body table-panel">
              <Table dataSource={dataSource} columns={columns} rowKey="id" footer={this.handleTableFooter} />
            </div>
            <BeforeFeesModal type={type} visible={this.state.beforeFeesModalVisible} toggle={this.toggleBeforeFeesModal} />
          </div>
        </div>
        <PreviewPanel stage="billing" />
      </div>
    );
  }
}
