import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Radio, message } from 'antd';
import { connect } from 'react-redux';
import { toggleBusinessUnitModal, addBusinessUnit, updateBusinessUnit } from 'common/reducers/cmsResources';
import { I_E_TYPES } from 'common/constants';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@connect(state => ({
  tenantId: state.account.tenantId,
  visible: state.cmsResources.businessUnitModal.visible,
  businessUnit: state.cmsResources.businessUnitModal.businessUnit,
  operation: state.cmsResources.businessUnitModal.operation,
}), { toggleBusinessUnitModal, addBusinessUnit, updateBusinessUnit })

export default class TraderModal extends React.Component {
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
    ieType: '',
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      name: nextProps.businessUnit.comp_name || '',
      code: nextProps.businessUnit.comp_code || '',
      customsCode: nextProps.businessUnit.customs_code || '',
      type: nextProps.businessUnit.relation_type || '',
      ieType: nextProps.businessUnit.i_e_type || '',
    });
  }
  handleOk = () => {
    const { businessUnit } = this.props;
    const { name, code, customsCode, ieType } = this.state;
    if (name === '') {
      message.error('请填写公司名称');
    } else if (code === '' && customsCode === '') {
      message.error('请填写社会信用代码或者海关编码');
    } else if (code && code.length !== 18) {
      message.error(`社会信用代码必须为18位, 当前${code.length}位`);
    } else if (customsCode && customsCode.length !== 10) {
      message.error(`海关10位编码必须为10位, 当前${customsCode.length}位`);
    } else if (ieType === '') {
      message.error('请选择进出口类型');
    } else if (this.props.operation === 'edit') {
      this.props.updateBusinessUnit(businessUnit.id, name, code, customsCode, ieType).then((result) => {
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
    const { tenantId } = this.props;
    const { name, code, customsCode, type, ieType } = this.state;
    this.props.addBusinessUnit(name, code, customsCode, type, ieType, tenantId).then((result1) => {
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
    const { name, code, customsCode, ieType } = this.state;
    return (
      <Modal title={this.props.operation === 'add' ? '新增进出口收发货人' : '修改进出口收发货人'} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <Form layout="vertical">
          <FormItem label="公司名称" required>
            <Input required value={name} onChange={e => this.setState({ name: e.target.value })} />
          </FormItem>
          <FormItem label="统一社会信用代码">
            <Input required value={code} onChange={e => this.setState({ code: e.target.value })} placeholder="18位统一社会信用代码" />
          </FormItem>
          <FormItem label="海关编码">
            <Input required value={customsCode} onChange={e => this.setState({ customsCode: e.target.value })} placeholder="10位海关编码" />
          </FormItem>
          <FormItem label="进出口类型">
            <RadioGroup onChange={e => this.setState({ ieType: e.target.value })} value={ieType}>
              {
                I_E_TYPES.map(item => <RadioButton value={item.key}>{item.value}</RadioButton>)
              }
            </RadioGroup>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
