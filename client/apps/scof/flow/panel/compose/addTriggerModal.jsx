import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Col, Modal, Form, /* Checkbox, Input, */InputNumber, Radio, Row, Select } from 'antd';
import { closeAddTriggerModal } from 'common/reducers/scofFlow';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
// const CheckboxGroup = Checkbox.Group;

@injectIntl
@connect(state => ({
  visible: state.scofFlow.visibleTriggerModal,
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
    actions: [],
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
  msg = formatMsg(this.props.intl)
  notifyOptions = [
    { label: 'Email', value: 'email' },
    { label: 'WeChat', value: 'wechat' },
    { label: 'SMS', value: 'sms' },
  ]
  /*
  notifyAction = (
    <Row gutter={16}>
      <Col sm={24} lg={4}>
        <FormItem>
          {
            getFieldDecorator('type', {
              initialValue: 'notify',
            })(
              <Select placeholder={this.msg('actionType')}>
                <Option value="CREATE">{this.msg('actionCreate')}</Option>
                <Option value="NOTIFY">{this.msg('actionNotify')}</Option>
              </Select>
            )
          }
        </FormItem>
      </Col>
      <Col sm={24} lg={8}>
        <FormItem>
          {
          getFieldDecorator('mode', {
            initialValue: 'instant',
          })(
            <RadioGroup>
              <RadioButton value="instant"><i className="icon icon-fontello-flash-1" />{this.msg('instant')}</RadioButton>
              <RadioButton value="scheduled"><i className="icon icon-fontello-back-in-time" /> {this.msg('scheduled')}</RadioButton>
            </RadioGroup>
          )
        }
        </FormItem>
      </Col>
      <Col sm={24} lg={8}>
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
      </Col>
      <Col sm={24} lg={8}>
        <FormItem>
          {
            getFieldDecorator('mode', {
              initialValue: ['email', 'wechat'],
            })(
              <CheckboxGroup options={this.notifyOptions} />
            )
          }
        </FormItem>
      </Col>
      <Col sm={24} lg={6}>
        <FormItem>
          {
            getFieldDecorator('receiver', {
            })(
              <Input placeholder={this.msg('receiverPlaceholder')} />
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
    </Row>
  ) */
  render() {
    const { visible } = this.props;
    const { actions } = this.state;
    const createAction = (
      <Row gutter={16}>
        <Col sm={24} lg={4}>
          <FormItem>
            <Select placeholder={this.msg('actionType')}>
              <Option value="NOTIFY">{this.msg('actionNotify')}</Option>
              <Option value="CREATE">{this.msg('actionCreate')}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col sm={24} lg={4}>
          <FormItem>
            <RadioGroup>
              <RadioButton value="instant"><i className="icon icon-fontello-flash-1" /></RadioButton>
              <RadioButton value="scheduled"><i className="icon icon-fontello-back-in-time" /></RadioButton>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col sm={24} lg={4}>
          <FormItem>
            <InputNumber min={1} max={3600} style={{ width: '60%' }} />
            {this.msg('minutes')}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem>
            <Select placeholder={this.msg('bizObject')} />
          </FormItem>
        </Col>
      </Row>
    );
    return (
      <Modal title={this.msg('triggerActions')}
        width={800} visible={visible} maskClosable={false}
        onOk={this.handleOk} onCancel={this.handleCancel}
        wrapClassName="modal-docker"
      >
        <Form layout="vertical">
          {actions.map((action) => {
            switch (action.type) {
              case 'CREATE': return createAction;
              case 'NOTIFY': return null;
              default: return createAction;
            }
          })}
        </Form>
        <Button type="dashed" style={{ width: '100%' }} icon="plus" />
      </Modal>
    );
  }
}
