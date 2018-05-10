import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, message } from 'antd';
import { connect } from 'react-redux';
import { addPartner, editPartner, checkPartner } from 'common/reducers/partner';
import { toggleCarrierModal } from 'common/reducers/transportResources';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES, PARTNER_BUSINESSES } from 'common/constants';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  visible: state.transportResources.carrierModal.visible,
  carrier: state.transportResources.carrierModal.carrier,
  operation: state.transportResources.carrierModal.operation,
}), {
  addPartner, editPartner, toggleCarrierModal, checkPartner,
})

export default class CarrierModal extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    operation: PropTypes.string, // add  edit
    carrier: PropTypes.shape({ partner_code: PropTypes.string }),
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
    role: PARTNER_ROLES.VEN,
    business: PARTNER_BUSINESSES.TRS,
    businessType: PARTNER_BUSINESSE_TYPES.transport,
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      partnerName: nextProps.carrier.name || '',
      partnerCode: nextProps.carrier.partner_code || '',
      partnerUniqueCode: nextProps.carrier.partner_unique_code || '',
    });
  }
  nameChooseConfirm = (foundName, name) => {
    Modal.confirm({
      title: '请选择',
      content: `${foundName} 与 ${name} 的唯一标识码一致，请选择该标识码下的企业名称`,
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
    const { carrier, operation } = this.props;
    const {
      partnerName, partnerCode, partnerUniqueCode, role, business, businessType,
    } = this.state;
    if (partnerName === '') {
      message.error('请填写承运商名称');
    } else if (operation === 'edit') {
      const partnerInfo = {
        name: partnerName,
        partnerUniqueCode,
        partnerCode,
        role,
        business,
        businessType,
      };
      this.props.editPartner(carrier.id, partnerInfo).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.handleCancel();
          message.success('修改成功');
          if (this.props.onOk) {
            this.props.onOk();
          }
        }
      });
    } else {
      this.props.checkPartner({
        name: partnerName, partnerCode, partnerUniqueCode,
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
    const {
      partnerName, partnerCode, partnerUniqueCode, role, business, businessType,
    } = this.state;
    this.props.addPartner({
      name: partnerName,
      partnerCode,
      partnerUniqueCode,
      role,
      business,
      businessType,
    }).then((result1) => {
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
  render() {
    const { visible, operation } = this.props;
    const { partnerName, partnerCode, partnerUniqueCode } = this.state;
    return (
      <Modal maskClosable={false} title={operation === 'add' ? '新增承运商' : '修改承运商'} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <FormItem {...formItemLayout} label="承运商名称:" required>
          <Input
            required
            value={partnerName}
            onChange={e =>
              this.setState({ partnerName: e.target.value })}
          />
        </FormItem>
        <FormItem {...formItemLayout} label="承运商代码:" required>
          <Input
            value={partnerCode}
            onChange={e =>
              this.setState({ partnerCode: e.target.value })}
          />
        </FormItem>
        <FormItem {...formItemLayout} label="统一社会信用代码:" required>
          <Input
            value={partnerUniqueCode}
            onChange={e =>
              this.setState({ partnerUniqueCode: e.target.value })}
          />
        </FormItem>
      </Modal>
    );
  }
}
