import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, message, Select } from 'antd';
import { toggleAddToDraftModal, addOrdersToDraftBill } from 'common/reducers/bssBill';
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
    dratBills: state.bssBill.dratBills,
    sofOrderNos: state.bssBill.sofOrderNos,
    visible: state.bssBill.visibleAddToDraftModal,
    listFilter: state.bssBill.listFilter,
  }),
  { toggleAddToDraftModal, addOrdersToDraftBill }
)
@Form.create()
export default class AddToDraft extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleAddToDraftModal(false);
  }
  handleOk = () => {
    const { listFilter, sofOrderNos } = this.props;
    const data = this.props.form.getFieldsValue();
    this.props.addOrdersToDraftBill({
      sofOrderNos,
      billNo: data.bill_no,
      billType: listFilter.bill_type,
      partnerId: listFilter.clientPid,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.props.toggleAddToDraftModal(false);
      }
    });
  }

  render() {
    const { visible, dratBills, form: { getFieldDecorator } } = this.props;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('addToDraft')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form>
          <FormItem label="加入账单" {...formItemLayout} >
            {getFieldDecorator('bill_no', {
            })(<Select showSearch optionFilterProp="children">
              {dratBills.map(data => (
                <Option key={String(data.bill_no)} value={String(data.bill_no)}>{data.bill_title}
                </Option>))
              }
            </Select>)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
