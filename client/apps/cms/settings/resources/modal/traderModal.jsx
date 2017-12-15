import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, message } from 'antd';
import { connect } from 'react-redux';
import { toggleBusinessUnitModal, addBusinessUnit, updateBusinessUnit } from 'common/reducers/cmsResources';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  loginName: state.account.username,
  visible: state.cmsResources.businessUnitModal.visible,
  businessUnit: state.cmsResources.businessUnitModal.businessUnit,
  operation: state.cmsResources.businessUnitModal.operation,
  customer: state.cmsResources.customer,
}), { toggleBusinessUnitModal, addBusinessUnit, updateBusinessUnit })

export default class TraderModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    operation: PropTypes.string, // add  edit
    businessUnit: PropTypes.object,
    addBusinessUnit: PropTypes.func.isRequired,
    updateBusinessUnit: PropTypes.func.isRequired,
    toggleBusinessUnitModal: PropTypes.func.isRequired,
    customer: PropTypes.object.isRequired,
  }

  state = {
    name: '',
    code: '',
    customsCode: '',
    ciqCode: '',
    type: '',
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      name: nextProps.businessUnit.comp_name || '',
      code: nextProps.businessUnit.comp_code || '',
      customsCode: nextProps.businessUnit.customs_code || '',
      type: nextProps.businessUnit.relation_type || '',
      ciqCode: nextProps.businessUnit.ciq_code || '',
    });
  }
  handleOk = () => {
    const { businessUnit } = this.props;
    const {
      name, code, customsCode, ciqCode,
    } = this.state;
    if (name === '') {
      message.error('请填写企业名称');
    } else if (code === '' && customsCode === '') {
      message.error('请填写统一社会信用代码或者海关编码');
    } else if (code && code.length !== 18) {
      message.error('社会信用代码必须为18位字符');
    } else if (customsCode && customsCode.length !== 10) {
      message.error('海关编码必须为10位');
    } else if (this.props.operation === 'edit') {
      this.props.updateBusinessUnit(businessUnit.id, name, code, customsCode, ciqCode).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
        this.handleCancel();
      });
    } else {
      this.handleAddPartner();
    }
  }
  handleAddPartner = () => {
    const {
      tenantId, loginId, loginName, customer,
    } = this.props;
    const {
      name, code, customsCode, type, ciqCode,
    } = this.state;
    this.props.addBusinessUnit({
      name, code, customsCode, type, tenantId, loginId, loginName, customerPartnerId: customer.id, ciqCode,
    }).then((result1) => {
      if (result1.error) {
        message.error(result1.error.message, 10);
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
    const {
      name, code, customsCode, ciqCode,
    } = this.state;
    return (
      <Modal maskClosable={false} title={this.props.operation === 'add' ? '新增收发货人' : '修改收发货人'} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <Form layout="horizontal">
          <FormItem label="企业名称" required {...formItemLayout}>
            <Input required value={name} onChange={e => this.setState({ name: e.target.value })} />
          </FormItem>
          <FormItem label="统一社会信用代码" {...formItemLayout}>
            <Input required value={code} onChange={e => this.setState({ code: e.target.value })} placeholder="18位统一社会信用代码" />
          </FormItem>
          <FormItem label="海关编码" {...formItemLayout}>
            <Input required value={customsCode} onChange={e => this.setState({ customsCode: e.target.value })} placeholder="10位海关编码" />
          </FormItem>
          <FormItem label="检验检疫代码" {...formItemLayout}>
            <Input required value={ciqCode} onChange={e => this.setState({ ciqCode: e.target.value })} placeholder="检验检疫代码" />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
