import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Input, Modal, Table, Select, message } from 'antd';
import { loadShipmtDispatch } from 'common/reducers/trackingLandStatus';
import { showAdvanceModal, createAdvances, getTariffByTransportInfo } from 'common/reducers/transportBilling';
import { TMS_DUTY_TAXTYPE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const Option = Select.Option;
@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    visible: state.transportBilling.advanceModal.visible,
    dispId: state.transportBilling.advanceModal.dispId,
    shipmtNo: state.transportBilling.advanceModal.shipmtNo,
    transModeCode: state.transportBilling.advanceModal.transModeCode,
    goodsType: state.transportBilling.advanceModal.goodsType,
    type: state.transportBilling.advanceModal.type,
    fees: state.transportBilling.advanceModal.fees,
    advances: state.transportBilling.advanceModal.advances,
  }),
  {
    showAdvanceModal, createAdvances, getTariffByTransportInfo, loadShipmtDispatch,
  }
)

export default class ShipmentAdvanceModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    showAdvanceModal: PropTypes.func.isRequired,
    createAdvances: PropTypes.func.isRequired,
    transModeCode: PropTypes.string.isRequired,
    goodsType: PropTypes.number.isRequired,
    type: PropTypes.number.isRequired,
    fees: PropTypes.array.isRequired,
    getTariffByTransportInfo: PropTypes.func.isRequired,
    loadShipmtDispatch: PropTypes.func.isRequired,
    advances: PropTypes.array.isRequired,
  }
  state = {
    advances: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.shipmtNo && this.props.shipmtNo !== nextProps.shipmtNo) {
      const {
        transModeCode, goodsType, dispId, type, tenantId,
      } = nextProps;
      this.props.loadShipmtDispatch(dispId).then((result) => {
        if (type === 1) {
          this.props.getTariffByTransportInfo({
            transModeCode,
            partnerId: result.data.sr_partner_id,
            goodsType,
            partnerTenantId: result.data.sr_tenant_id,
            tenantId,
            pickupEstDate: result.data.pickup_est_date,
            deliverEstDate: result.data.deliver_est_date,
            pickupActDate: result.data.pickup_act_date,
            deliverActDate: result.data.deliver_act_date,
            createdDate: result.data.created_date,
          }).then((result1) => {
            if (result1.error) {
              message.error(result1.error.message);
            }
          });
        } else if (type === -1) {
          this.props.getTariffByTransportInfo({
            transModeCode,
            partnerId: result.data.sp_partner_id,
            goodsType,
            partnerTenantId: result.data.sp_tenant_id,
            tenantId,
            pickupEstDate: result.data.pickup_est_date,
            deliverEstDate: result.data.deliver_est_date,
            pickupActDate: result.data.pickup_act_date,
            deliverActDate: result.data.deliver_act_date,
            createdDate: result.data.created_date,
          }).then((result1) => {
            if (result1.error) {
              message.error(result1.error.message);
            }
          });
        }
      });
    }
    const {
      shipmtNo, dispId, loginId, tenantId, loginName,
    } = nextProps;
    if (nextProps.visible) {
      const advances = nextProps.advances;
      for (let i = 0; i < nextProps.fees.length; i++) {
        const fee = nextProps.fees[i];
        if (fee.enabled && fee.fee_style === 'advance') {
          if (!advances.find(item => item.code === fee.fee_code)) {
            const advance = {
              id: null,
              shipmt_no: shipmtNo,
              disp_id: dispId,
              name: fee.fee_name,
              code: fee.fee_code,
              charge_mode: fee.charge_mode,
              category: fee.category,
              amount: 0,
              unit_price: fee.unit_price,
              tax_rate: fee.tax_rate,
              currency: 'CNY',
              tax_fee: 0,
              invoice_en: fee.invoice_en ? 1 : 0,
              duty_type: null,
              remark: '',
              submitter: loginName,
              login_id: loginId,
              tenant_id: tenantId,
            };
            advances.push(advance);
          } else {
            for (let j = 0; j < advances.length; j++) {
              const advance = advances[j];
              if (advance.code === fee.fee_code) {
                advance.name = fee.fee_name;
                advance.charge_mode = fee.charge_mode;
                advance.unit_price = fee.unit_price;
                advance.invoice_en = fee.invoice_en ? 1 : 0;
                advance.tax_rate = fee.tax_rate;
                advance.category = fee.category;
              }
            }
          }
        }
      }
      this.setState({ advances });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOk = () => {
    const advances = [...this.state.advances];
    for (let i = 0; i < advances.length; i++) {
      advances[i].amount = Number(advances[i].amount);
    }
    this.handleCancel();
    this.props.createAdvances(advances).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('添加成功');
      }
    });
  }
  handleCancel = () => {
    this.props.showAdvanceModal({
      visible: false, shipmtNo: '', dispId: -1, transModeCode: '', goodsType: -1,
    });
  }
  handleAmountChange = (index, value) => {
    const advances = [...this.state.advances];
    advances[index].amount = value;
    this.setState({ advances });
  }
  handleDutySelect = (index, value) => {
    const advances = [...this.state.advances];
    advances[index].duty_type = value;
    this.setState({ advances });
  }
  render() {
    const { shipmtNo, type } = this.props;
    const columns = [{
      title: '费用名称',
      dataIndex: 'name',
    }, {
      title: '金额',
      dataIndex: 'amount',
      width: 100,
      render: (col, row, index) => (
        <Input type="number" value={col} onChange={ev => this.handleAmountChange(index, ev.target.value)} />
      ),
    }, {
      title: '币制',
      dataIndex: 'currency',
    }, {
      title: '开票抬头',
      dataIndex: 'duty_type',
      width: 120,
      render: (col, row, index) => {
        const dutyType = TMS_DUTY_TAXTYPE.find(item => item.value === col);
        return (
          <Select style={{ width: '100%' }} onSelect={value => this.handleDutySelect(index, value)} value={dutyType ? dutyType.value : null}>
            {
              TMS_DUTY_TAXTYPE.map(cdt => <Option key={cdt.value} value={cdt.value}>{cdt.text}</Option>)
            }
          </Select>
        );
      },
    }, {
      title: '税金',
      dataIndex: 'tax_fee',
    }, {
      title: '总和',
      render: (col, row) => Number(Number(row.amount) + row.tax_fee).toFixed(2),
    }];
    let title = '';
    if (type === 1) title = `${shipmtNo}代垫收入`;
    else if (type === -1) title = `${shipmtNo}代垫成本`;
    return (
      <Modal maskClosable={false} title={title} onCancel={this.handleCancel} onOk={this.handleOk}
        width={600} visible={this.props.visible}
      >
        <Table columns={columns} dataSource={this.state.advances} pagination={false} />
      </Modal>
    );
  }
}
