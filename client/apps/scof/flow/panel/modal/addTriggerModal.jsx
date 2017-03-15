import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Checkbox, Col, Collapse, Modal, Form, Input, InputNumber, Radio, Row, Select } from 'antd';
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
  visible: state.scofFlow.visibleTriggerModal,
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
          <FormItem>
            {
              getFieldDecorator('action_type', {
                'option.initialValue': 'notify',
              })(
                <Select placeholder={this.msg('actionType')}>
                  <Option value="notify">{this.msg('notify')}</Option>
                  <Option value="create">{this.msg('create')}</Option>
                </Select>
              )
            }
          </FormItem>
        </Col>
        <Col sm={24} lg={6}>
          <FormItem>
            {
              getFieldDecorator('receiver', {
              })(
                <Select placeholder={this.msg('receiver')} />
              )
            }
          </FormItem>
        </Col>
        <Col sm={24} lg={6}>
          <FormItem >
            {
              getFieldDecorator('content', {
              })(
                <Select placeholder={this.msg('content')} />
              )
            }
          </FormItem>
        </Col>
        <Col sm={24} lg={8}>
          <FormItem>
            {
              getFieldDecorator('notify_mode', {
                initialValue: ['email', 'wechat'],
              })(
                <CheckboxGroup options={notifyOptions} />
              )
            }
          </FormItem>
        </Col>
      </Row>
    );
    const createAction = (
      <Row gutter={16}>
        <Col sm={24} lg={4}>
          <FormItem>
            {
              getFieldDecorator('action_type', {
                initialValue: 'create',
              })(
                <Select placeholder={this.msg('actionType')}>
                  <Option value="notify">{this.msg('notify')}</Option>
                  <Option value="create">{this.msg('create')}</Option>
                </Select>
              )
            }
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem>
            {
              getFieldDecorator('bizObject', {
              })(
                <Select placeholder={this.msg('bizObject')} />
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
        <Form layout="vertical">
          <Collapse bordered={false} defaultActiveKey={['properties', 'actions']}>
            <Panel header={this.msg('properties')} key="properties">
              <Row gutter={16}>
                <Col sm={24} lg={8}>
                  <FormItem>
                    {
                    getFieldDecorator('trigger_name', {
                    })(
                      <Input placeholder={this.msg('triggerName')} />
                    )
                  }
                  </FormItem>
                </Col>
                <Col sm={24} lg={8}>
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
                {this.state.triggerMode === 'scheduled' && <Col sm={24} lg={8}>
                  <FormItem>
                    {
                    getFieldDecorator('timer', {
                    })(
                      <div>
                        {this.msg('after')}
                        <InputNumber min={1} max={3600} style={{ width: '30%' }} />
                        {this.msg('minutes')}
                      </div>
                    )
                  }
                  </FormItem>
                </Col>}
              </Row>
            </Panel>
            <Panel header={this.msg('actions')} key="actions">
              {notifyAction}
              {createAction}
              <Row>
                <Button type="dashed" style={{ width: '100%' }}>{this.msg('addAction')}</Button>
              </Row>
            </Panel>
          </Collapse>
        </Form>
      </Modal>
    );
  }
}
