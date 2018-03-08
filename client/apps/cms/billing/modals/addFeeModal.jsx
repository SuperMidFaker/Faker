import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Input, Modal, message, Form, Select, Mention, TreeSelect, Radio } from 'antd';
import { toggleAddFeeModal, addFee } from 'common/reducers/cmsQuote';
import { FEE_TYPE, FEE_GROUP, BILLING_METHOD, FORMULA_PARAMS } from 'common/constants';
import { formatMsg } from '../message.i18n';

const { Option } = Select;
const FormItem = Form.Item;
const { Nav } = Mention;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl
@connect(
  state => ({
    visible: state.cmsQuote.visibleAddFeeModal,
    quoteData: state.cmsQuote.quoteData,
  }),
  { toggleAddFeeModal, addFee }
)
@Form.create()
export default class AddFeeModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    suggestions: [],
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleAddFeeModal(false);
  }
  handleOk = () => {
    const feeCode = this.props.form.getFieldValue('fee_code');
    const repeat = this.props.quoteData.fees.filter(fe => fe.fee_code === feeCode)[0];
    if (repeat) {
      message.error('费用代码已存在', 6);
    } else {
      const formula = Mention.toString(this.props.form.getFieldValue('formula_factor'));
      const data = {
        ...this.props.form.getFieldsValue(),
        formula_factor: formula,
        quote_no: this.props.quoteData.quote_no,
      };
      this.props.addFee(data).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.toggleAddFeeModal(false);
          this.props.reload();
        }
      });
    }
  }
  handleMentionSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filtered = FORMULA_PARAMS.filter(item =>
      item.value.toLowerCase().indexOf(searchValue) !== -1);
    const suggestions = filtered.map(suggestion =>
      (<Nav value={suggestion.value} data={suggestion}>
        <span>{suggestion.text} - {suggestion.value} </span>
      </Nav>));
    this.setState({ suggestions });
  }
  render() {
    const { form: { getFieldDecorator, getFieldValue }, visible } = this.props;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('newQuote')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <div>
          <FormItem label={this.msg('feeCode')} {...formItemLayout}>
            {getFieldDecorator('fee_code', {
              rules: [{ required: true, message: '费用代码' }],
            })(<Input />)}
          </FormItem>
          <FormItem label={this.msg('feeName')} {...formItemLayout}>
            {getFieldDecorator('fee_name', {
              rules: [{ required: true, message: '费用名称' }],
            })(<Input />)}
          </FormItem>
          <FormItem label={this.msg('feeGroup')} {...formItemLayout}>
            {getFieldDecorator('fee_group', {
              rules: [{ required: true, message: '费用类型必选' }],
            })(<Select style={{ width: '100%' }}>
              {FEE_GROUP.map(type =>
                <Option key={type.value} value={type.value}>{`${type.value}|${type.text}`}</Option>)}
            </Select>)}
          </FormItem>
          <FormItem label={this.msg('feeType')} {...formItemLayout}>
            {getFieldDecorator('fee_type', {
              rules: [{ required: true, message: '费用类型必选' }],
            })(<Select style={{ width: '100%' }}>
              {FEE_TYPE.map(type =>
                <Option key={type.value} value={type.value}>{`${type.value}|${type.text}`}</Option>)}
            </Select>)}
          </FormItem>
          <FormItem label={this.msg('billingWay')} {...formItemLayout}>
            {getFieldDecorator('billing_way', {
            })(<TreeSelect
              style={{ width: '100%' }}
              dropdownStyle={{ overflow: 'auto' }}
              treeData={BILLING_METHOD}
              treeDefaultExpandAll
            />)}
          </FormItem>
          <FormItem label={this.msg('formulaFactor')} {...formItemLayout}>
            {getFieldDecorator('formula_factor', {
            })(<Mention
              suggestions={this.state.suggestions}
              prefix="$"
              onSearchChange={this.handleMentionSearch}
              placeholder="单价/$公式"
              multiLines
              style={{ width: '100%', height: '100%' }}
            />)}
          </FormItem>
          <FormItem label={this.msg('invoiceEn')} {...formItemLayout}>
            {getFieldDecorator('tax_included', {
              rules: [{ required: true }],
            })(<RadioGroup onChange={this.handleTypeSelect}>
              <RadioButton value>计税</RadioButton>
              <RadioButton value={false}>不计税</RadioButton>
            </RadioGroup>)}
          </FormItem>
          {getFieldValue('tax_included') &&
            <FormItem label={this.msg('taxRate')} {...formItemLayout}>
              {getFieldDecorator('tax_rate', {
              })(<Input />)}
            </FormItem>
          }
        </div>
      </Modal>
    );
  }
}

