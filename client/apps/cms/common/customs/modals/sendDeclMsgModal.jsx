import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Radio, Select, message } from 'antd';
import { showSendDeclModal, getEasipassList, sendDecl, loadSendRecords } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { CMS_DECL_CHANNEL, CMS_IMPORT_DECL_TYPE, CMS_EXPORT_DECL_TYPE } from 'common/constants';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    subdomain: state.account.subdomain,
    visible: state.cmsDeclare.sendDeclModal.visible,
    defaultDecl: state.cmsDeclare.sendDeclModal.defaultDecl,
    ietype: state.cmsDeclare.sendDeclModal.ietype,
    preEntrySeqNo: state.cmsDeclare.sendDeclModal.preEntrySeqNo,
    delgNo: state.cmsDeclare.sendDeclModal.delgNo,
    agentCustCo: state.cmsDeclare.sendDeclModal.agentCustCo,
    loginName: state.account.username,
  }),
  { showSendDeclModal, getEasipassList, sendDecl, loadSendRecords }
)
@Form.create()
export default class SendDeclMsgModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    subdomain: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    preEntrySeqNo: PropTypes.string.isRequired,
    delgNo: PropTypes.string.isRequired,
    showSendDeclModal: PropTypes.func.isRequired,
    getEasipassList: PropTypes.func.isRequired,
    sendDecl: PropTypes.func.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    easipassList: [],
    quickpassList: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.props.getEasipassList(nextProps.tenantId, nextProps.agentCustCo).then((result) => {
        this.setState({ easipassList: result.data });
      });
    }
  }
  handleCancel = () => {
    this.props.showSendDeclModal({ visible: false });
  }
  handleOk = () => {
    const { delgNo, preEntrySeqNo, subdomain, loginName } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const uuid = values.easipass;
        const declType = values.declType;
        const channel = values.declChannel;
        this.props.sendDecl({ preEntrySeqNo, delgNo, subdomain, uuid, channel, declType, username: loginName }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.info('发送成功');
            this.props.showSendDeclModal({ visible: false });
            this.props.reload();
            this.props.loadSendRecords();
          }
        });
      }
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible, form: { getFieldDecorator, getFieldValue }, ietype, defaultDecl } = this.props;
    const { easipassList, quickpassList } = this.state;
    let declList = [];
    if (ietype === 'import') {
      declList = CMS_IMPORT_DECL_TYPE;
    } else if (ietype === 'export') {
      declList = CMS_EXPORT_DECL_TYPE;
    }
    return (
      <Modal maskClosable={false} title={this.msg('sendDeclMsg')} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form>
          <FormItem>
            {getFieldDecorator('declChannel', { initialValue: defaultDecl && defaultDecl.channel })(
              <RadioGroup>
                {Object.keys(CMS_DECL_CHANNEL).map((declChannel) => {
                  const channel = CMS_DECL_CHANNEL[declChannel];
                  return <RadioButton value={channel.value} key={channel.value} disabled={channel.disabled}>{channel.text}</RadioButton>;
                })}
              </RadioGroup>
            )}
          </FormItem>
          <FormItem label={this.msg('declType')}>
            {getFieldDecorator('declType', { initialValue: defaultDecl && defaultDecl.dectype, rules: [{ required: true, message: '请选择单证类型' }] })(
              <Select placeholder="请选择">
                {declList.map(item => (<Option key={item.value} value={item.value}>{item.text}</Option>))}
              </Select>
            )}
          </FormItem>
          {
            getFieldValue('declChannel') === CMS_DECL_CHANNEL.EP.value && <FormItem label={this.msg('easipassList')}>
              {getFieldDecorator('easipass', { initialValue: defaultDecl && defaultDecl.appuuid, rules: [{ required: true, message: '请选择EDI' }] })(
                <Select placeholder="请选择">
                  {easipassList.map(item => (<Option key={item.app_uuid} value={item.app_uuid}>{item.name}</Option>))}
                </Select>
            )}
            </FormItem>}
          {
            getFieldValue('declChannel') === CMS_DECL_CHANNEL.QP.value && <FormItem label={this.msg('quickpassList')}>
              {getFieldDecorator('quickpass', { initialValue: defaultDecl && defaultDecl.appuuid/* , rules: [{ required: true, message: '请选择QP' }] */ })(
                <Select placeholder="请选择">
                  {quickpassList.map(item => (<Option key={item.app_uuid} value={item.app_uuid}>{item.name}</Option>))}
                </Select>
            )}
            </FormItem>}
        </Form>
      </Modal>
    );
  }
}

