import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Col, Form, Input, Button, message, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { passAudit, returnAudit } from 'common/reducers/trackingLandPod';
import { format } from 'client/common/i18n/helpers';
import messages from '../../../message.i18n';

const formatMsg = format(messages);
const { TextArea } = Input;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    auditor: state.account.username,
    parentDispId: state.shipment.previewer.dispatch.parent_id,
    dispId: state.shipment.previewer.dispatch.id,
    podId: state.shipment.previewer.dispatch.pod_id,
  }),
  { passAudit, returnAudit })
@Form.create()
export default class AuditPodForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    parentDispId: PropTypes.number,
    dispId: PropTypes.number.isRequired,
    podId: PropTypes.number.isRequired,
  }
  state = {
    done: false,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleAcceptPOD = () => {
    const { dispId, parentDispId, podId, auditor, tenantId, loginId } = this.props;
    this.props.passAudit(podId, dispId, parentDispId, auditor, tenantId, loginId).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ done: true });
        }
      });
  }
  handleRejectPOD = () => {
    const { dispId } = this.props;
    this.props.returnAudit(dispId).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ done: true });
        }
      });
  }
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="备注">
              {getFieldDecorator('remark', {
                rules: [{
                  type: 'string',
                  message: '备注',
                }],
              })(<TextArea placeholder="请填写备注" autosize />)}
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" icon="check-circle-o" onClick={this.handleAcceptPOD} disabled={this.state.done}>接受</Button>
        <Button type="danger" icon="close-circle-o" onClick={this.handleRejectPOD} style={{ marginLeft: 8 }} disabled={this.state.done}>拒绝</Button>
      </Form>
    );
  }
}
