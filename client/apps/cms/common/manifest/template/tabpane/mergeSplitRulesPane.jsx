import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Card, Col, Row, Form, Select, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import FormPane from 'client/components/FormPane';
import { formatMsg } from '../../../message.i18n';
import MergeSplitForm from '../../form/mergeSplitRuleForm';
import { loadInvTemplates } from 'common/reducers/cmsInvoice';


const { Option } = Select;
const FormItem = Form.Item;

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  template: state.cmsManifest.template,
  invTemplates: state.cmsInvoice.invTemplates,
}), { loadInvTemplates })

export default class MergeSplitRulesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    formData: PropTypes.shape({ merge_checked: PropTypes.bool }).isRequired,
    invTemplates: PropTypes.array.isRequired,
  }
  state = {
    mergeSplit: this.props.formData.set_merge_split === 1,
    invoiceTemplates: [],
    packingListTemplates: [],
    contractTemplates: [],
  }
  msg = formatMsg(this.props.intl)
  handleOnChange = (checked) => {
    this.setState({ mergeSplit: checked });
  }
  componentDidMount() {
    this.props.loadInvTemplates({ tenantId: this.props.tenantId, docuType: [0, 1, 2], partnerId: this.props.template.customer_partner_id });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.invTemplates !== this.props.invTemplates) {
      const invoiceTemplates = nextProps.invTemplates.filter(tp => tp.docu_type === 0);
      const contractTemplates = nextProps.invTemplates.filter(tp => tp.docu_type === 1);
      const packingListTemplates = nextProps.invTemplates.filter(tp => tp.docu_type === 2);
      this.setState({ invoiceTemplates, contractTemplates, packingListTemplates });
    }
  }
  render() {
    const { mergeSplit,
      invoiceTemplates,
      packingListTemplates,
      contractTemplates } = this.state;
    const {
      form,
      form: { getFieldDecorator, getFieldValue },
      formData,
    } = this.props;
    return (
      <FormPane fullscreen={this.props.fullscreen}>
        <FormItem>{getFieldDecorator('set_merge_split')(<Switch checked={mergeSplit} onChange={this.handleOnChange} checkedChildren="启用" unCheckedChildren="关闭" />)}
        </FormItem>
        <Row gutter={16}>
          <Col sm={24} lg={14}>
            <Card bodyStyle={{ padding: 0 }} >
              <MergeSplitForm form={form} formData={formData} />
            </Card>
          </Col>
          <Col sm={24} lg={10}>
            <Card bodyStyle={{ padding: 16 }} >
              <FormItem>
                {getFieldDecorator('gen_invoice', { initialValue: !!formData.gen_invoice })(<Checkbox defaultChecked={formData.gen_invoice}>{this.msg('生成发票')}</Checkbox>)
                }
                {getFieldValue('gen_invoice') &&
                  <div>
                      {getFieldDecorator('invoice_template_id', {
                        initialValue: formData.invoice_template_id,
                      })(<Select placeholder={this.msg('选择发票模板')}>
                        {invoiceTemplates && invoiceTemplates.map(ct =>
                          <Option value={ct.id} key={ct.id}>{ct.template_name}</Option>)}
                      </Select>)}
                  </div>
                }
              </FormItem>
              <FormItem>
                {getFieldDecorator('gen_packing_list', { initialValue: !!formData.gen_packing_list })(<Checkbox defaultChecked={formData.gen_packing_list}>{this.msg('生成箱单')}</Checkbox>)
                }
                {getFieldValue('gen_packing_list') &&
                  <div>
                      {getFieldDecorator('packing_list_template_id', {
                        initialValue: formData.packing_list_template_id,
                      })(<Select placeholder={this.msg('选择箱单模板')}>
                        {packingListTemplates && packingListTemplates.map(ct =>
                          <Option value={ct.id} key={ct.id}>{ct.template_name}</Option>)}
                      </Select>)}
                  </div>
                }
              </FormItem>
              <FormItem>
                {getFieldDecorator('gen_contract', { initialValue: !!formData.gen_contract })(<Checkbox defaultChecked={formData.gen_contract}>{this.msg('生成合同')}</Checkbox>)
                }
                {getFieldValue('gen_contract') &&
                  <div>
                      {getFieldDecorator('contract_template_id', {
                        initialValue: formData.contract_template_id,
                      })(<Select placeholder={this.msg('选择合同模板')}>
                        {contractTemplates && contractTemplates.map(ct =>
                          <Option value={ct.id} key={ct.id}>{ct.template_name}</Option>)}
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
