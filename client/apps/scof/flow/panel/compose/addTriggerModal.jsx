import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Card, Popconfirm, Col, Modal, Form, List, Checkbox, Icon, InputNumber, Row, Select, Mention } from 'antd';
import { closeAddTriggerModal } from 'common/reducers/scofFlow';
import { uuidWithoutDash } from 'client/common/uuid';
import { NODE_BIZ_OBJECTS_EXECUTABLES, NODE_CREATABLE_BIZ_OBJECTS, NODE_NOTIFY_CONTENTS } from 'common/constants';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
  colon: false,
};
const formItemSpan2Layout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
  colon: false,
};

function CreateActionForm(props) {
  const {
    action, index, bizObjectOptions, msg, onChange,
  } = props;
  function handleChange(actionKey, value) {
    onChange(actionKey, value, index);
  }
  return (
    <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} style={{ width: '100%' }}>
      <Row>
        <Col span={8}>
          <FormItem label={msg('triggerAction')} {...formItemLayout}>
            <Select value={action.type} onChange={value => handleChange('type', value)}>
              <Option value="CREATE" key="CREATE">{msg('actionCreate')}</Option>
              <Option value="EXECUTE" key="EXECUTE">{msg('actionExecute')}</Option>
              <Option value="NOTIFY" key="NOTIFY">{msg('actionNotify')}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={msg('triggerMode')} {...formItemLayout}>
            <Select value={action.instant ? 'instant' : 'scheduled'} onChange={value => handleChange('instant', value === 'instant')}>
              <Option value="instant"><i className="icon icon-fontello-flash-1" />{msg('instantTrigger')}</Option>
              <Option value="scheduled"><i className="icon icon-fontello-back-in-time" />{msg('scheduledTrigger')}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={msg('triggerTimer')} {...formItemLayout}>
            {!!action.instant && <span>-</span>}
            {!action.instant && <span>{msg('timerWait')}
              <InputNumber
                value={action.delay}
                min={1}
                max={3600}
                style={{ width: '30%' }}
                onChange={value => handleChange('delay', value)}
              />
              {msg('timerMinutes')}
            </span>}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={msg('bizObject')} {...formItemLayout}>
            <Select value={action.biz_object} onChange={value => handleChange('biz_object', value)}>
              {bizObjectOptions.map(bo =>
                <Option value={bo.key} key={bo.key}>{msg(bo.text)}</Option>)}
            </Select>
          </FormItem>
        </Col>
      </Row>
    </Card>);
}

CreateActionForm.propTypes = {
  action: PropTypes.shape({ type: PropTypes.string }),
  index: PropTypes.number.isRequired,
  bizObjectOptions: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string })),
};

function ExecuteActionForm(props) {
  const {
    action, index, bizObjectOptions, msg, onChange,
  } = props;
  function handleChange(actionKey, value) {
    onChange(actionKey, value, index);
  }
  const bizobj = bizObjectOptions.filter(boo => boo.key === action.biz_object)[0];
  return (
    <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} style={{ width: '100%' }}>
      <Row>
        <Col span={8}>
          <FormItem label={msg('triggerAction')} {...formItemLayout}>
            <Select value={action.type} onChange={value => handleChange('type', value)}>
              <Option value="CREATE" key="CREATE">{msg('actionCreate')}</Option>
              <Option value="EXECUTE" key="EXECUTE">{msg('actionExecute')}</Option>
              <Option value="NOTIFY" key="NOTIFY">{msg('actionNotify')}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={msg('triggerMode')} {...formItemLayout}>
            <Select value={action.instant ? 'instant' : 'scheduled'} onChange={value => handleChange('instant', value === 'instant')}>
              <Option value="instant"><i className="icon icon-fontello-flash-1" />{msg('instantTrigger')}</Option>
              <Option value="scheduled"><i className="icon icon-fontello-back-in-time" />{msg('scheduledTrigger')}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={msg('triggerTimer')} {...formItemLayout}>
            {action.instant && <span>-</span>}
            {!action.instant && <span>{msg('timerWait')}
              <InputNumber
                value={action.delay}
                min={1}
                max={3600}
                style={{ width: '30%' }}
                onChange={value => handleChange('delay', value)}
              />
              {msg('timerMinutes')}
            </span>}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={msg('bizObject')} {...formItemLayout}>
            <Select value={action.biz_object} onChange={(value) => { handleChange('biz_trigger', ''); handleChange('biz_object', value); }}>
              {bizObjectOptions.map(bo =>
                <Option value={bo.key} key={bo.key}>{msg(bo.text)}</Option>)}
            </Select>
          </FormItem>
        </Col>
        {bizobj &&
        <Col span={16}>
          <FormItem label={msg('bizObjOperation')} {...formItemSpan2Layout}>
            <Select value={action.biz_trigger} onChange={value => handleChange('biz_trigger', value)}>
              {bizobj.triggers.map(bot =>
                <Option value={bot.action} key={bot.action}>{msg(bot.actionText)}</Option>)}
            </Select>
          </FormItem>
        </Col>}
      </Row>
    </Card>);
}

