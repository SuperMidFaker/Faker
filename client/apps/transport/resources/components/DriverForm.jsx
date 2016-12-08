import React, { PropTypes, Component } from 'react';
import { Form, Input, Button } from 'antd';
import withPrivilege from 'client/common/decorators/withPrivilege';
import ContentWrapper from './ContentWrapper';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@withPrivilege({
  module: 'transport', feature: 'resources',
  action: props => props.mode === 'edit' ? 'edit' : 'create',
})
export default class DriverForm extends Component {
  componentDidMount() {
    const { mode, form } = this.props;
    if (mode === 'edit') {
      form.setFieldsValue(this.props.driver);
    }
  }
  render() {
    const { form, mode, onSubmitBtnClicked } = this.props;
    const getFieldDecorator = form.getFieldDecorator;

    return (
      <ContentWrapper>
        <Form horizontal onSubmit={onSubmitBtnClicked} className="form-edit-content offset-right-col">
          <FormItem {...formItemLayout} label="姓名" required>
            {getFieldDecorator('name')(<Input required />)}
          </FormItem>
          <FormItem {...formItemLayout} label="手机号码" required>
            {getFieldDecorator('phone')(<Input required />)}
          </FormItem>
          <FormItem {...formItemLayout} label="备注">
            {getFieldDecorator('remark')(<Input type="textarea" />)}
          </FormItem>
          <FormItem wrapperCol={{ span: 16, offset: 6 }} style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit">{mode === 'edit' ? '修改' : '新建'}</Button>
          </FormItem>
        </Form>
      </ContentWrapper>
    );
  }
}

DriverForm.propTypes = {
  mode: PropTypes.string.isRequired,              // mode='add'表示添加司机,mode='edit'表示编辑司机信息
  form: PropTypes.object.isRequired,              // DriverFormContainer中props.form对象
  onSubmitBtnClicked: PropTypes.func.isRequired,  // 点击submit按钮时候执行的回调函数
  driver: PropTypes.object,                       // 只有在mode='edit'下才需要
};
