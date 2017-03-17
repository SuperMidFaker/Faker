import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Col, Modal, Form, Checkbox, Input, InputNumber, Radio, Row, Select } from 'antd';
import { closeAddTriggerModal } from 'common/reducers/scofFlow';
import { uuidWithoutDash } from 'client/common/uuid';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

const notifyOptions = [
  { label: 'Email', value: 'email' },
  { label: 'WeChat', value: 'wechat' },
  { label: 'SMS', value: 'sms' },
];

function CreateActionForm(props) {
  const { action, index, bizObjectOptions, msg, onChange } = props;
  function handleChange(actionKey, value) {
    onChange(actionKey, value, index);
  }
  return (
    <Row gutter={16}>
      <Col sm={24} lg={4}>
        <FormItem>
          <Select value={action.type} onChange={value => handleChange('type', value)}>
            <Option value="CREATE">{msg('actionCreate')}</Option>
            <Option value="NOTIFY">{msg('actionNotify')}</Option>
          </Select>
        </FormItem>
      </Col>
      <Col sm={24} lg={4}>
        <FormItem>
          <RadioGroup value={action.instant ? 'instant' : 'scheduled'} onChange={ev => handleChange('instant', ev.target.value === 'instant')}>
            <RadioButton value="instant"><i className="icon icon-fontello-flash-1" /></RadioButton>
            <RadioButton value="scheduled"><i className="icon icon-fontello-back-in-time" /></RadioButton>
          </RadioGroup>
        </FormItem>
      </Col>
      {!action.instant &&
      <Col sm={24} lg={4}>
        <FormItem>
          <InputNumber value={action.delay} min={1} max={3600} style={{ width: '60%' }}
            onChange={value => handleChange('delay', value)}
          />
          {msg('minutes')}
        </FormItem>
      </Col>
      }
      <Col sm={24} lg={12}>
        <FormItem>
          <Select value={action.biz_object} onChange={value => handleChange('biz_object', value)}>
            {bizObjectOptions.map(bo => <Option value={bo.key} key={bo.key}>{bo.text}</Option>)}
          </Select>
        </FormItem>
      </Col>
    </Row>);
}

CreateActionForm.propTypes = {
  action: PropTypes.shape({ type: PropTypes.string }),
  index: PropTypes.number.isRequired,
  bizObjectOptions: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string })),
};

function NotifyActionForm(props) {
  const { action, index, msg, onChange } = props;
  function handleChange(actionKey, value) {
    onChange(actionKey, value, index);
  }
  return (
    <Row gutter={16}>
      <Col sm={24} lg={4}>
        <FormItem>
          {
            <Select value={action.type} onChange={value => handleChange('type', value)}>
              <Option value="CREATE" key="CREATE">{msg('actionCreate')}</Option>
              <Option value="NOTIFY" key="NOTIFY">{msg('actionNotify')}</Option>
            </Select>
          }
        </FormItem>
      </Col>
      <Col sm={24} lg={4}>
        <FormItem>
          <RadioGroup value="instant">
            <RadioButton value="instant" key="instant"><i className="icon icon-fontello-flash-1" /></RadioButton>
            <RadioButton value="scheduled" key="scheduled"><i className="icon icon-fontello-back-in-time" /></RadioButton>
          </RadioGroup>
        </FormItem>
      </Col>
      {!action.instant &&
      <Col sm={24} lg={6}>
        <FormItem>
          <InputNumber min={1} max={3600} style={{ width: '30%' }} />
          {msg('minutes')}
        </FormItem>
      </Col>
      }
      <Col sm={24} lg={8}>
        <FormItem>
          <CheckboxGroup options={notifyOptions} defaultValue={['email', 'wechat']} />
        </FormItem>
      </Col>
      <Col sm={24} lg={6}>
        <FormItem>
          <Input placeholder={msg('receiverPlaceholder')} />
        </FormItem>
      </Col>
      <Col sm={24} lg={6}>
        <FormItem >
          <Select placeholder={msg('content')} />
        </FormItem>
      </Col>
    </Row>);
}

NotifyActionForm.propTypes = {
  action: PropTypes.shape({ type: PropTypes.string }),
  index: PropTypes.number.isRequired,
};

@injectIntl
@connect(state => ({
  visible: state.scofFlow.visibleTriggerModal,
  nodeBizObject: state.scofFlow.triggerModal.node_biz_object,
  trigger: state.scofFlow.triggerModal.key,
  actions: state.scofFlow.triggerModal.actions,
}),
  { closeAddTriggerModal }
)
export default class AddTriggerModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    bizObjects: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string })),
    closeAddTriggerModal: PropTypes.func.isRequired,
    onModalOK: PropTypes.func.isRequired,
  }
  state = {
    actions: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.actions !== this.props.actions) {
      this.setState({ actions: nextProps.actions });
    }
  }
  handleActionAdd = () => {
    this.setState(
      { actions: [...this.state.actions, { id: uuidWithoutDash(), type: 'CREATE', instant: true }] }
    );
  }
  handleFormChange = (key, value, index) => {
    const actions = [...this.state.actions];
    actions[index][key] = value;
    this.setState({ actions });
  }
  handleOk = () => {
    this.props.onModalOK(this.props.nodeBizObject, this.props.trigger, this.state.actions);
    this.props.closeAddTriggerModal();
  }
  handleCancel = () => {
    this.props.closeAddTriggerModal();
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { visible, bizObjects } = this.props;
    const { actions } = this.state;
    return (
      <Modal title={this.msg('triggerActions')}
        width={800} visible={visible} maskClosable={false}
        onOk={this.handleOk} onCancel={this.handleCancel}
        wrapClassName="modal-docker"
      >
        <Form>
          {actions.map((action, index) => {
            switch (action.type) {
              case 'CREATE': return <CreateActionForm action={action} index={index} bizObjectOptions={bizObjects} onChange={this.handleFormChange} msg={this.msg} />;
              case 'NOTIFY': return <NotifyActionForm action={action} index={index} onChange={this.handleFormChange} msg={this.msg} />;
              default: return null;
            }
          })}
        </Form>
        <Button type="dashed" style={{ width: '100%' }} icon="plus" onClick={this.handleActionAdd} />
      </Modal>
    );
  }
}
