import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Input, message, Select } from 'antd';
import { toggleNewFeeElementModal, addFeeElement, loadFeeElements } from 'common/reducers/bssSettings';
import { BSS_FEE_TYPE } from 'common/constants';
import { formatMsg } from '../message.i18n';


const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 },
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    elementModal: state.bssSettings.visibleNewElementModal,
  }),
  { toggleNewFeeElementModal, addFeeElement, loadFeeElements }
)
export default class NewFeeElementModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    feeGroups: PropTypes.array.isRequired,
  }
  state = {
    feeCode: '',
    feeName: '',
    feeType: '',
    feeGroup: '',
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleNewFeeElementModal(false);
  }
  handleOk = () => {
    const {
      feeCode, feeName, feeType, feeGroup,
    } = this.state;
    const { tenantId, loginId, elementModal } = this.props;
    this.props.addFeeElement({
      parent_fee_code: elementModal.parentFeeCode ? elementModal.parentFeeCode : null,
      fee_code: feeCode,
      fee_name: feeName,
      fee_type: feeType,
      fee_group: feeGroup,
      tenant_id: tenantId,
      created_by: loginId,
      last_updated_by: loginId,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.props.toggleNewFeeElementModal(false);
        this.props.loadFeeElements({ tenantId });
        this.setState({
          feeCode: '', feeName: '', feeType: '', feeGroup: '',
        });
      }
    });
  }

  render() {
    const { elementModal, feeGroups } = this.props;
    const {
      feeCode, feeName,
    } = this.state;
    const title = elementModal.parentFeeCode ? this.msg('newChildFeeElement') : this.msg('newFeeElement');
    return (
      <Modal
        maskClosable={false}
        title={title}
        visible={elementModal.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="费用元素代码" {...formItemLayout} >
            <Input onChange={e => this.setState({ feeCode: e.target.value })} value={feeCode} />
          </FormItem>
          <FormItem label="费用元素名称" {...formItemLayout}>
            <Input onChange={e => this.setState({ feeName: e.target.value })} value={feeName} />
          </FormItem>
          <FormItem label="费用类型" {...formItemLayout}>
            <Select showSearch onChange={val => this.setState({ feeType: val })} >
              {BSS_FEE_TYPE.map(type =>
                <Option key={type.key} value={type.key}>{`${type.key}|${type.text}`}</Option>)}
            </Select>
          </FormItem>
          <FormItem label="所属分组" {...formItemLayout}>
            <Select showSearch onChange={val => this.setState({ feeGroup: val })} >
              {feeGroups.map(data =>
                <Option key={data.key} value={data.key} search={`${data.search}`}>{`${data.key}|${data.text}`}</Option>)}
            </Select>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
