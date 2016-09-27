import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Button, Input, Table, Select, Switch, message } from 'antd';
import { TAX_MODE, FEE_STYLE } from 'common/constants';
import { submitSurcharges, createQuotes } from 'common/reducers/transportTariff';
import ContentWrapper from '../../resources/components/ContentWrapper';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { feeUpdate, feeAdd, feeDelete } from 'common/reducers/cmsQuote';
// import containerMessages from 'client/apps/message.i18n';
// import globalMessages from 'client/common/root.i18n';

const formatMsg = format(messages);
// const formatContainerMsg = format(containerMessages);
// const formatGlobalMsg = format(globalMessages);

const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    surcharge: state.transportTariff.surcharge,
    tariffId: state.transportTariff.tariffId,
    quotes: state.transportTariff.quotes,
    formParams: state.transportTariff.formParams,
    agreement: state.transportTariff.agreement,
  }),
  { submitSurcharges, feeUpdate, feeAdd, feeDelete, createQuotes }
)

export default class SurchargeForm extends React.Component {
  static propTypes = {
    surcharge: PropTypes.object.isRequired,
    submitSurcharges: PropTypes.func.isRequired,
    tariffId: PropTypes.string.isRequired,
    quotes: PropTypes.object.isRequired,
    feeUpdate: PropTypes.func.isRequired,
    feeAdd: PropTypes.func.isRequired,
    feeDelete: PropTypes.func.isRequired,
    formParams: PropTypes.object.isRequired,
    agreement: PropTypes.object.isRequired,
    createQuotes: PropTypes.func.isRequired,
  }
  state = {
    coops: [],
    editIndex: -1,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleSaveSurcharge = () => {
    const surcharge = {
      ...this.props.surcharge,
    };
    const prom = this.props.submitSurcharges(this.props.tariffId, surcharge);
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.setState({
          editIndex: -1,
        });
        message.info('保存成功', 5);
      }
    });
  }
  handleAddFees = () => {
    const addFee = {
      fee_name: '',
      fee_code: '',
      fee_style: 'cushion',
      charge_mode: '0',
      lot_num: 1,
      free_num: 0,
      unit_price: 0,
      invoice_en: true,
      tax_rate: 0,
      enabled: true,
      category: 'custom',
    };
    this.setState({
      editIndex: this.props.quotes.fees.length + 4,
    });
    this.props.quotes.fees.push(addFee);
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
    const row = this.props.quotes.fees[index - 4];
    if (this.props.quotes._id) {
      if (row._id) {
        this.props.feeUpdate(
          this.props.quotes._id,
          row,
        ).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          }
        });
      } else {
        this.props.feeAdd(
          this.props.quotes._id,
          row,
        ).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          }
        });
      }
    } else {
      const tms = this.props.formParams.transModes.find(tm => tm.id === Number(this.props.agreement.transModeCode));
      const transMode = tms.mode_code;
      this.props.createQuotes(this.props.tariffId, transMode, row).then((result) => {
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
    this.props.feeDelete(
      this.props.quotes._id,
      row._id,
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.quotes.fees.splice(index - 4, 1);
        this.forceUpdate();
      }
    });
  }

  handleChange = (index, col, value) => {
    if (index >= 4) {
      this.props.quotes.fees[index - 4][col] = value;
    } else {
      let key = 'mode';
      let item = 'pickup';
      if (col === 'charge_mode') {
        key = 'mode';
      } else if (col === 'unit_price') {
        key = 'value';
      }
      if (index === 0) {
        item = 'pickup';
      } else if (index === 1) {
        item = 'delivery';
      } else if (index === 2) {
        item = 'load';
      } else if (index === 3) {
        item = 'unload';
      }
      this.props.surcharge[item][key] = value;
    }
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
  handleChargeModeChange = (index, value) => {
    this.handleChange(index, 'charge_mode', value);
  }
  handleLotNumChange = (index, value) => {
    this.handleChange(index, 'lot_num', value);
  }
  handleFreeNumChange = (index, value) => {
    this.handleChange(index, 'free_num', value);
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

  render() {
    const { surcharge, quotes } = this.props;
    const { editIndex } = this.state;
    const dataSource = [{
      fee_name: '提货费',
      fee_code: '',
      fee_style: 'service',
      charge_mode: surcharge.pickup.mode,
      lot_num: 0,
      free_num: 0,
      unit_price: surcharge.pickup.value,
      invoice_en: false,
      tax_rate: 0,
      enabled: true,
      category: '',
    }, {
      fee_name: '配送费',
      fee_code: '',
      fee_style: 'service',
      charge_mode: surcharge.delivery.mode,
      lot_num: 0,
      free_num: 0,
      unit_price: surcharge.delivery.value,
      invoice_en: false,
      tax_rate: 0,
      enabled: true,
      category: '',
    }, {
      fee_name: '装货费',
      fee_code: '',
      fee_style: 'service',
      charge_mode: surcharge.load.mode,
      lot_num: 0,
      free_num: 0,
      unit_price: surcharge.load.value,
      invoice_en: false,
      tax_rate: 0,
      enabled: true,
      category: '',
    }, {
      fee_name: '卸货费',
      fee_code: '',
      fee_style: 'service',
      charge_mode: surcharge.unload.mode,
      lot_num: 0,
      free_num: 0,
      unit_price: surcharge.unload.value,
      invoice_en: false,
      tax_rate: 0,
      enabled: true,
      category: '',
    }].concat(quotes.fees);
    const columns = [
      {
        title: this.msg('serialNo'),
        width: 60,
        render: (o, record, index) => {
          return index + 1;
        },
      }, {
        title: this.msg('feeName'),
        dataIndex: 'fee_name',
        render: (o, record, index) => {
          if (index >= 4 && index === editIndex) {
            return (<Input defaultValue={o} placeholder="自定义费用名称" onChange={e => this.handleFeeNameChange(index, e.target.value)} />);
          } else {
            return o;
          }
        },
      }, {
        title: this.msg('feeCode'),
        dataIndex: 'fee_code',
        width: 80,
        render: (o, record, index) => {
          if (index >= 4 && index === editIndex) {
            return (<Input defaultValue={o} placeholder="自定义费用代码" onChange={e => this.handleFeeCodeChange(index, e.target.value)} />);
          } else {
            return o;
          }
        },
      }, {
        title: this.msg('feeStyle'),
        dataIndex: 'fee_style',
        width: 80,
        render: (o, record, index) => {
          if (index >= 4 && index === editIndex) {
            return (
              <Select defaultValue={o} style={{ width: '100%' }} onChange={e => this.handleFeeStyleChange(index, e)} >
                {
                  FEE_STYLE.map((opt, idx) => <Option value={opt.value} key={`${opt.value}${idx}`}>{opt.text}</Option>)
                }
              </Select>
            );
          } else {
            const style = FEE_STYLE.find(item => item.value === o);
            return style ? style.text : '';
          }
        },
      }, {
        title: this.msg('chargeMode'),
        dataIndex: 'charge_mode',
        render: (o, record, index) => {
          if (index === editIndex) {
            return (
              <Select defaultValue={Number(o)} style={{ width: '100%' }} onChange={e => this.handleChargeModeChange(index, e)} >
                <Option value={TAX_MODE.eachwaybill.key}>{TAX_MODE.eachwaybill.value}</Option>
                <Option value={TAX_MODE.chargeunit.key}>{TAX_MODE.chargeunit.value}</Option>
              </Select>
            );
          } else {
            return Number(o) === TAX_MODE.eachwaybill.key ? TAX_MODE.eachwaybill.value : TAX_MODE.chargeunit.value;
          }
        },
      }, {
        title: this.msg('lotNum'),
        dataIndex: 'lot_num',
        width: 150,
        render: (o, record, index) => {
          if (index >= 4) {
            if (index === editIndex) {
              return (<Input defaultValue={o} placeholder="自定义费用代码" onChange={e => this.handleLotNumChange(index, e.target.value)} />);
            } else {
              return o;
            }
          } else {
            return '';
          }
        },
      }, {
        title: this.msg('freeNum'),
        dataIndex: 'free_num',
        width: 150,
        render: (o, record, index) => {
          if (index >= 4) {
            if (index === editIndex) {
              return (<Input defaultValue={o} placeholder="自定义费用代码" onChange={e => this.handleFreeNumChange(index, e.target.value)} />);
            } else {
              return o;
            }
          } else {
            return '';
          }
        },
      }, {
        title: this.msg('unitPrice'),
        dataIndex: 'unit_price',
        width: 80,
        render: (o, record, index) => {
          if (index === editIndex) {
            return (<Input defaultValue={o} placeholder="自定义计费单价" onChange={e => this.handleUnitPriceChange(index, e.target.value)} />);
          }
          return o;
        },
      }, {
        title: this.msg('invoiceEn'),
        dataIndex: 'invoice_en',
        width: 80,
        render: (o, record, index) => {
          if (index >= 4) {
            return (<Switch size="small" defaultChecked={o} onChange={e => this.handleInvoiceEnChange(index, e)} />);
          } else {
            return '';
          }
        },
      }, {
        title: this.msg('taxRate'),
        dataIndex: 'tax_rate',
        width: 150,
        render: (o, record, index) => {
          if (index >= 4) {
            if (index === editIndex) {
              return (<Input defaultValue={o} placeholder="自定义费用代码" addonAfter="%" onChange={e => this.handleTaxRateChange(index, e.target.value)} />);
            } else {
              return o;
            }
          } else {
            return '';
          }
        },
      }, {
        title: this.msg('enabledOp'),
        dataIndex: 'enabled',
        width: 80,
        render: (o, record, index) => {
          if (index >= 4) {
            return (<Switch size="small" defaultChecked={o} onChange={e => this.handleEnabledChange(index, e)} />);
          } else {
            return '';
          }
        },
      }, {
        title: this.msg('operation'),
        width: 80,
        render: (o, record, index) => {
          if (index >= 4) {
            if (index === editIndex) {
              return (
                <div>
                  <a onClick={() => this.handleSave(index)} >保存</a>
                </div>
              );
            } else {
              if (record.category === 'custom') {
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
          } else {
            if (index === editIndex) {
              return (
                <div>
                  <a onClick={() => this.handleSaveSurcharge(index)}>保存</a>
                </div>
              );
            }
            return (
              <div>
                <a onClick={() => this.handleModify(record, index)}>修改</a>
              </div>
            );
          }
        },
      },
    ];
    return (
      <ContentWrapper>
        <div className="panel-body" style={{ padding: '0 16px' }}>
          <Table columns={columns} bordered dataSource={dataSource} rowKey="_id" pagination={false} size="middle"
            footer={() => <Button type="primary" onClick={this.handleAddFees}>{this.msg('addCosts')}</Button>}
          />
        </div>
      </ContentWrapper>
    );
  }
}

// const columns = [{
//       title: '序号',
//       dataIndex: 'no',
//       render(o, index) {
//         return index+1;
//       },
//     }, {
//       title: '费用类别',
//       dataIndex: 'category',
//     }, {
//       title: '费用名称',
//       dataIndex: 'fee_name',

//     }, {
//       title: '费用代码',
//       dataIndex: 'fee_code',

//     }, {
//       title: '费用类型',
//       dataIndex: 'fee_style',
//     }, {
//       title: '计费方式',
//       dataIndex: 'charge_mode',
//     }, {
//       title: '批次量',
//       dataIndex: 'lot_num',
//     }, {
//       title: '免计量',
//       dataIndex: 'free_num',
//     }, {
//       title: '计费单价',
//       dataIndex: 'unit_price',
//     }, {
//       title: '是否开票',
//       dataIndex: 'invoice_en',
//     }, {
//       title: '开票税率',
//       dataIndex: 'tax_rate',
//     }, {
//       title: '是否启用',
//       dataIndex: 'enabled',
//     }, {
//       title: '操作',
//     }];

//     const formItemLayout = {
//       labelCol: { span: 4 },
//       wrapperCol: { span: 24 - 4 },
//     };

