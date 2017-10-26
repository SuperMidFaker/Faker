import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Input, Checkbox, message } from 'antd';
import { addSp, editSp, closeSpModal, checkPartner, matchTenant } from 'common/reducers/partner';
import { BUSINESS_TYPES } from 'common/constants';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.partner.visibleSpModal,
    spPartner: state.partner.spModal.partner,
    operation: state.partner.spModal.operation,
    matchedPartners: state.partner.matchedPartners,
  }),
  { addSp, editSp, checkPartner, closeSpModal, matchTenant }
)

export default class SpModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    operation: PropTypes.string, // add  edit
    addSp: PropTypes.func.isRequired,
    checkPartner: PropTypes.func.isRequired,
    closeSpModal: PropTypes.func.isRequired,
    editSp: PropTypes.func.isRequired,
    spPartner: PropTypes.object.isRequired,
    reload: PropTypes.func,
  }
  state = {
    id: -1,
    name: '',
    partnerCode: '',
    partnerUniqueCode: '',
    customsCode: '',
    contact: '',
    phone: '',
    email: '',
    businessType: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.operation === 'edit') {
      this.setState({
        id: nextProps.spPartner.id,
        name: nextProps.spPartner.name,
        partnerCode: nextProps.spPartner.partner_code,
        partnerUniqueCode: nextProps.spPartner.partner_unique_code || '',
        customsCode: nextProps.spPartner.customs_code || '',
        contact: nextProps.spPartner.contact,
        phone: nextProps.spPartner.phone,
        email: nextProps.spPartner.email,
        businessType: nextProps.spPartner.business_type,
      });
    }
  }
  handleCancel = () => {
    this.setState({
      id: -1,
      name: '',
      partnerCode: '',
      partnerUniqueCode: '',
      customsCode: '',
      contact: '',
      phone: '',
      email: '',
      businessType: '',
    });
    this.props.closeSpModal();
  }
  nameChooseConfirm = (foundName, name) => {
    Modal.confirm({
      title: '请选择',
      content: `${foundName} 与 ${name} 的唯一标识码一致，请选择该标识码下的企业名称`,
      okText: foundName,
      cancelText: name,
      onOk: () => {
        this.setState({ name: foundName }, () => {
          this.handleAddSp();
        });
      },
      onCancel: () => {
        this.handleAddSp();
      },
    });
  }
  handleOk = () => {
    const { id, name, partnerCode, partnerUniqueCode, customsCode, contact, phone, email, businessType } = this.state;
    const { tenantId, operation } = this.props;
    if (!name || name === '') {
      message.error('企业名称必填');
    } else if (operation === 'add' && partnerUniqueCode === '') {
      message.error('统一社会信用代码必填');
    } else if (operation === 'add' && partnerUniqueCode.length !== 18) {
      message.error(`统一社会信用代码必须18位,当前${partnerUniqueCode.length}位`);
    } else if (customsCode && customsCode.length !== 10) {
      message.error(`海关编码必须为10位, 当前${customsCode.length}位`);
    } else if (businessType === '') {
      message.error('请选择业务类型');
    } else if (this.props.operation === 'edit') {
      this.props.editSp({
        tenantId,
        partnerInfo: { id, name, partnerCode, partnerUniqueCode, customsCode, contact, phone, email },
        businessType,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.reload();
          message.success('修改成功');
          this.handleCancel();
        }
      });
    } else {
      this.props.checkPartner({
        tenantId,
        partnerInfo: { name, partnerCode, partnerUniqueCode },
      }).then((result) => {
        let foundName = name;
        if (result.data.partner && result.data.partner.name !== name) {
          foundName = result.data.partner.name;
        }
        if (foundName !== name) {
          this.nameChooseConfirm(foundName, name);
        } else {
          this.handleAddSp();
        }
      });
    }
  }
  handleAddSp = () => {
    const { name, partnerCode, partnerUniqueCode, customsCode, contact, phone, email, businessType } = this.state;
    const { tenantId } = this.props;
    this.props.addSp({
      tenantId,
      partnerInfo: { name, partnerCode, partnerUniqueCode, customsCode, contact, phone, email },
      businessType,
    }).then((result1) => {
      if (result1.error) {
        message.error(result1.error.message);
      } else {
        this.handleCancel();
        this.props.reload();
        message.info('添加成功');
      }
    });
  }
  handleBlur = () => {
    const name = this.state.name;
    this.props.matchTenant(name).then(
      result => this.setState({
        partnerUniqueCode: result.data.code,
        customsCode: result.data.customs_code,
      })
    );
  }
  render() {
    const { visible, operation } = this.props;
    const { businessType } = this.state;
    const businessArray = businessType !== '' ? businessType.split(',') : [];
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    let title = '';
    if (operation === 'add') {
      title = '新增服务商';
    } else if (operation === 'edit') {
      title = '修改服务商资料';
    }
    return (
      <Modal maskClosable={false} visible={visible} title={title} onCancel={this.handleCancel} onOk={this.handleOk}>
        <Form layout="horizontal">
          <FormItem
            {...formItemLayout}
            label="名称"
            hasFeedback
            required
          >
            <Input value={this.state.name} onBlur={this.handleBlur} onChange={(e) => { this.setState({ name: e.target.value }); }} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="服务商代码"
            hasFeedback
          >
            <Input value={this.state.partnerCode} onChange={(e) => { this.setState({ partnerCode: e.target.value }); }} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="统一社会信用码"
            hasFeedback
          >
            <Input placeholder="请填写18位统一社会信用代码" value={this.state.partnerUniqueCode} onChange={(e) => { this.setState({ partnerUniqueCode: e.target.value }); }} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="海关编码"
            hasFeedback
          >
            <Input placeholder="请填写10位海关编码" value={this.state.customsCode} onChange={(e) => { this.setState({ customsCode: e.target.value }); }} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="业务类型"
            hasFeedback
          >
            <CheckboxGroup options={BUSINESS_TYPES} value={businessArray}
              onChange={(value) => {
                if (value !== []) {
                  this.setState({ businessType: value.join(',') });
                }
              }}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="联系人"
            hasFeedback
          >
            <Input
              value={this.state.contact}
              onChange={(e) => { this.setState({ contact: e.target.value }); }}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="电话"
            hasFeedback
          >
            <Input
              type="tel"
              value={this.state.phone}
              onChange={(e) => { this.setState({ phone: e.target.value }); }}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="邮箱"
            hasFeedback
          >
            <Input type="email" value={this.state.email} onChange={(e) => { this.setState({ email: e.target.value }); }} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

