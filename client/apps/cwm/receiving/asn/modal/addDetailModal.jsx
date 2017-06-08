import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Input, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hideDetailModal, addDetial } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.cwmReceive.detailModal.visible,
    temporaryDetails: state.cwmReceive.temporaryDetails,
    productsNos: state.cwmReceive.productsNos,
  }),
  { hideDetailModal, addDetial }
)
@Form.create()
export default class AddDetailModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCancel = () => {
    this.props.hideDetailModal();
  }
  handleSearch = () => {

  }
  submit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.addDetial(values);
        this.handleCancel();
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, visible, productsNos } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal onCancel={this.handleCancel} visible={visible} title="添加明细" onOk={this.submit}>
        <Form>
          <FormItem label="商品货号" {...formItemLayout}>
            {getFieldDecorator('hscode', {
              rules: [{ required: true, message: 'Please input product_no!' }],
            })(
              <Select combobox optionFilterProp="search" onChange={this.handleSearch} style={{ width: '100%' }}>
                {
                  productsNos.map(data => (<Option value={data.hscode} key={data.hscode}
                    search={data.hscode}
                  >{data.hscode}</Option>)
                  )}
              </Select>
            )}
          </FormItem>
          <FormItem label="中文品名" {...formItemLayout}>
            {getFieldDecorator('product_name', {
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="订单数量" {...formItemLayout}>
            {getFieldDecorator('qty', {
              rules: [{ required: true, message: 'Please input order_number!' }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="主单位" {...formItemLayout}>
            {getFieldDecorator('first_unit', {
            })(
              <Input disabled />
            )}
          </FormItem>
          <FormItem label="单价" {...formItemLayout}>
            {getFieldDecorator('unit_price', {
              rules: [{ required: true, message: 'Please input price!' }],
            })(
              <Input />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
