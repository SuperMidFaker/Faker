import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Modal, Form, Input, Select, message } from 'antd';
import { loadCurrencies, closeAdvanceFeeModal,
  loadDelgAdvanceFee, computeDelgAdvanceFees } from 'common/reducers/cmsExpense';
import { CMS_DUTY_TAXTYPE } from 'common/constants';
import { formatMsg } from '../message.i18n';

const { Option } = Select;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cmsExpense.advanceFeeModal.visible,
    delgNo: state.cmsExpense.advanceFeeModal.delg_no,
    fees: state.cmsExpense.advanceFeeModal.fees,
    currencies: state.cmsExpense.currencies,
    advanceParties: state.cmsExpense.advanceParties,
    advDirection: state.cmsExpense.advanceFeeModal.direction,
  }),
  {
    loadCurrencies, closeAdvanceFeeModal, loadDelgAdvanceFee, computeDelgAdvanceFees,
  }
)
export default class DelgAdvanceExpenseModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    delgNo: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    fees: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string,
      name: PropTypes.string,
    })),
    currencies: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })),
    advanceParties: PropTypes.arrayOf(PropTypes.shape({
      dispId: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      recv_services: PropTypes.string,
    })),
    advDirection: PropTypes.oneOf(['send', 'recv']),
    loadCurrencies: PropTypes.func.isRequired,
    closeAdvanceFeeModal: PropTypes.func.isRequired,
    loadDelgAdvanceFee: PropTypes.func.isRequired,
    computeDelgAdvanceFees: PropTypes.func.isRequired,
  }
  state = {
    editFees: {},
  }
  componentDidMount() {
    if (this.props.currencies.length === 0) {
      this.props.loadCurrencies();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.advanceParties !== this.props.advanceParties) {
      const dispIds = nextProps.advanceParties.reduce((dispatchIds, ap) =>
        dispatchIds.concat(ap.dispId), []);
      this.props.loadDelgAdvanceFee(dispIds);
    }
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('feeName'),
    width: 120,
    dataIndex: 'name',
  }, {
    title: this.msg('feeVal'),
    width: 100,
    dataIndex: 'cal_fee',
    render: (o, row) => {
      const formProps = {
        style: { marginBottom: 0 },
      };
      let oval = o;
      if (this.state.editFees[row.code]) {
        oval = this.state.editFees[row.code].cal_fee;
        if (isNaN(oval)) {
          formProps.validateStatus = 'warning';
        }
      }
      return (
        <FormItem {...formProps}>
          <Input value={oval} onChange={ev => this.handleFeeValChange(row, ev.target.value)} />
        </FormItem>
      );
    },
  }, {
    title: this.msg('currency'),
    width: 60,
    render: () => 'RMB',
  }, {
    title: this.msg('advanceTaxType'),
    dataIndex: 'duty_type',
    width: 120,
    render: (o, row) => {
      const formProps = {
        style: { marginBottom: 0 },
      };
      let oval = o;
      if (this.state.editFees[row.code]) {
        oval = this.state.editFees[row.code].duty_type;
        if (isNaN(oval)) {
          formProps.validateStatus = 'warning';
        }
      }
      return (
        <FormItem {...formProps}>
          <Select onSelect={value => this.handleDutySelect(row, value)} value={oval} style={{ width: '100%' }}>
            {
              CMS_DUTY_TAXTYPE.map(cdt => <Option key={cdt.value} value={cdt.value}>{cdt.text}</Option>)
            }
          </Select>
        </FormItem>
      );
    },
  }, {
    title: this.msg('taxValue'),
    width: 80,
    dataIndex: 'tax_fee',
    render: (o, row) => {
      const oval = Number(o);
      if (isNaN(oval)) {
        return '';
      } else if (this.state.editFees[row.code]) {
        return <span className="mdc-text-grey">{o.toFixed(2)}</span>;
      }
      return o.toFixed(2);
    },
  }, {
    title: this.msg('totalValue'),
    width: 80,
    dataIndex: 'total_fee',
    render: (o, row) => {
      const oval = Number(o);
      if (isNaN(oval)) {
        return '';
      } else if (this.state.editFees[row.code]) {
        return <span className="mdc-text-grey">{o.toFixed(2)}</span>;
      }
      return o.toFixed(2);
    },
  }]
  handleFeeValChange = (row, value) => {
    const feeVal = value ? parseFloat(value) : 0;
    if (isNaN(feeVal)) {
      return;
    }
    const editFees = { ...this.state.editFees };
    if (!editFees[row.code]) {
      editFees[row.code] = {
        fee_code: row.code,
        duty_type: row.duty_type,
        remark: row.remark,
        disp_id: row.disp_id,
        cal_fee: value,
      };
    } else {
      editFees[row.code] = {
        ...editFees[row.code],
        cal_fee: value,
      };
    }
    this.setState({ editFees });
  }
  handleDutySelect = (row, value) => {
    const editFees = { ...this.state.editFees };
    const dutyText = CMS_DUTY_TAXTYPE.filter(cdt => cdt.value === value)[0].text;
    if (!editFees[row.code]) {
      editFees[row.code] = {
        fee_code: row.code,
        duty_type: value,
        remark: dutyText,
        disp_id: row.disp_id,
        cal_fee: row.cal_fee,
      };
    } else {
      editFees[row.code] = {
        ...editFees[row.code],
        duty_type: value,
        remark: dutyText,
      };
    }
    this.setState({ editFees });
  }
  handleCancel = () => {
    this.props.closeAdvanceFeeModal();
    this.setState({ editFees: {} });
  }
  handleOk = () => {
    const changedFees = [];
    Object.keys(this.state.editFees).forEach((code) => {
      const fee = {
        delg_no: this.props.delgNo,
        ...this.state.editFees[code],
      };
      changedFees.push(fee);
    });
    this.props.computeDelgAdvanceFees(changedFees).then((result) => {
      if (!result.error) {
        this.props.closeAdvanceFeeModal();
        this.setState({ editFees: {} });
      } else {
        message.error(result.error.message, 10);
      }
    });
  }
  render() {
    const {
      advanceParties, advDirection, visible, delgNo, fees,
    } = this.props;
    return (
      <Modal
        maskClosable={false}
        title={`${delgNo} ${advDirection === 'send' ? this.msg('cushCost') : this.msg('cushBill')}`}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        visible={visible}
      >
        {
          advanceParties.map((ap) => {
            const feeData = fees.filter(fee => ap.dispId === fee.disp_id);
            let titleLabel;
            if (advDirection === 'send') {
              if (ap.recv_services === 'customs') {
                titleLabel = '报关供应商';
              } else if (ap.recv_services === 'ciq') {
                titleLabel = '报检供应商';
              } else {
                titleLabel = '报关报检供应商';
              }
            } else if (advDirection === 'recv') {
              titleLabel = '客户';
            }
            return titleLabel ? (
              <Table
                columns={this.columns}
                dataSource={feeData}
                pagination={false}
                title={() => `${titleLabel}: ${ap.name}`}
                bordered
                rowKey="code"
                style={{ marginBottom: 10 }}
              />) : null;
          })
        }
      </Modal>
    );
  }
}
