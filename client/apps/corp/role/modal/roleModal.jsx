import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form, Input, message, Modal } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { toggleRoleModal, submit } from 'common/reducers/role';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.role.roleModal.visible,
  }),
  { toggleRoleModal, submit }
)
@Form.create()
export default class RoleModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl);
  handleCancel = () => {
    this.props.toggleRoleModal(false);
  }
  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.submit({
          ...values,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.handleCancel();
            this.context.router.push(`/corp/role/edit/${result.data.id}`);
          }
        });
      }
    });
  }
  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal title="新建角色" visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
        <FormItem {...formItemLayout} label={this.msg('name')}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: this.msg('nameRequired') }],
          })(<Input />)}
        </FormItem>
      </Modal>
    );
  }
}
