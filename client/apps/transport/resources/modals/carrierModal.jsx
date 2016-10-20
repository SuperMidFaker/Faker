/**
 * 添加partner时弹出的通用Modal组件, 参考自antd中的Model.confirm组件
 * @param {config<Object>} 配置对象, 参数如下:
 * {
 *    onOk(value){}:           确认按钮按下后执行的函数,参数是当前选中的tenant对象
 *    partnerTenants<Array>:   在mode='add'模式下的下拉选项的tenants数组, add模式下需要
 *    providerValues<Array>:   在mode='editProvider'模式下默认选中的provider types数组, editProvider模式下需要
 * }
 * @return {}
 */
import React, { PropTypes } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { connect } from 'react-redux';
import { addPartner, editPartner } from 'common/reducers/partner';
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
}), { addPartner, editPartner, toggleCarrierModal })

export default class CarrierModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool,
    operation: PropTypes.string, // add  edit
    carrier: PropTypes.object,
    addPartner: PropTypes.func.isRequired,
    editPartner: PropTypes.func.isRequired,
    toggleCarrierModal: PropTypes.func.isRequired,
  }
  state = {
    partnerName: '',
    partnerCode: '',
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      partnerName: nextProps.carrier.name || '',
      partnerCode: nextProps.carrier.code || '',
    });
  }
  handleOk = () => {
    const { tenantId, carrier } = this.props;
    const { partnerName, partnerCode } = this.state;
    if (partnerName === '') {
      message.error('请填写合作伙伴名称');
    } else if (partnerCode === '') {
      message.error('请填写合作伙伴代码');
    } else {
      this.handleCancel();
      if (this.props.operation === 'edit') {
        this.props.editPartner(carrier.id, partnerName, partnerCode).then((result) => {
          if (result.error) {
            message.error(result.error.message);
          }
        });
      } else {
        this.props.addPartner({ tenantId, partnerInfo: { partnerName, partnerCode }, partnerships: ['TRS'] }).then(() => {
          message.success('添加成功');
        });
      }
    }
  }
  handleCancel = () => {
    this.props.toggleCarrierModal(false);
  }
  handleNameChange = (ev) => {
    this.setState({ partnerName: ev.target.value });
  }
  handleCodeChange = (ev) => {
    this.setState({ partnerCode: ev.target.value });
  }
  render() {
    const { visible } = this.props;
    const { partnerName, partnerCode } = this.state;
    return (
      <Modal title={this.props.operation === 'add' ? '新增承运商' : '修改承运商'} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <FormItem {...formItemLayout} label="合作伙伴名称:" required>
          <Input required value={partnerName} onChange={this.handleNameChange} />
        </FormItem>
        <FormItem {...formItemLayout} label="合作伙伴代码:" required>
          <Input required value={partnerCode} onChange={this.handleCodeChange} />
        </FormItem>
      </Modal>
    );
  }
}
