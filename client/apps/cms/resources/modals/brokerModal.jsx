import React, { PropTypes } from 'react';
import { Modal, Form, Input, message, Checkbox } from 'antd';
import { connect } from 'react-redux';
import { addPartner, editPartner, checkPartner } from 'common/reducers/partner';
import { toggleCarrierModal } from 'common/reducers/transportResources';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
const options = [
  { label: '报关', value: 'CCB' },
  { label: '报检', value: 'CIB' },
  { label: '鉴定办证', value: 'ICB' },
];
@connect(state => ({
  tenantId: state.account.tenantId,
  visible: state.transportResources.carrierModal.visible,
  carrier: state.transportResources.carrierModal.carrier,
  operation: state.transportResources.carrierModal.operation,
}), { addPartner, editPartner, toggleCarrierModal, checkPartner })

export default class BrokerModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool,
    operation: PropTypes.string, // add  edit
    carrier: PropTypes.object,
    addPartner: PropTypes.func.isRequired,
    editPartner: PropTypes.func.isRequired,
    checkPartner: PropTypes.func.isRequired,
    toggleCarrierModal: PropTypes.func.isRequired,
  }
  state = {
    partnerName: '',
    partnerCode: '',
    partnerUniqueCode: '',
    role: PARTNER_ROLES.SUP,
    business: '',
    businessType: PARTNER_BUSINESSE_TYPES.clearance,
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      partnerName: nextProps.carrier.name || '',
      partnerCode: nextProps.carrier.partner_code || '',
      partnerUniqueCode: nextProps.carrier.partner_unique_code || '',
      role: nextProps.carrier.role || PARTNER_ROLES.SUP,
      business: nextProps.carrier.business || '',
    });
  }
  nameChooseConfirm = (foundName, name) => {
    Modal.confirm({
      title: '请选择',
      content: `${foundName} 与 ${name} 的唯一标示码一致，请选择该标识码下的企业名称`,
      okText: foundName,
      cancelText: name,
      onOk: () => {
        this.setState({ partnerName: foundName }, () => {
          this.handleAddPartner();
        });
      },
      onCancel: () => {
        this.handleAddPartner();
      },
    });
  }
  handleOk = () => {
    const { tenantId, carrier, operation } = this.props;
    const { partnerName, partnerCode, partnerUniqueCode, role, business } = this.state;
    if (partnerName === '') {
      message.error('请填写供应商名称');
    } else if (operation === 'add' && partnerUniqueCode === '') {
      message.error('请填写企业唯一标识码');
    } else if (this.props.operation === 'edit') {
      this.props.editPartner(carrier.id, partnerName, partnerCode, role, business).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        }
        this.handleCancel();
      });
    } else {
      this.props.checkPartner({
        tenantId,
        partnerInfo: { name: partnerName, partnerCode, partnerUniqueCode },
      }).then((result) => {
        let foundName = partnerName;
        if (result.data.partner && result.data.partner.name !== partnerName) {
          foundName = result.data.partner.name;
        }
        if (foundName !== partnerName) {
          this.nameChooseConfirm(foundName, partnerName);
        } else {
          this.handleAddPartner();
        }
      });
    }
  }
  handleAddPartner = () => {
    const { tenantId } = this.props;
    const { partnerName, partnerCode, partnerUniqueCode, role, business, businessType } = this.state;
    this.props.addPartner({ tenantId, partnerInfo: { partnerName, partnerCode, partnerUniqueCode }, role, business, businessType }).then((result1) => {
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
    this.props.toggleCarrierModal(false);
  }
  handleProviderChange = (value) => {
    if (value !== []) {
      this.setState({ business: value.join(',') });
    }
  }
  render() {
    const { visible, operation } = this.props;
    const { partnerName, partnerCode, partnerUniqueCode, business } = this.state;
    const businessArray = business !== '' ? business.split(',') : [];
    return (
      <Modal title={this.props.operation === 'add' ? '新增供应商' : '修改供应商'} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <FormItem {...formItemLayout} label="供应商名称:" required>
          <Input required value={partnerName} onChange={e => this.setState({ partnerName: e.target.value })} />
        </FormItem>
        <FormItem {...formItemLayout} label="企业唯一标识码:" required>
          <Input required value={partnerUniqueCode} onChange={e => this.setState({ partnerUniqueCode: e.target.value })} disabled={operation === 'edit'} />
        </FormItem>
        <FormItem {...formItemLayout} label="供应商代码:" required>
          <Input value={partnerCode} onChange={e => this.setState({ partnerCode: e.target.value })} />
        </FormItem>
        <FormItem {...formItemLayout} label="供应商类型:" required>
          <CheckboxGroup
            options={options}
            value={businessArray}
            onChange={this.handleProviderChange}
          />
        </FormItem>
      </Modal>
    );
  }
}
