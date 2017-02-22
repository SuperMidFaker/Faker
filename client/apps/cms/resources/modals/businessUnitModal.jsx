import React, { PropTypes } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { connect } from 'react-redux';
import { toggleBusinessUnitModal, addBusinessUnit, updateBusinessUnit } from 'common/reducers/cmsResources';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  tenantId: state.account.tenantId,
  visible: state.cmsResources.businessUnitModal.visible,
  businessUnit: state.cmsResources.businessUnitModal.businessUnit,
  operation: state.cmsResources.businessUnitModal.operation,
}), { toggleBusinessUnitModal, addBusinessUnit, updateBusinessUnit })

export default class BusinessUnitModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool,
    operation: PropTypes.string, // add  edit
    businessUnit: PropTypes.object,
    addBusinessUnit: PropTypes.func.isRequired,
    updateBusinessUnit: PropTypes.func.isRequired,
    toggleBusinessUnitModal: PropTypes.func.isRequired,
  }

  state = {
    name: '',
    code: '',
    customsCode: '',
    type: '',
    receiveCode: '',
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      name: nextProps.businessUnit.comp_name || '',
      code: nextProps.businessUnit.comp_code || '',
      customsCode: nextProps.businessUnit.customs_code || '',
      type: nextProps.businessUnit.relation_type || '',
      receiveCode: nextProps.businessUnit.receive_code || '',
    });
  }
  handleOk = () => {
    const { businessUnit } = this.props;
    const { name, code, customsCode, receiveCode } = this.state;
    if (name === '') {
      message.error('请填写公司名称');
    } else if (code === '') {
      message.error('请填写社会信用代码');
    } else if (code.length !== 18) {
      message.error(`社会信用代码必须为18位, 当前${code.length}位`);
    } else if (customsCode && customsCode.length !== 10) {
      message.error(`海关10位编码必须为10位, 当前${customsCode.length}位`);
    } else if (this.props.operation === 'edit') {
      this.props.updateBusinessUnit(businessUnit.id, name, code, customsCode, receiveCode).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        }
        this.handleCancel();
      });
    } else {
      this.handleAddPartner();
    }
  }
  handleAddPartner = () => {
    const { tenantId } = this.props;
    const { name, code, customsCode, type, receiveCode } = this.state;
    this.props.addBusinessUnit(name, code, customsCode, type, receiveCode, tenantId).then((result1) => {
      if (result1.error) {
        message.error(result1.error.message);
      } else {
        this.handleCancel();
        message.info('添加成功');
      }
    });
  }
  handleCancel = () => {
    this.props.toggleBusinessUnitModal(false);
  }
  render() {
    const { visible } = this.props;
    const { name, code, customsCode, type, receiveCode } = this.state;
    return (
      <Modal title={this.props.operation === 'add' ? '新增经营单位' : '修改经营单位'} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <FormItem {...formItemLayout} label="公司名称:" required>
          <Input required value={name} onChange={e => this.setState({ name: e.target.value })} />
        </FormItem>
        <FormItem {...formItemLayout} label="社会信用代码:" required>
          <Input required value={code} onChange={e => this.setState({ code: e.target.value })} placeholder="18位社会信用代码" />
        </FormItem>
        <FormItem {...formItemLayout} label="海关十位编码:">
          <Input required value={customsCode} onChange={e => this.setState({ customsCode: e.target.value })} placeholder="海关10位编码" />
        </FormItem>
        { type === 'agent' && (
          <FormItem {...formItemLayout} label="接收代码:" required>
            <Input value={receiveCode} onChange={e => this.setState({ receiveCode: e.target.value })} />
          </FormItem>
        )}
      </Modal>
    );
  }
}
