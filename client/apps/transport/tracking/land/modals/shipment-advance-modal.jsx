import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Input, Modal, Table, Select, message } from 'antd';
import { loadShipmtDispatch } from 'common/reducers/trackingLandStatus';
import { showAdvanceModal, createAdvances } from 'common/reducers/transportBilling';
import { getTariffByTransportInfo } from 'common/reducers/transportTariff';
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
    transportModeId: state.transportBilling.advanceModal.transportModeId,
    goodsType: state.transportBilling.advanceModal.goodsType,
    fees: state.transportTariff.fees,
    advances: state.transportBilling.advanceModal.advances,
  }),
  { showAdvanceModal, createAdvances, getTariffByTransportInfo, loadShipmtDispatch }
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
    transportModeId: PropTypes.number.isRequired,
    goodsType: PropTypes.number.isRequired,
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
      const { transportModeId, goodsType, dispId } = nextProps;
      this.props.loadShipmtDispatch(dispId).then((result) => {
        this.props.getTariffByTransportInfo({
          transModeCode: transportModeId, partnerId: result.data.sr_partner_id, goodsType,
          tenantId: result.data.sr_tenant_id,
        });
      });
    }
    const { shipmtNo, dispId, loginId, tenantId, loginName } = nextProps;
    if (nextProps.visible) {
      const advances = nextProps.advances;
      if (nextProps.advances.length === 0) {
        for (let i = 0; i < nextProps.fees.length; i++) {
          const fee = nextProps.fees[i];
          if (fee.enabled) {
            const advance = {
              id: null,
              shipmt_no: shipmtNo,
              disp_id: dispId,
              name: fee.fee_name,
              code: fee.fee_code,
              charge_mode: fee.charge_mode,
              free_num: fee.free_num,
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
        message.error(result.error.message);
      } else {
        message.info('添加成功');
      }
    });
  }
  handleCancel = () => {
    this.props.showAdvanceModal({ visible: false, shipmtNo: '', dispId: -1, transportModeId: -1, goodsType: -1 });
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
    const { shipmtNo } = this.props;
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
    return (
      <Modal title={`${shipmtNo}垫付费用`} onCancel={this.handleCancel} onOk={this.handleOk}
        width={600} visible={this.props.visible} maskClosable={false}
      >
        <Table columns={columns} dataSource={this.state.advances} pagination={false} />
      </Modal>
    );
  }
}
