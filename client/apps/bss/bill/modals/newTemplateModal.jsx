import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Input, message, Select } from 'antd';
import { toggleNewTemplateModal, createTemplate } from 'common/reducers/bssBill';
import { formatMsg } from '../message.i18n';


const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 },
};

@injectIntl
@connect(
  state => ({
    visible: state.bssBill.visibleNewTemplateModal,
    partners: state.partner.partners,
  }),
  { toggleNewTemplateModal, createTemplate }
)
@Form.create()
export default class NewTemplateModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleNewTemplateModal(false);
  }
  handleOk = () => {
    const data = this.props.form.getFieldsValue();
    const settle = {
      settle_tenant_id: null,
      settle_partner_id: null,
      settle_name: null,
    };
    if (data.partnerId) {
      const partner = this.props.partners.filter(pt => pt.id === Number(data.partnerId))[0];
      settle.settle_tenant_id = partner.partner_tenant_id;
      settle.settle_partner_id = partner.id;
      settle.settle_name = partner.name;
    }
    this.props.createTemplate({
      ...settle, name: data.name,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.props.toggleNewTemplateModal(false);
        // open templateFee modal
      }
    });
  }

  render() {
    const { visible, partners, form: { getFieldDecorator } } = this.props;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('newBillTemplate')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form>
          <FormItem label="模板名称" {...formItemLayout} >
            {getFieldDecorator('name', {
              rules: [{ required: true }],
            })(<Input />)}
          </FormItem>
          <FormItem label="结算对象" {...formItemLayout} >
            {getFieldDecorator('partnerId', {
            })(<Select showSearch optionFilterProp="children">
              {partners.map(data => (
                <Option key={String(data.id)} value={String(data.id)}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
                </Option>))
              }
            </Select>)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
