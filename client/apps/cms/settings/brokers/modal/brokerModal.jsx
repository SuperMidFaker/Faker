import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, message, Radio, Select } from 'antd';
import { connect } from 'react-redux';
import { toggleBrokerModal, addBroker, editBroker } from 'common/reducers/cmsBrokers';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadPartners } from 'common/reducers/partner';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

const role = PARTNER_ROLES.SUP;
const businessType = PARTNER_BUSINESSE_TYPES.clearance;

function fetchData({ dispatch, state }) {
  return dispatch(loadPartners({
    tenantId: state.account.tenantId,
    role,
    businessType,
    from: 'table',
  }));
}

@connectFetch()(fetchData)
@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  username: state.account.username,
  visible: state.cmsBrokers.brokerModal.visible,
  broker: state.cmsBrokers.brokerModal.broker,
  operation: state.cmsBrokers.brokerModal.operation,
  partners: state.partner.partners,
}), { toggleBrokerModal, addBroker, editBroker })

export default class BrokerModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool,
    operation: PropTypes.string, // add  edit
    broker: PropTypes.object,
    toggleBrokerModal: PropTypes.func.isRequired,
  }
  state = {
    name: '',
    customsCode: '',
    partnerUniqueCode: '',
    ieType: 'A',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible && nextProps.broker && nextProps.broker.id) {
      this.setState({
        name: nextProps.broker.comp_name,
        customsCode: nextProps.broker.customs_code,
        partnerUniqueCode: nextProps.broker.comp_code,
        ieType: nextProps.broker.i_e_type,
      });
    }
  }
  onChange = (e) => {
    this.setState({ ieType: e.target.value });
  }
  handleOk = () => {
    const { broker, operation } = this.props;
    const { name, customsCode, partnerUniqueCode, ieType } = this.state;
    if (name === '') {
      message.error('请填写企业名称');
    } else if (operation === 'add' && partnerUniqueCode === '') {
      message.error('统一社会信用代码必填');
    } else if (operation === 'add' && partnerUniqueCode.length !== 18) {
      message.error(`统一社会信用代码必须18位,当前${partnerUniqueCode.length}位`);
    } else if (!customsCode) {
      message.error('海关编码必填');
    } else if (customsCode && customsCode.length !== 10) {
      message.error(`海关编码必须为10位, 当前${customsCode.length}位`);
    } else if (ieType === '') {
      message.error('请选择业务类型');
    } else if (operation === 'edit') {
      this.props.editBroker(broker.id, name, customsCode, partnerUniqueCode, ieType).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
        this.handleCancel();
        this.props.onOk();
      });
    } else {
      this.handleAddPartner();
    }
  }
  handleAddPartner = () => {
    const { name, customsCode, partnerUniqueCode, ieType } = this.state;
    const { loginId, username } = this.props;
    this.props.addBroker(name, customsCode, partnerUniqueCode, ieType, loginId, username).then((result1) => {
      if (result1.error) {
        message.error(result1.error.message);
      } else {
        this.handleCancel();
        message.info('添加成功');
        if (this.props.onOk) {
          this.props.onOk();
        }
      }
    });
  }
  handleCancel = () => {
    this.props.toggleBrokerModal(false);
    this.setState({
      name: '',
      customsCode: '',
      partnerUniqueCode: '',
      ieType: '',
    });
  }
  handleSelect = (value) => {
    const { partners } = this.props;
    const broker = partners.find(partner => partner.name === value);
    this.setState({
      name: broker.comp_name,
      customsCode: broker.customs_code,
      partnerUniqueCode: broker.partner_unique_code,
    });
  }
  handleNameChange = (value) => {
    this.setState({ name: value });
  }
  handleUniqueCodeChange = (e) => {
    this.setState({ partnerUniqueCode: e.target.value });
  }
  render() {
    const { visible, operation, partners } = this.props;
    const { name, customsCode, partnerUniqueCode, ieType } = this.state;
    return (
      <Modal title={operation === 'add' ? '新增报关报检代理' : '修改报关报检代理'} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <Form layout="vertical">
          {visible && <FormItem label="企业名称" required>
            <Select mode="combobox" value={name} onChange={this.handleNameChange} style={{ width: '100%' }} onSelect={this.handleSelect}>
              {partners.map(partner => (<Option value={partner.name} key={partner.name}>{partner.name}</Option>))}
            </Select>
          </FormItem>}
          <FormItem label="统一社会信用代码" required>
            <Input required value={partnerUniqueCode} onChange={this.handleUniqueCodeChange} />
          </FormItem>
          <FormItem label="海关编码" required>
            <Input value={customsCode} onChange={e => this.setState({ customsCode: e.target.value })} />
          </FormItem>
          <FormItem label="业务类型" required>
            <RadioGroup onChange={this.onChange} value={ieType}>
              <Radio value="A">进出口</Radio>
              <Radio value="I">进口</Radio>
              <Radio value="E">出口</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