ExecuteActionForm.propTypes = {
  action: PropTypes.shape({ type: PropTypes.string }),
  index: PropTypes.number.isRequired,
  bizObjectOptions: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string })),
};

function NotifyActionForm(props) {
  const {
    action, index, msg, onChange, serviceTeamMembers,
  } = props;
  function handleChange(actionKey, value) {
    onChange(actionKey, value, index);
  }
  return (
    <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} style={{ width: '100%' }}>
      <Row>
        <Col span={8}>
          <FormItem label={msg('triggerAction')} {...formItemLayout}>
            <Select value={action.type} onChange={value => handleChange('type', value)}>
              <Option value="CREATE" key="CREATE">{msg('actionCreate')}</Option>
              <Option value="EXECUTE" key="EXECUTE">{msg('actionExecute')}</Option>
              <Option value="NOTIFY" key="NOTIFY">{msg('actionNotify')}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={msg('triggerMode')} {...formItemLayout}>
            <Select value={action.instant ? 'instant' : 'scheduled'} onChange={value => handleChange('instant', value === 'instant')}>
              <Option value="instant"><i className="icon icon-fontello-flash-1" />{msg('instantTrigger')}</Option>
              <Option value="scheduled"><i className="icon icon-fontello-back-in-time" />{msg('scheduledTrigger')}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={msg('triggerTimer')} {...formItemLayout}>
            {action.instant && <span>-</span>}
            {!action.instant && <span>{msg('timerWait')}
              <InputNumber
                value={action.delay}
                min={1}
                max={3600}
                style={{ width: '30%' }}
                onChange={value => handleChange('delay', value)}
              />
              {msg('timerMinutes')}
            </span>}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem label={msg('notifyContent')} {...formItemSpan2Layout}>
            <Mention
              prefix="$"
              placeholder={msg('receiverPlaceholder')}
              defaultValue={action.content ? Mention.toContentState(action.content) : null}
              onChange={editorState => handleChange('content', Mention.toString(editorState))}
              suggestions={NODE_NOTIFY_CONTENTS.map(item => item.text)}
            />
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem
            label={
              <span>
                <Checkbox
                  checked={action.recv_login_ids_enabled}
                  onChange={(e) => {
                handleChange('recv_login_ids_enabled', e.target.checked);
                if (!e.target.checked) {
                  handleChange('recv_login_ids', '');
                }
              }}
                /><span>{msg('platformMsg')}</span>
              </span>}
            {...formItemSpan2Layout}
          >
            <Select
              mode="tags"
              placeholder=""
              value={action.recv_login_ids ? action.recv_login_ids.split(',') : []}
              onChange={value => handleChange('recv_login_ids', value.join(','))}
              disabled={!action.recv_login_ids_enabled}
            >
              {serviceTeamMembers.map(item =>
                <Option value={String(item.lid)} key={item.lid}>{item.name}</Option>)}
            </Select>
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem
            label={
              <span>
                <Checkbox
                  checked={action.recv_emails_enabled}
                  onChange={(e) => {
                handleChange('recv_emails_enabled', e.target.checked);
                if (!e.target.checked) {
                  handleChange('recv_emails', '');
                }
              }}
                /><span>{msg('mail')}</span>
              </span>}
            {...formItemSpan2Layout}
          >
            <Select
              mode="tags"
              value={action.recv_emails ? action.recv_emails.split(',') : []}
              onChange={value => handleChange('recv_emails', value.join(','))}
              tokenSeparators={[',']}
              placeholder="多个使用英文逗号分隔"
              disabled={!action.recv_emails_enabled}
            />
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem
            label={
              <span>
                <Checkbox
                  checked={action.recv_tels_enabled}
                  onChange={(e) => {
                handleChange('recv_tels_enabled', e.target.checked);
                if (!e.target.checked) {
                  handleChange('recv_tels', '');
                }
              }}
                /><span>{msg('sms')}</span>
              </span>}
            {...formItemSpan2Layout}
          >
            <Select
              mode="tags"
              value={action.recv_tels ? action.recv_tels.split(',') : []}
              onChange={value => handleChange('recv_tels', value.join(','))}
              tokenSeparators={[',']}
              placeholder="多个使用英文逗号分隔"
              disabled={!action.recv_tels_enabled}
            />
          </FormItem>
        </Col>
      </Row>
    </Card>);
}

