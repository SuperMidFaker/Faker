import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { Modal, Form, message, Select, Alert, Col, Row } from 'antd';
import { closeAddSlaveModal, getSlaves, addSlaves } from 'common/reducers/scvClassification';
import { formatMsg } from '../message.i18n';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(state => ({
  loginId: state.account.loginId,
  visible: state.scvClassification.addSlaveModal.visible,
  tenantId: state.account.tenantId,
  slaveList: state.scvClassification.slaveList,
}),
  {
    closeAddSlaveModal,
    getSlaves,
    addSlaves,
  }
)
@Form.create()

export default class addSlaveModal extends React.Component {
  static PropTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    closeAddSlaveModal: PropTypes.func.isRequired,
    getSlaves: PropTypes.func.isRequired,
    addSlaves: PropTypes.func.isRequired,
  };
  componentWillMount() {
    this.props.getSlaves(this.props.tenantId, PARTNER_ROLES.SUP, PARTNER_BUSINESSE_TYPES.clearance);
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.closeAddSlaveModal();
  }
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const slaveList = this.props.slaveList;
        const formData = this.props.form.getFieldsValue();
        formData.tenant_id = this.props.tenantId;
        formData.login_id = this.props.loginId;
        for (let i = 0; i < slaveList.length; i++) {
          if (slaveList[i].partner_tenant_id === formData.partner_tenant_id) {
            formData.name = slaveList[i].name;
          }
        }
        this.props.addSlaves(formData).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.props.form.resetFields();
            this.props.closeAddSlaveModal();
            this.props.getSlaves(this.props.tenantId, PARTNER_ROLES.SUP, PARTNER_BUSINESSE_TYPES.clearance);
            this.props.reload();
          }
        });
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, visible } = this.props;
    return (
      <Modal maskClosable={false} title={this.msg('addSlave')} visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
        <Form>
          <FormItem label={this.msg('classifySourceRepo')} labelCol={{ xs: { span: 24 }, sm: { span: 6 } }} wrapperCol={{ xs: { span: 24 }, sm: { span: 14 } }}>
            {
              getFieldDecorator('partner_tenant_id', {
                rules: [
                  { required: true, message: this.msg('sourceRepoRequired') },
                ],
              })(<Select>
                {this.props.slaveList.map(item => (<Option value={item.partner_tenant_id} key={item.name}>{item.name}</Option>))}
              </Select>)
            }
          </FormItem>
        </Form>
        <Row>
          <Col span={20} offset={2}>
            <Alert message="如需添加新的服务商，请前往资源设置添加报关报检代理" type="info" showIcon />
          </Col>
        </Row>
      </Modal>
    );
  }
}
