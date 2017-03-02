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
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const uuid = values.easipass;
        const paperOpt = values.decType;
        this.props.sendDecl({ preEntrySeqNo, delgNo, subdomain, uuid, paperOpt }).then((result) => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            message.info('发送成功');
            this.props.showSendDeclModal({ visible: false });
          }
        });
      }
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    const { easipassList } = this.state;
    return (
      <Modal title="发送报关单" visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="单证类型">
            {getFieldDecorator('decType', { rules: [{ required: true, message: '请选择单证类型' }] })(
              <RadioGroup>
                <Radio value="ciqnopaper">通关无纸</Radio>
                <Radio value="paper">有纸</Radio>
                <Radio value="nopaper">无纸</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem label="EDI列表">
            {getFieldDecorator('easipass', { rules: [{ required: true, message: '请选择EDI' }] })(
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

