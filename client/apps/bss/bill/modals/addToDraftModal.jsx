import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, message, Select } from 'antd';
import { toggleAddToDraftModal, appendDraftStatements, loadDraftBillByPartner } from 'common/reducers/bssBill';
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
    sofOrderNos: state.bssBill.draftModal.sofOrderNos,
    visible: state.bssBill.draftModal.visibleAddToDraftModal,
    partnerId: state.bssBill.draftModal.partnerId,
    listFilter: state.bssBill.listFilter,
  }),
  { toggleAddToDraftModal, appendDraftStatements, loadDraftBillByPartner }
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
  state = {
    draftBills: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.props.loadDraftBillByPartner({
        partnerId: nextProps.partnerId,
        billType: nextProps.listFilter.bill_type,
      }).then((result) => {
        if (!result.error) {
          this.setState({ draftBills: result.data });
        }
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.setState({ draftBills: [] });
    this.props.toggleAddToDraftModal(false);
  }
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { sofOrderNos } = this.props;
        const data = this.props.form.getFieldsValue();
        this.props.appendDraftStatements({
          sofOrderNos,
          billNo: data.bill_no,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 5);
          } else {
            this.props.toggleAddToDraftModal(false);
          }
        });
      }
    });
  }

  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    const { draftBills } = this.state;
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
              rules: [{ required: true }],
            })(<Select showSearch optionFilterProp="children">
              {draftBills.map(data => (
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
