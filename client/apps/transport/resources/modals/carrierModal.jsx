import React, { PropTypes } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { connect } from 'react-redux';
import { addPartner, editPartner, checkPartner } from 'common/reducers/partner';
import { toggleCarrierModal } from 'common/reducers/transportResources';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  tenantId: state.account.tenantId,
  visible: state.transportResources.carrierModal.visible,
  carrier: state.transportResources.carrierModal.carrier,
  operation: state.transportResources.carrierModal.operation,
}), { addPartner, editPartner, toggleCarrierModal, checkPartner })

export default class CarrierModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool,
    operation: PropTypes.string, // add  edit
    carrier: PropTypes.object,
    addPartner: PropTypes.func.isRequired,
    editPartner: PropTypes.func.isRequired,
    toggleCarrierModal: PropTypes.func.isRequired,
    checkPartner: PropTypes.func.isRequired,
    onOk: PropTypes.func,
  }
  state = {
    partnerName: '',
    partnerCode: '',
    partnerUniqueCode: '',
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
    const { partnerName, partnerCode, partnerUniqueCode } = this.state;
    if (partnerName === '') {
      message.error('请填写合作伙伴名称');
    } else if (partnerCode === '') {
      message.error('请填写合作伙伴代码');
    } else if (partnerUniqueCode === '') {
      message.error('请填写企业唯一标识码');
    } else {
      this.handleCancel();
      if (this.props.operation === 'edit') {
        this.props.editPartner(carrier.id, partnerName, partnerCode).then((result) => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            message.success('修改成功');
            if (this.props.onOk) {
              this.props.onOk();
            }
          }
        });
      } else {
        this.props.checkPartner({
          tenantId,
          partnerInfo: { name: partnerName, partnerCode, partnerUniqueCode },
        }).then((result) => {
          let name = partnerName;
          if (result.data.partner && result.data.partner.name !== partnerName) {
            name = result.data.partner.name;
          }
          this.props.addPartner({ tenantId, partnerInfo: { partnerName: name, partnerCode, partnerUniqueCode }, partnerships: ['TRS'] }).then((result1) => {
            if (result1.error) {
              message.error(result1.error.message);
            } else {
              if (partnerName !== name) {
                message.info(`添加成功 找到 企业唯一标识码为:${partnerUniqueCode} 的承运商信息， 已将承运商名称 ${partnerName} 替换为 ${name} `, 10);
              } else {
                message.info('添加成功');
              }
              if (this.props.onOk) {
                this.props.onOk();
              }
            }
          });
        });
      }
    }
  }
  handleCancel = () => {
    this.props.toggleCarrierModal(false);
  }
  render() {
    const { visible } = this.props;
    const { partnerName, partnerCode, partnerUniqueCode } = this.state;
    return (
      <Modal title={this.props.operation === 'add' ? '新增承运商' : '修改承运商'} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <FormItem {...formItemLayout} label="合作伙伴名称:" required>
          <Input required value={partnerName} onChange={e => this.setState({ partnerName: e.target.value })} />
        </FormItem>
        <FormItem {...formItemLayout} label="合作伙伴代码:" required>
          <Input required value={partnerCode} onChange={e => this.setState({ partnerCode: e.target.value })} />
        </FormItem>
        <FormItem {...formItemLayout} label="企业唯一标识码:" required>
          <Input required value={partnerUniqueCode} onChange={e => this.setState({ partnerUniqueCode: e.target.value })} />
        </FormItem>
      </Modal>
    );
  }
}
