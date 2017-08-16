import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { message, Button, Card, Form, Row, Input, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { hideTransitionDock, freezeTransit } from 'common/reducers/cwmTransition';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    detail: state.cwmTransition.transitionDock.detail,
  }),
  { hideTransitionDock, freezeTransit }
)
export default class FreezePane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    reason: '',
  }
  handleReasonChange = (ev) => {
    this.setState({ reason: ev.target.value });
  }
  handleFreezeTransit = () => {
    const { loginName, tenantId, detail } = this.props;
    this.props.freezeTransit([detail.trace_id], this.state, loginName, tenantId).then((result) => {
      if (!result.error) {
        this.props.hideTransitionDock({ needReload: true });
      } else {
        message.error(result.error.message);
      }
    });
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const { reason } = this.state;
    return (
      <div className="pane-content tab-pane">
        <Form>
          <Card noHovering bodyStyle={{ paddingBottom: 0 }} >
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="冻结原因">
                  <Input value={reason} onChange={this.handleReasonChange} />
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Button type="primary" onClick={this.handleFreezeTransit}>冻结</Button>
        </Form>
      </div>
    );
  }
}
