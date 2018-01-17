import React from 'react';
import PropTypes from 'prop-types';
import { Button, InputNumber, Checkbox, Layout, Table, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { loadDispsByChooseModal, loadExpsByDisp, createBilling, updateBillingFees } from 'common/reducers/cmsBilling';
import TrimSpan from 'client/components/trimSpan';
import BeforeFeesModal from './beforeFeesModal';
import { formatMsg } from '../message.i18n';

const { Header, Content } = Layout;

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
    saving: state.cmsBilling.billingSaving,
  }),
  {
    loadDispsByChooseModal, loadExpsByDisp, createBilling, updateBillingFees,
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
    loadDispsByChooseModal: PropTypes.func.isRequired,
    createBilling: PropTypes.func.isRequired,
    dispIds: PropTypes.array.isRequired,
    updateBillingFees: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    beforeFeesModalVisible: false,
  }
  componentDidMount() {
    const { tenantId, type } = this.props;
    const {
      beginDate, endDate, chooseModel, partnerId, partnerTenantId,
    } = this.props.billing;
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
        message.error(result.error.message, 10);
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.dispIds !== this.props.dispIds) {
      this.props.loadExpsByDisp(nextProps.dispIds, this.props.tenantId);
    }
  }
  msg = formatMsg(this.props.intl)
  handleSave = () => {
    const {
      loginId, tenantId, loginName, type,
    } = this.props;
    const {
      beginDate, endDate, chooseModel, partnerTenantId, name,
      advanceCharge, servCharge, adjustCharge, totalCharge,
    } = this.props.billing;
    const fees = this.props.billingFees.data;
    if (fees.length === 0) {
      message.error('没有费用');
    } else {
      this.props.createBilling({
        tenantId,
        loginId,
        loginName,
        name,
        chooseModel,
        beginDate: moment(beginDate).format('YYYY-MM-DD 00:00:00'),
        endDate: moment(endDate).format('YYYY-MM-DD 23:59:59'),
        advanceCharge,
        servCharge,
        adjustCharge,
        totalCharge,
        toTenantId: partnerTenantId,
        fees,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
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
  handleChangeStatus = (Ids, status) => {
    const { tenantId } = this.props;
    let s = 0;
    if (status) s = 1;
    else s = 0;
    for (let i = 0; i < Ids.length; i++) {
      const Id = Ids[i];
      this.props.updateBillingFees(tenantId, Id, 'billing_status', s);
    }
  }
  toggleBeforeFeesModal = () => {
    this.setState({ beforeFeesModalVisible: !this.state.beforeFeesModalVisible });
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
    const { type, billing, saving } = this.props;
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
      title: this.msg('delgNo'),
      dataIndex: 'delg_no',
      width: 120,
    }, {
      title: this.msg('partner'),
      dataIndex: `${partnerSourceType}_name`,
      width: 160,
      render(o) {
        return <TrimSpan text={o} maxLen={10} />;
      },
    }, {
      title: this.msg('invoiceNo'),
      dataIndex: 'invoice_no',
      width: 120,
    }, {
      title: this.msg('servCharge'),
      dataIndex: 'serv_charge',
      width: 120,
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: this.msg('advanceCharge'),
      dataIndex: 'advance_charge',
      width: 120,
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: this.msg('adjustCharge'),
      dataIndex: 'adjust_charge',
      width: 120,
      render: (o, record) => (<InputNumber size="small" defaultValue={o} step={0.01} onChange={value => this.handleChangeAdjustCharges(record.disp_id[0], value)} />),
    }, {
      title: this.msg('finalCharge'),
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
      title: this.msg('billingStatus'),
      dataIndex: 'billing_status',
      width: 120,
      render: (o, record) => (<Checkbox defaultChecked={o === 1} onChange={e => this.handleChangeStatus(record.disp_id, e.target.checked)} />),
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
              <span style={handleLableStyle}>{this.msg('partner')}: <strong>{billing.partnerName}</strong></span>
              <span style={handleLableStyle}>{this.msg('range')}: <strong>{moment(billing.beginDate).format('YYYY-MM-DD')} ~ {moment(billing.endDate).format('YYYY-MM-DD')}</strong></span>
              <span style={handleLableStyle}>{this.msg('chooseModel')}: <strong>{this.msg(billing.chooseModel)}</strong></span>
              <Button type="default" className="pull-right" onClick={this.toggleBeforeFeesModal}>未入账运单</Button>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table dataSource={dataSource} columns={columns} rowKey="id" footer={this.handleTableFooter} />
            </div>
            <BeforeFeesModal type={type} visible={this.state.beforeFeesModalVisible} toggle={this.toggleBeforeFeesModal} />
          </div>
        </Content>
      </div>
    );
  }
}
