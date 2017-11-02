import React from 'react';
import { connect } from 'react-redux';
import { message, Button, Form, Row, Input, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { freezeTransit } from 'common/reducers/cwmTransition';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@injectIntl
@connect(
  state => ({
    loginName: state.account.username,
    detail: state.cwmTransition.transitionModal.detail,
  }),
  { freezeTransit }
)
export default class FreezePane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    reason: '',
  }
  handleReasonChange = (ev) => {
    this.setState({ reason: ev.target.value });
  }
  handleFreezeTransit = () => {
    const { loginName, detail } = this.props;
    this.props.freezeTransit([detail.trace_id], this.state, loginName).then((result) => {
      if (!result.error) {
        message.success('库存冻结成功');
      } else {
        message.error(result.error.message);
      }
    });
  }
  render() {
    const { reason } = this.state;
    return (
      <div>
        <Row>
          <Col span={24}>
            <FormItem {...formItemLayout} label="冻结原因">
              <Input value={reason} onChange={this.handleReasonChange} />
            </FormItem>
          </Col>
        </Row>
        <Button type="primary" onClick={this.handleFreezeTransit}>冻结</Button>
      </div>
    );
  }
}
