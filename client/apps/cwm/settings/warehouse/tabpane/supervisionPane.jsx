import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Layout, Form, Select } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { showWhseMembers, loadwhseOwners } from 'common/reducers/cwmWarehouse';

const formatMsg = format(messages);
const { Content } = Layout;
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    whseOwners: state.cwmWarehouse.whseOwners,
  }),
  { showWhseMembers, loadwhseOwners }
)
export default class SupervisionPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    whseTenantId: PropTypes.number.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key);
  render() {
    return (
      <Content style={{ padding: 24 }}>
        <Form layout="inline">
          <FormItem label="保税监管系统">
            <Select placeholder="请选择保税监管系统" allowClear style={{ width: 300 }}>
              <Option value="shftz">上海自贸区监管系统(东方支付)</Option>
              <Option value="szftz">苏州综保区监管系统(海讯通)</Option>
            </Select>
          </FormItem>
          <FormItem >
            <Button type="primary" size="large">保存</Button>
          </FormItem>
        </Form>
      </Content>
    );
  }
}
