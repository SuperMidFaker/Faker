import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Cascader, Input, Modal } from 'antd';
import { createException, loadExceptions } from 'common/reducers/trackingLandException';
import '../../../index.less';
import { TRANSPORT_EXCEPTIONS } from '../../../eventTypes';
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    loginName: state.account.username,
    exceptions: state.trackingLandException.exceptions,
  }),
  { createException, loadExceptions }
)
@Form.create()
export default class CreateException extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    createException: PropTypes.func.isRequired,
    loadExceptions: PropTypes.func.isRequired,
    exceptions: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
  }
  handleOk = () => {
    const { form, dispId, loginName } = this.props;
    const fieldsValue = form.getFieldsValue();
    if (fieldsValue && fieldsValue.type && fieldsValue.type[1]) {
      const type = fieldsValue.type[1];
      let excpLevel = '';
      for (let i = 0; i < TRANSPORT_EXCEPTIONS.length; i++) {
        if (TRANSPORT_EXCEPTIONS[i].code === type) {
          excpLevel = TRANSPORT_EXCEPTIONS[i].level;
          break;
        }
      }
      this.props.createException({
        dispId,
        excpLevel,
        type,
        excpEvent: fieldsValue.excp_event,
        submitter: loginName,
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
      message.error('请选择异常类型');
    }
  }
  handleCancel = () => {
    this.props.toggle();
  }
  render() {
    const { form: { getFieldProps } } = this.props;

    const options = [];
    for (let i = 0; i < TRANSPORT_EXCEPTIONS.length; i++) {
      if (TRANSPORT_EXCEPTIONS[i].key.indexOf('_SYS_') < 0 && TRANSPORT_EXCEPTIONS[i].key !== 'SHIPMENT_EXCEPTION_SPECIAL_COST') {
        if (options.length === 0) {
          options.push({
            value: TRANSPORT_EXCEPTIONS[i].code,
            label: TRANSPORT_EXCEPTIONS[i].category,
            children: [{
              value: TRANSPORT_EXCEPTIONS[i].code,
              label: TRANSPORT_EXCEPTIONS[i].name,
            }],
          });
        } else {
          let flag = false;
          for (let j = 0; j < options.length; j++) {
            if (options[j].label === TRANSPORT_EXCEPTIONS[i].category) {
              options[j].children.push({
                value: TRANSPORT_EXCEPTIONS[i].code,
                label: TRANSPORT_EXCEPTIONS[i].name,
              });
              flag = true;
              break;
            }
          }
          if (flag === false) {
            options.push({
              value: TRANSPORT_EXCEPTIONS[i].code,
              label: TRANSPORT_EXCEPTIONS[i].category,
              children: [{
                value: TRANSPORT_EXCEPTIONS[i].code,
                label: TRANSPORT_EXCEPTIONS[i].name,
              }],
            });
          }
        }
      }
    }
    const colSpan = 6;
    return (
      <Modal title="添加异常" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible} maskClosable={false}
      >
        <Form className="row" style={{ width: '400px' }}>
          <FormItem label="异常类型" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
            <Cascader options={options} placeholder="请选择异常类型" {...getFieldProps('type', {
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
