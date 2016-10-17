import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Input, Modal, Radio } from 'antd';
import { createSpecialCharge, loadExceptions } from 'common/reducers/trackingLandException';
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
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
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    parentDispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    createSpecialCharge: PropTypes.func.isRequired,
    loadExceptions: PropTypes.func.isRequired,
    exceptions: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
  }
  handleOk = () => {
    const { form, dispId, parentDispId, shipmtNo, loginName, loginId, tenantId } = this.props;
    const fieldsValue = form.getFieldsValue();
    if (fieldsValue && fieldsValue.charge) {
      this.props.form.setFieldsValue({ charge: '', remark: '', chargeType: '1' });
      this.handleCancel();
      const type = 12012;
      const excpLevel = 'ERROR';
      const chargeType = Number(fieldsValue.chargeType);
      this.props.createSpecialCharge({
        shipmtNo,
        dispId: chargeType === 1 ? parentDispId : dispId,
        chargeType,
        excpLevel,
        type,
        remark: fieldsValue.remark,
        submitter: loginName,
        charge: Number(fieldsValue.charge),
        loginId,
        tenantId,
      }).then((result) => {
        if (result.error) {
          message.error(result.error);
        } else {
          message.info('添加成功');
          this.props.loadExceptions({
            shipmtNo,
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
          <FormItem label="类型" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            <RadioGroup {...getFieldProps('chargeType', {
              initialValue: '1',
            })}
            >
              <RadioButton value="1">应收</RadioButton>
              <RadioButton value="-1">应付</RadioButton>
            </RadioGroup>
          </FormItem>
          <FormItem label="金额" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            <Input type="number" placeholder="请输入金额" addonAfter="元" {...getFieldProps('charge', {
              initialValue: '',
            })}
            />
          </FormItem>
          <FormItem label="备注" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            <Input type="textarea" id="control-textarea" rows="5" placeholder="请输入备注信息" {...getFieldProps('remark', {
              initialValue: '',
            })}
            />
          </FormItem>
        </Form>
      </Modal>

    );
  }
}
