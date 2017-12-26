import React from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Form, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import FormPane from 'client/components/FormPane';
import messages from '../message.i18n';
import MergeSplitForm from '../../form/mergeSplitRuleForm';

const formatMsg = format(messages);

const FormItem = Form.Item;

@injectIntl
export default class MergeSplitRulesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    formData: PropTypes.shape({ merge_checked: PropTypes.bool }).isRequired,
  }
  state = {
    mergeSplit: this.props.formData.set_merge_split === 1,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOnChange = (checked) => {
    this.setState({ mergeSplit: checked });
  }
  render() {
    const { mergeSplit } = this.state;
    const { form, form: { getFieldDecorator }, formData } = this.props;
    return (
      <FormPane fullscreen={this.props.fullscreen}>
        <FormItem>{getFieldDecorator('set_merge_split')(<Switch checked={mergeSplit} onChange={this.handleOnChange} checkedChildren="启用" unCheckedChildren="关闭" />)}
        </FormItem>
        <Col sm={24} lg={12}>
          <Card bodyStyle={{ padding: 0 }} hoverable={false}>
            <MergeSplitForm form={form} formData={formData} />
          </Card>
        </Col>
        <Col sm={24} lg={12}>
          <Card bodyStyle={{ padding: 0 }} hoverable={false} />
        </Col>
      </FormPane>
    );
  }
}
