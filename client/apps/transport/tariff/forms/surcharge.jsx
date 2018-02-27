import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Button, Input, Table, Select, Switch, message } from 'antd';
import { TAX_MODE, FEE_TYPE, FEE_CATEGORY } from 'common/constants';
import { addFee, deleteFee, updateFee } from 'common/reducers/transportTariff';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    tariffId: state.transportTariff.tariffId,
    fees: state.transportTariff.fees,
    agreement: state.transportTariff.agreement,
  }),
  { updateFee, deleteFee, addFee }
)

export default class SurchargeForm extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(['create', 'edit', 'view']),
    tariffId: PropTypes.string.isRequired,
    updateFee: PropTypes.func.isRequired,
    deleteFee: PropTypes.func.isRequired,
    addFee: PropTypes.func.isRequired,
  }
  state = {
    editIndex: -1,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleAddFees = () => {
    const fee = {
      fee_name: '',
      fee_code: '',
      fee_style: 'advance',
      charge_mode: '0',
      unit_price: 0,
      invoice_en: true,
      tax_rate: 0,
      enabled: true,
      category: 'transport_expenses',
    };
    this.setState({
      editIndex: this.props.fees.length,
    });
    this.props.fees.push(fee);
    this.forceUpdate();
  }
  handleModify = (row, index) => {
    this.setState({
      editIndex: index,
    });
  }
  handleSave = (index) => {
    this.setState({
      editIndex: -1,
    });
    const row = this.props.fees[index];
    if (row._id) {
      this.props.updateFee(this.props.tariffId, row._id, row).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
      });
    } else {
      this.props.addFee(
        this.props.tariffId,
        this.props.agreement.transModeCode,
        row
      ).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
      });
    }
  }
  handleDelete = (row, index) => {
    this.setState({
      editIndex: -1,
    });
    this.props.deleteFee(
      this.props.tariffId,
      row._id,
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.fees.splice(index, 1);
        this.forceUpdate();
      }
    });
  }

  handleChange = (index, col, value) => {
    this.props.fees[index][col] = value;
    this.forceUpdate();
  }

  handleFeeNameChange = (index, value) => {
    this.handleChange(index, 'fee_name', value);
  }
  handleFeeCodeChange = (index, value) => {
    this.handleChange(index, 'fee_code', value);
  }
  handleFeeStyleChange = (index, value) => {
    this.handleChange(index, 'fee_style', value);
  }
  handleCategoryChange = (index, value) => {
    this.handleChange(index, 'category', value);
  }
  handleChargeModeChange = (index, value) => {
    this.handleChange(index, 'charge_mode', value);
  }
  handleUnitPriceChange = (index, value) => {
    this.handleChange(index, 'unit_price', value);
  }
  handleInvoiceEnChange = (index, value) => {
    this.handleChange(index, 'invoice_en', value);
  }
  handleTaxRateChange = (index, value) => {
    this.handleChange(index, 'tax_rate', value);
  }
  handleEnabledChange = (index, value) => {
    this.handleChange(index, 'enabled', value);
  }
  renderTableFooter = () => {
    const { type } = this.props;
    if (type === 'create' || type === 'edit') {
      return (<Button type="default" onClick={this.handleAddFees}>{this.msg('addCosts')}</Button>);
    }
    return '';
  }
  render() {
    const { fees, type } = this.props;
    const { editIndex } = this.state;
    const dataSource = fees;
    const columns = [
      {
        title: this.msg('serialNo'),
        width: 60,
        render: (o, record, index) => index + 1,
      }, {
        title: this.msg('feeName'),
        dataIndex: 'fee_name',
        render: (o, record, index) => {
          if (index === editIndex) {
            return (<Input value={o} placeholder="费用名称" onChange={e => this.handleFeeNameChange(index, e.target.value)} />);
          }
          return o;
        },
      }, {
        title: this.msg('feeCode'),
        dataIndex: 'fee_code',
        width: 110,
        render: (o, record, index) => {
          if (index === editIndex) {
            return (<Input value={o} placeholder="费用代码" onChange={e => this.handleFeeCodeChange(index, e.target.value)} />);
          }
          return o;
        },
      }, {
        title: this.msg('feeCategory'),
        dataIndex: 'category',
        width: 150,
        render: (o, record, index) => {
          if (index === editIndex) {
            return (
              <Select value={o} style={{ width: '100%' }} onChange={e => this.handleCategoryChange(index, e)} >
                {
                  FEE_CATEGORY.map(opt =>
                    <Option value={opt.value} key={opt.value}>{opt.text}</Option>)
                }
              </Select>
            );
          }
          const category = FEE_CATEGORY.find(item => item.value === o);
          return category ? category.text : '';
        },
      }, {
        title: this.msg('feeStyle'),
        dataIndex: 'fee_style',
        width: 80,
        render: (o, record, index) => {
          if (index === editIndex) {
            return (
              <Select value={o} style={{ width: '100%' }} onChange={e => this.handleFeeStyleChange(index, e)} >
                {
                  FEE_TYPE.map(opt => <Option value={opt.value} key={opt.value}>{opt.text}</Option>)
                }
              </Select>
            );
          }
          const style = FEE_TYPE.find(item => item.value === o);
          return style ? style.text : '';
        },
      }, {
        title: this.msg('chargeMode'),
        dataIndex: 'charge_mode',
        render: (o, record, index) => {
          if (record.fee_style !== 'advance') {
            if (index === editIndex) {
              return (
                <Select value={Number(o)} style={{ width: '100%' }} onChange={e => this.handleChargeModeChange(index, e)} >
                  <Option value={TAX_MODE.eachwaybill.key}>{TAX_MODE.eachwaybill.value}</Option>
                  <Option value={TAX_MODE.chargeunit.key}>{TAX_MODE.chargeunit.value}</Option>
                </Select>
              );
            }
            return Number(o) === TAX_MODE.eachwaybill.key ?
              TAX_MODE.eachwaybill.value : TAX_MODE.chargeunit.value;
          }
          return '';
        },
      }, {
        title: this.msg('unitPrice'),
        dataIndex: 'unit_price',
        width: 80,
        render: (o, record, index) => {
          if (index === editIndex) {
            return (<Input value={o} placeholder="计费单价" onChange={e => this.handleUnitPriceChange(index, e.target.value)} />);
          }
          return o;
        },
      }, {
        title: this.msg('invoiceEn'),
        dataIndex: 'invoice_en',
        width: 80,
        render: (o, record, index) => {
          if (index === editIndex) {
            return (<Switch size="small" checked={o} disabled={index !== editIndex} onChange={e => this.handleInvoiceEnChange(index, e)} />);
          }
          return o ? '是' : '否';
        },
      }, {
        title: this.msg('taxRate'),
        dataIndex: 'tax_rate',
        width: 150,
        render: (o, record, index) => {
          if (index === editIndex) {
            return (<Input value={o * 100} type="number" placeholder="税率" addonAfter="%" onChange={e => this.handleTaxRateChange(index, e.target.value / 100)} />);
          }
          return `${o * 100}%`;
        },
      }, {
        title: this.msg('enabledOp'),
        dataIndex: 'enabled',
        width: 80,
        render: (o, record, index) => {
          if (index === editIndex) {
            return (<Switch size="small" checked={o} disabled={index !== editIndex} onChange={e => this.handleEnabledChange(index, e)} />);
          }
          return o ? '是' : '否';
        },
      }, {
        title: this.msg('operation'),
        width: 80,
        render: (o, record, index) => {
          if (type === 'create' || type === 'edit') {
            if (index === editIndex) {
              return (
                <div>
                  <a onClick={() => this.handleSave(index)} >保存</a>
                </div>
              );
            }
            if (index >= 4) {
              return (
                <div>
                  <a onClick={() => this.handleModify(record, index)}>修改</a>
                  <span className="ant-divider" />
                  <a onClick={() => this.handleDelete(record, index)}>删除</a>
                </div>
              );
            }
            return (
              <div>
                <a onClick={() => this.handleModify(record, index)}>修改</a>
              </div>
            );
          }
          return null;
        },
      },
    ];
    return (
      <div className="panel-body table-panel table-fixed-layout">
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="_id"
          pagination={false}
          title={this.renderTableFooter}
        />
      </div>
    );
  }
}
