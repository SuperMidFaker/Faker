import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const FormItem = Form.Item;
const formatMsg = format(messages);

@injectIntl
@connect(
  () => ({

  }),
)

export default class Profile extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customer: PropTypes.object.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key)
  render() {
    const { customer } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <div>
        <FormItem
          {...formItemLayout}
          label="企业名称"
          required
        >
          {customer.name}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="企业编码"
          required
        >
          {customer.code}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="联系人"
        >
          {customer.contact}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="电话"
        >
          {customer.phone}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="邮箱"
        >
          {customer.email}
        </FormItem>
      </div>
    );
  }
}