NotifyActionForm.propTypes = {
  action: PropTypes.shape({ type: PropTypes.string }),
  index: PropTypes.number.isRequired,
  serviceTeamMembers: PropTypes.array,
};

@injectIntl
@connect(
  state => ({
    visible: state.scofFlow.visibleTriggerModal,
    nodeBizObject: state.scofFlow.triggerModal.node_biz_object,
    trigger: state.scofFlow.triggerModal.key,
    actions: state.scofFlow.triggerModal.actions,
    serviceTeamMembers: state.crmCustomers.operators,
    partnerId: state.scofFlow.currentFlow.partner_id,
  }),
  { closeAddTriggerModal }
)
export default class AddTriggerModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    closeAddTriggerModal: PropTypes.func.isRequired,
    onModalOK: PropTypes.func.isRequired,
    serviceTeamMembers: PropTypes.array,
  }
  state = {
    actions: [],
    bizobjExecutes: [],
    creatableBizObjects: [],
  }
  componentWillMount() {
    if (this.props.kind) {
      const bizobjExecutes = NODE_BIZ_OBJECTS_EXECUTABLES[this.props.kind];
      if (bizobjExecutes) {
        // todo creatableBiz func this.props.model for example SO bonded
        // reg_type: normal -> NormalReg bizobject
        const creatableBizObjects = NODE_CREATABLE_BIZ_OBJECTS[this.props.kind].map(nbo =>
          ({ key: nbo.key, text: nbo.text }));
        this.setState({ bizobjExecutes, creatableBizObjects });
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.actions !== this.props.actions) {
      this.setState({
        actions: nextProps.actions.map(item => ({
          ...item,
          recv_login_ids_enabled: !!item.recv_login_ids,
          recv_emails_enabled: !!item.recv_emails,
          recv_tels_enabled: !!item.recv_tels,
        })),
      });
    }
    if (nextProps.kind && nextProps.kind !== this.props.kind) {
      const bizobjExecutes = NODE_BIZ_OBJECTS_EXECUTABLES[nextProps.kind];
      if (bizobjExecutes) {
        const creatableBizObjects = NODE_CREATABLE_BIZ_OBJECTS[nextProps.kind].map(nbo =>
          ({ key: nbo.key, text: nbo.text }));
        this.setState({ bizobjExecutes, creatableBizObjects });
      }
    }
  }
  handleActionAdd = () => {
    this.setState({ actions: [...this.state.actions, { id: uuidWithoutDash(), type: 'CREATE', instant: true }] });
  }
  handleFormChange = (key, value, index) => {
    const actions = [...this.state.actions];
    actions[index][key] = value;
    this.setState({ actions });
  }
  handleActionDel = (index) => {
    const actions = [...this.state.actions];
    actions.splice(index, 1);
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
  renderAction(action, index) {
    const { serviceTeamMembers } = this.props;
    const { bizobjExecutes, creatableBizObjects } = this.state;
    let actionForm = null;
    switch (action.type) {
      case 'CREATE': actionForm = (
        <CreateActionForm
          key={action.id}
          action={action}
          onDel={this.handleActionDel}
          index={index}
          bizObjectOptions={creatableBizObjects}
          onChange={this.handleFormChange}
          msg={this.msg}
        />);
        break;
      case 'EXECUTE': actionForm = (
        <ExecuteActionForm
          key={action.id}
          action={action}
          onDel={this.handleActionDel}
          index={index}
          bizObjectOptions={bizobjExecutes}
          onChange={this.handleFormChange}
          msg={this.msg}
        />);
        break;
      case 'NOTIFY': actionForm = (
        <NotifyActionForm
          key={action.id}
          action={action}
          onDel={this.handleActionDel}
          index={index}
          onChange={this.handleFormChange}
          msg={this.msg}
          serviceTeamMembers={serviceTeamMembers}
        />);
        break;
      default:
        break;
    }
    return actionForm;
  }
  render() {
    const { visible } = this.props;
    const { actions } = this.state;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('triggerActions')}
        width={960}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form layout="horizontal" className="form-layout-multi-col">
          <List
            itemLayout="horizontal"
            dataSource={actions}
            renderItem={(action, index) => (
              <List.Item actions={[<Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleActionDel(index)}>
                <a role="presentation"><Icon type="delete" /></a></Popconfirm>]}
              >
                {this.renderAction(action, index)}
              </List.Item>
            )}
          />
        </Form>
        <Button type="dashed" style={{ width: '100%' }} icon="plus" onClick={this.handleActionAdd} >
          {this.msg('addTrigger')}
        </Button>
      </Modal>
    );
  }
}
