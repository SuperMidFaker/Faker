import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Radio, Form, Select, message } from 'antd';
import { showSendDeclModal, getEasipassList, sendDecl } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    subdomain: state.account.subdomain,
    visible: state.cmsDeclare.sendDeclModal.visible,
    preEntrySeqNo: state.cmsDeclare.sendDeclModal.preEntrySeqNo,
    delgNo: state.cmsDeclare.sendDeclModal.delgNo,
  }),
  { showSendDeclModal, getEasipassList, sendDecl }
)
@Form.create()
export default class SendModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    subdomain: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    preEntrySeqNo: PropTypes.string.isRequired,
    delgNo: PropTypes.string.isRequired,
    showSendDeclModal: PropTypes.func.isRequired,
    getEasipassList: PropTypes.func.isRequired,
    sendDecl: PropTypes.func.isRequired,
  }
  state = {
    easipassList: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible === true) {
      this.props.getEasipassList(this.props.tenantId).then((result) => {
        this.setState({ easipassList: result.data });
      });
    }
  }
  handleCancel = () => {
    this.props.showSendDeclModal({ visible: false });
  }
  handleOk = () => {
    const { delgNo, preEntrySeqNo, subdomain } = this.props;
    const { easipassList } = this.state;
    const formData = this.props.form.getFieldsValue();
    if (formData.decType === undefined) {
      message.error('请选择单证类型');
    } else if (formData.easipass === undefined) {
      message.error('请选择EDI');
    } else {
      const easipass = easipassList.find(item => item.app_uuid === formData.easipass);
      const uuid = easipass ? easipass.app_uuid : '';
      this.props.sendDecl({ preEntrySeqNo, delgNo, subdomain, uuid }).then(() => {
        this.props.showSendDeclModal({ visible: false });
        message.info('发送成功');
      });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    const { easipassList } = this.state;
    return (
      <Modal title="465" visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="单证类型">
            {getFieldDecorator('decType')(
              <RadioGroup>
                <Radio value={1}>通关无纸</Radio>
                <Radio value={2}>有纸</Radio>
                <Radio value={3}>无纸</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem label="EDI列表">
            {getFieldDecorator('easipass')(
              <Select placeholder="请选择">
                {easipassList.map(item => (<Option key={item.app_uuid} value={item.app_uuid}>{item.name}</Option>))}
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

