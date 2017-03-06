import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Col, Modal, Form, Input, Radio, Row } from 'antd';
import { closeCreateFlowModal } from 'common/reducers/scofFlow';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


@injectIntl
@connect(state => ({
  visible: state.scofFlow.createFlowModal.visible,
  tenantId: state.account.tenantId,
}),
  { closeCreateFlowModal }
)
@Form.create()
export default class CreateFlowModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    closeCreateFlowModal: PropTypes.func.isRequired,
  }
  state = {
    triggerMode: '',
  }

  handleModeChange = (e) => {
    this.setState(
      { triggerMode: e.target.value }
    );
  }
  handleOk = () => {
    this.props.form.resetFields();
    this.props.closeCreateFlowModal();
  }
  handleCancel = () => {
    this.props.form.resetFields();
    this.props.closeCreateFlowModal();
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    return (
      <Modal
        title={this.msg('createFlow')}
        visible={visible}
        maskClosable={false}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form vertical>
          <Row gutter={16}>
            <Col sm={24} lg={24}>
              <FormItem label={this.msg('flowName')}>
                {
                    getFieldDecorator('flow_name', {
                    })(
                      <Input placeholder={this.msg('flowName')} />
                    )
                  }
              </FormItem>
            </Col>
            <Col sm={24} lg={24}>
              <FormItem>
                {
                    getFieldDecorator('trigger_mode', {
                    })(
                      <RadioGroup onChange={this.handleModeChange}>
                        <RadioButton value="instant"><i className="icon icon-fontello-flash-1" /> {this.msg('instant')}</RadioButton>
                        <RadioButton value="scheduled"><i className="icon icon-fontello-back-in-time" /> {this.msg('scheduled')}</RadioButton>
                      </RadioGroup>
                    )
                  }
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
