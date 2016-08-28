import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Input, Modal } from 'antd';
import { createSpecialCharge, loadExceptions } from 'common/reducers/trackingLandException';
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    loginName: state.account.username,
    exceptions: state.trackingLandException.exceptions,
  }),
  { createSpecialCharge, loadExceptions }
)
@Form.create()
export default class CreateSpecialCharge extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    createSpecialCharge: PropTypes.func.isRequired,
    loadExceptions: PropTypes.func.isRequired,
    exceptions: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
  }
  handleOk = () => {
    const { form, dispId, loginName } = this.props;
    const fieldsValue = form.getFieldsValue();
    if (fieldsValue && fieldsValue.charge) {
      const type = 12012;
      const excpLevel = 'ERROR';
      this.props.createSpecialCharge({
        dispId,
        excpLevel,
        type,
        excpEvent: fieldsValue.excp_event,
        submitter: loginName,
        charge: Number(fieldsValue.charge),
      }).then(result => {
        if (result.error) {
          message.error(result.error);
        } else {
          this.handleCancel();
          this.props.loadExceptions({
            dispId,
            pageSize: this.props.exceptions.pageSize,
            currentPage: this.props.exceptions.current,
          });
        }
      });
    } else {
      message.error('请填写特殊费用金额');
    }
  }
  handleCancel = () => {
    this.props.toggle();
  }
  render() {
    const { form: { getFieldProps } } = this.props;

    const colSpan = 6;
    return (
      <Modal title="添加特殊费用" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible} maskClosable={false}
      >
        <Form className="row" style={{ width: '400px' }}>
          <FormItem label="特殊费用" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            <Input type="number" placeholder="请输入金额" addonAfter="元" {...getFieldProps('charge', {
              initialValue: '',
            })} />
          </FormItem>
          <FormItem label="异常描述" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            <Input type="textarea" id="control-textarea" rows="5" placeholder="请输入对异常的描述" {...getFieldProps('excp_event', {
              initialValue: '',
            })} />
          </FormItem>
        </Form>
      </Modal>

    );
  }
}
