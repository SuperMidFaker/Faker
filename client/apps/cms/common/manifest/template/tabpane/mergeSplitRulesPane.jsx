import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Card, Col, Row, Form, Select, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import FormPane from 'client/components/FormPane';
import messages from '../message.i18n';
import MergeSplitForm from '../../form/mergeSplitRuleForm';

const formatMsg = format(messages);
const { Option } = Select;
const FormItem = Form.Item;

@injectIntl
export default class MergeSplitRulesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    formData: PropTypes.shape({ merge_checked: PropTypes.bool }).isRequired,
  }
  state = {
    mergeSplit: this.props.formData.set_merge_split === 1,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOnChange = (checked) => {
    this.setState({ mergeSplit: checked });
  }
  render() {
    const { mergeSplit } = this.state;
    const {
      form,
      form: { getFieldDecorator, getFieldValue },
      formData,
      invoiceTemplates,
      packingListTemplates,
      contractTemplates,
    } = this.props;
    return (
      <FormPane fullscreen={this.props.fullscreen}>
        <FormItem>{getFieldDecorator('set_merge_split')(<Switch checked={mergeSplit} onChange={this.handleOnChange} checkedChildren="启用" unCheckedChildren="关闭" />)}
        </FormItem>
        <Row gutter={16}>
          <Col sm={24} lg={14}>
            <Card bodyStyle={{ padding: 0 }} hoverable={false}>
              <MergeSplitForm form={form} formData={formData} />
            </Card>
          </Col>
          <Col sm={24} lg={10}>
            <Card bodyStyle={{ padding: 16 }} hoverable={false}>
              <FormItem>
                {getFieldDecorator('gen_invoice', { initialValue: !!formData.gen_invoice })(<Checkbox defaultChecked={formData.gen_invoice}>{this.msg('生成发票')}</Checkbox>)
                }
                {getFieldValue('gen_invoice') &&
                  <div>
                      {getFieldDecorator('invoice_template', {
                        rules: [{ type: 'array' }],
                        initialValue: formData.invoiceTemplate,
                      })(<Select placeholder={this.msg('选择发票模板')}>
                        {invoiceTemplates && invoiceTemplates.map(ct =>
                          <Option value={ct.id} key={ct.id}>{ct.name}</Option>)}
                      </Select>)}
                  </div>
                }
              </FormItem>
              <FormItem>
                {getFieldDecorator('gen_packing_list', { initialValue: !!formData.gen_packing_list })(<Checkbox defaultChecked={formData.gen_packing_list}>{this.msg('生成箱单')}</Checkbox>)
                }
                {getFieldValue('gen_packing_list') &&
                  <div>
                      {getFieldDecorator('packing_list_template', {
                        rules: [{ type: 'array' }],
                        initialValue: formData.packingListTemplate,
                      })(<Select placeholder={this.msg('选择箱单模板')}>
                        {packingListTemplates && packingListTemplates.map(ct =>
                          <Option value={ct.id} key={ct.id}>{ct.name}</Option>)}
                      </Select>)}
                  </div>
                }
              </FormItem>
              <FormItem>
                {getFieldDecorator('gen_contract', { initialValue: !!formData.gen_contract })(<Checkbox defaultChecked={formData.gen_contract}>{this.msg('生成合同')}</Checkbox>)
                }
                {getFieldValue('gen_contract') &&
                  <div>
                      {getFieldDecorator('contract_template', {
                        rules: [{ type: 'array' }],
                        initialValue: formData.contractTemplate,
                      })(<Select placeholder={this.msg('选择合同模板')}>
                        {contractTemplates && contractTemplates.map(ct =>
                          <Option value={ct.id} key={ct.id}>{ct.name}</Option>)}
                      </Select>)}
                  </div>
                }
              </FormItem>
            </Card>
          </Col>
        </Row>
      </FormPane>
    );
  }
}
