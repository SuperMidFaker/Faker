import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Button } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const Panel = Collapse.Panel;
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    aspect: state.account.aspect,
    delg: state.cmsDelcare.makingDelg,
  })
)
@Form.create()
export default class BillForm extends React.Component {
  static propTypes = {
    ietype: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    readonly: PropTypes.bool,
    form: PropTypes.object.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  BillHeader = (
    <div>
      清单表头
      <Button type="primary">保存</Button>
    </div>
  )
  render() {
    return (
      <Collapse accordion defaultActiveKey="bill-head">
        <Panel header={this.BillHeader} key="bill-head">
          <Form form={this.props.form}>
            <FormItem />
          </Form>
        </Panel>
        <Panel header={"清单表体"} key="bill-list">
        aaa
        </Panel>
      </Collapse>
    );
  }
}
