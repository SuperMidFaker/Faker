import React, { PropTypes } from 'react';
import { Modal, Form, Input, message, Checkbox } from 'antd';
import { connect } from 'react-redux';
import { addPartner, editPartner } from 'common/reducers/partner';
import { toggleCarrierModal } from 'common/reducers/transportResources';

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
}), { addPartner, editPartner, toggleCarrierModal })

export default class BrokerModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool,
    operation: PropTypes.string, // add  edit
    carrier: PropTypes.object,
    addPartner: PropTypes.func.isRequired,
    editPartner: PropTypes.func.isRequired,
    toggleCarrierModal: PropTypes.func.isRequired,
    partnerships: PropTypes.array,
  }
  state = {
    partnerName: '',
    partnerCode: '',
    partnerUniqueCode: '',
    partnerships: this.props.partnerships || [],
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      partnerName: nextProps.carrier.name || '',
      partnerCode: nextProps.carrier.code || '',
      partnerUniqueCode: nextProps.carrier.partnerUniqueCode || '',
    });
  }
  handleOk = () => {
    const { tenantId, carrier } = this.props;
    const { partnerName, partnerCode, partnerUniqueCode, partnerships } = this.state;
    if (partnerName === '') {
      message.error('请填写供应商名称');
    } else if (partnerCode === '') {
      message.error('请填写供应商代码');
    } else if (partnerUniqueCode === '') {
      message.error('请填写企业唯一标识码');
    } else {
      this.handleCancel();
      if (this.props.operation === 'edit') {
        this.props.editPartner(carrier.id, partnerName, partnerCode).then((result) => {
          if (result.error) {
            message.error(result.error.message);
          }
        });
      } else {
        this.props.addPartner({ tenantId, partnerInfo: { partnerName, partnerCode, partnerUniqueCode }, partnerships }).then(() => {
          message.success('添加成功');
        });
      }
    }
  }
  handleCancel = () => {
    this.props.toggleCarrierModal(false);
  }
  handleProviderChange = (value) => {
    this.setState({ partnerships: value });
  }
  render() {
    const { visible } = this.props;
    const { partnerName, partnerCode, partnerUniqueCode, partnerships } = this.state;
    return (
      <Modal title={this.props.operation === 'add' ? '新增供应商' : '修改供应商'} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <FormItem {...formItemLayout} label="供应商名称:" required>
          <Input required value={partnerName} onChange={(e) => this.setState({ partnerName: e.target.value})} />
        </FormItem>
        <FormItem {...formItemLayout} label="供应商代码:" required>
          <Input required value={partnerCode} onChange={(e) => this.setState({ partnerCode: e.target.value})} />
        </FormItem>
        <FormItem {...formItemLayout} label="企业唯一标识码:" required>
          <Input required value={partnerUniqueCode} onChange={(e) => this.setState({ partnerUniqueCode: e.target.value})} />
        </FormItem>
        <FormItem {...formItemLayout} label="供应商类型:" required>
          <CheckboxGroup
            options={options}
            defaultValue={partnerships}
            onChange={this.handleProviderChange}
          />
        </FormItem>
      </Modal>
    );
  }
}
