import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, message, Select } from 'antd';
import { connect } from 'react-redux';
import { toggleBrokerModal, addBroker, editBroker } from 'common/reducers/cmsBrokers';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadPartners } from 'common/reducers/partner';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const FormItem = Form.Item;
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
  brokers: state.cmsBrokers.brokers,
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
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible && nextProps.broker && nextProps.broker.id) {
      this.setState({
        name: nextProps.broker.comp_name,
        customsCode: nextProps.broker.customs_code,
        partnerUniqueCode: nextProps.broker.comp_code,
      });
    }
  }
  handleOk = () => {
    const { broker, operation } = this.props;
    const { name, customsCode, partnerUniqueCode } = this.state;
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
    } else if (operation === 'edit') {
      this.props.editBroker(broker.id, name, customsCode, partnerUniqueCode).then((result) => {
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
    const { name, customsCode, partnerUniqueCode } = this.state;
    const { loginId, username, partners } = this.props;
    const broker = partners.find(partner => partner.name === name);
    this.props.addBroker(name, customsCode, partnerUniqueCode, loginId, username, broker.id).then((result1) => {
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
    const { visible, operation, partners, brokers } = this.props;
    const { name, customsCode, partnerUniqueCode } = this.state;
    const filterPartners = partners.filter(partner => !brokers.find(broker => broker.comp_partner_id === partner.id));
    return (
      <Modal maskClosable={false} title={operation === 'add' ? '新增报关报检代理' : '修改报关报检代理'} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <Form layout="vertical">
          {visible && <FormItem label="企业名称" required>
            <Select mode="combobox" value={name} onChange={this.handleNameChange} style={{ width: '100%' }} onSelect={this.handleSelect}>
              {filterPartners.map(partner => (<Option value={partner.name} key={partner.name}>{partner.name}</Option>))}
            </Select>
          </FormItem>}
          <FormItem label="统一社会信用代码" required>
            <Input required value={partnerUniqueCode} onChange={this.handleUniqueCodeChange} />
          </FormItem>
          <FormItem label="海关编码" required>
            <Input value={customsCode} onChange={e => this.setState({ customsCode: e.target.value })} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
