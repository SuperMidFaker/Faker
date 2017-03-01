import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Checkbox, Col, Collapse, Modal, Form, Input, InputNumber, Radio, Row, Select } from 'antd';
import { closeAddTriggerModal } from 'common/reducers/scofFlow';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Panel = Collapse.Panel;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

@injectIntl
@connect(state => ({
  visible: state.scofFlow.addTriggerModal.visible,
  tenantId: state.account.tenantId,
}),
  { closeAddTriggerModal }
)
@Form.create()
export default class AddTriggerModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    closeAddTriggerModal: PropTypes.func.isRequired,
  }

  handleOk = () => {
    this.props.form.resetFields();
    this.props.closeAddTriggerModal();
  }
  handleCancel = () => {
    this.props.form.resetFields();
    this.props.closeAddTriggerModal();
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    const notifyOptions = [
      { label: 'Email', value: 'email' },
      { label: 'WeChat', value: 'wechat' },
      { label: 'SMS', value: 'sms' },
    ];
    const notifyAction = (
      <Row gutter={16}>
        <Col sm={24} lg={4}>
          <FormItem label={this.msg('actionType')}>
            {
              getFieldDecorator('action_type', {
              })(
                <Select defaultValue="notify">
                  <Option value="notify">{this.msg('notify')}</Option>
                  <Option value="create">{this.msg('create')}</Option>
                </Select>
              )
            }
          </FormItem>
        </Col>
        <Col sm={24} lg={6}>
          <FormItem label={this.msg('receiver')}>
            {
              getFieldDecorator('receiver', {
              })(
                <Select />
              )
            }
          </FormItem>
        </Col>
        <Col sm={24} lg={6}>
          <FormItem label={this.msg('content')}>
            {
              getFieldDecorator('content', {
              })(
                <Select />
              )
            }
          </FormItem>
        </Col>
        <Col sm={24} lg={8}>
          <FormItem label={this.msg('notifyMode')}>
            {
              getFieldDecorator('notify_mode', {
              })(
                <CheckboxGroup options={notifyOptions} defaultValue={['email', 'wechat']} />
              )
            }
          </FormItem>
        </Col>
      </Row>
    );
    const createAction = (
      <Row gutter={16}>
        <Col sm={24} lg={4}>
          <FormItem label={this.msg('actionType')}>
            {
              getFieldDecorator('action_type', {
              })(
                <Select defaultValue="create">
                  <Option value="notify">{this.msg('notify')}</Option>
                  <Option value="create">{this.msg('create')}</Option>
                </Select>
              )
            }
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('bizObject')}>
            {
              getFieldDecorator('bizObject', {
              })(
                <Select />
              )
            }
          </FormItem>
        </Col>
      </Row>
    );
    return (
      <Modal
        title={this.msg('addTrigger')}
        width={800}
        visible={visible}
        maskClosable={false}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        wrapClassName="modal-docker"
      >
        <Form vertical>
          <Collapse bordered={false} defaultActiveKey={['properties', 'actions']}>
            <Panel header={this.msg('properties')} key="properties">
              <Row gutter={16}>
                <Col sm={24} lg={8}>
                  <FormItem label={this.msg('triggerName')}>
                    {
                    getFieldDecorator('trigger_name', {
                    })(
                      <Input />
                    )
                  }
                  </FormItem>
                </Col>
                <Col sm={24} lg={8}>
                  <FormItem label={this.msg('executionMode')}>
                    {
                    getFieldDecorator('exe_mode', {
                    })(
                      <RadioGroup>
                        <RadioButton value="instant"><i className="icon icon-fontello-flash-1" /> {this.msg('instant')}</RadioButton>
                        <RadioButton value="scheduled"><i className="icon icon-fontello-back-in-time" /> {this.msg('scheduled')}</RadioButton>
                      </RadioGroup>
                    )
                  }
                  </FormItem>
                </Col>
                <Col sm={24} lg={8}>
                  <FormItem label={this.msg('timer')}>
                    {
                    getFieldDecorator('timer', {
                    })(
                      <div>
                        {this.msg('after')}
                        <InputNumber min={1} max={3600} defaultValue={30} style={{ width: '30%' }} />
                        {this.msg('minutes')}
                      </div>
                    )
                  }
                  </FormItem>
                </Col>
              </Row>
            </Panel>
            <Panel header={this.msg('actions')} key="actions">
              {notifyAction}
              {createAction}
            </Panel>
          </Collapse>
        </Form>
      </Modal>
    );
  }
}
