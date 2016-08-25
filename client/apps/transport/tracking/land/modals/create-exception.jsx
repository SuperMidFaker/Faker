import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Cascader, Input, Modal } from 'antd';
import { addException, loadExceptions } from 'common/reducers/trackingLandException';
import '../../../index.less';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    loginName: state.account.username,
    exceptions: state.trackingLandException.exceptions,
  }),
  { addException, loadExceptions }
)
@Form.create()
export default class CreateException extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    addException: PropTypes.func.isRequired,
    loadExceptions: PropTypes.func.isRequired,
    exceptions: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
  }
  handleOk = () => {
    const { form, dispId, loginName } = this.props;
    const fieldsValue = form.getFieldsValue();
    this.props.addException({
      dispId, excpLevel: '',
      type: fieldsValue.type[0],
      excpEvent: fieldsValue.excp_event,
      submitter: loginName,
    }).then(result => {
      if (result.error) {
        message.error(result.error);
      } else {
        this.props.loadExceptions({
          dispId: this.props.dispId,
          pageSize: this.props.exceptions.pageSize,
          currentPage: this.props.exceptions.current,
        });
      }
    });
  }
  handleCancel = () => {
    this.props.toggle();
  }
  render() {
    const { form: { getFieldProps } } = this.props;
    const options = [{
      value: 1,
      label: '浙江',
      children: [{
        value: 3,
        label: '杭州',
      }],
    }, {
      value: 2,
      label: '江苏',
      children: [{
        value: 4,
        label: '南京',
      }],
    }];
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
            })} />
          </FormItem>
        </Form>
      </Modal>

    );
  }
}
