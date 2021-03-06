import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Alert, Modal, Form, Radio, Select, message } from 'antd';
import DescriptionList from 'client/components/DescriptionList';
import { showSendDeclModal, loadLatestSendRecord, getEasipassList, sendDecl } from 'common/reducers/cmsCustomsDeclare';
import { CMS_DECL_CHANNEL, CMS_IMPORT_DECL_TYPE, CMS_EXPORT_DECL_TYPE } from 'common/constants';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Description } = DescriptionList;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    subdomain: state.account.subdomain,
    visible: state.cmsCustomsDeclare.sendDeclModal.visible,
    defaultDecl: state.cmsCustomsDeclare.sendDeclModal.defaultDecl,
    ietype: state.cmsCustomsDeclare.sendDeclModal.ietype,
    preEntrySeqNo: state.cmsCustomsDeclare.sendDeclModal.preEntrySeqNo,
    delgNo: state.cmsCustomsDeclare.sendDeclModal.delgNo,
    agentCustCo: state.cmsCustomsDeclare.sendDeclModal.agentCustCo,
    loginName: state.account.username,
  }),
  {
    showSendDeclModal, loadLatestSendRecord, getEasipassList, sendDecl,
  }
)
@Form.create()
export default class SendDeclMsgModal extends React.Component {
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
    reload: PropTypes.func.isRequired,
  }
  state = {
    preSentRecord: {},
    easipassList: [],
    quickpassList: [],
    declChannel: '',
  }
  componentWillMount() {
    if (window.localStorage) {
      const declChannel = window.localStorage.getItem('decl-channel');
      this.setState({
        declChannel,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.props.getEasipassList(nextProps.tenantId, nextProps.agentCustCo).then((result) => {
        this.setState({ easipassList: result.data });
      });
      // 保证每次打开时发送记录更新
      this.props.loadLatestSendRecord(nextProps.preEntrySeqNo).then((result) => {
        this.setState({ preSentRecord: result.data.data[0] });
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.showSendDeclModal({ visible: false });
  }
  handleOk = () => {
    const {
      delgNo, preEntrySeqNo, subdomain, loginName,
    } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const uuid = values.easipass;
        const { declType } = values;
        const channel = values.declChannel;
        this.props.sendDecl({
          preEntrySeqNo, delgNo, subdomain, uuid, channel, declType, username: loginName,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.info('发送成功');
            this.props.showSendDeclModal({ visible: false });
            this.props.reload();
            // this.props.loadSendRecords();
          }
        });
      }
    });
  }
  render() {
    const {
      visible, form: { getFieldDecorator, getFieldValue }, ietype, defaultDecl,
    } = this.props;
    const {
      preSentRecord, easipassList, quickpassList,
    } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };
    let declList = [];
    if (ietype === 'import') {
      declList = CMS_IMPORT_DECL_TYPE;
    } else if (ietype === 'export') {
      declList = CMS_EXPORT_DECL_TYPE;
    }
    return (
      <Modal
        maskClosable={false}
        title={this.msg('sendDeclMsg')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form layout="horizontal">
          {preSentRecord &&
          <Alert message={<DescriptionList col={2}>
            <Description term="上次发送时间" key={preSentRecord.sent_date}>{moment(preSentRecord.sent_date).format('YY.MM.DD HH:mm')}</Description>
            <Description term="发送人" key={preSentRecord.sender_name}>{preSentRecord.sender_name}</Description>
          </DescriptionList>}
          />
          }
          <FormItem label={this.msg('declChannel')} {...formItemLayout}>
            {getFieldDecorator('declChannel', { initialValue: this.state.declChannel, rules: [{ required: true, message: '请选择申报通道' }] })(<RadioGroup onChange={this.handleChannelChange}>
              {Object.keys(CMS_DECL_CHANNEL).map((declChannel) => {
                  const channel = CMS_DECL_CHANNEL[declChannel];
                  return (<RadioButton
                    value={channel.value}
                    key={channel.value}
                    disabled={channel.disabled}
                  >
                    {channel.text}
                  </RadioButton>);
                })}
            </RadioGroup>)}
          </FormItem>
          <FormItem label={this.msg('declType')} {...formItemLayout}>
            {getFieldDecorator('declType', { initialValue: defaultDecl && defaultDecl.dectype, rules: [{ required: true, message: '请选择单证类型' }] })(<Select placeholder="请选择">
              {declList.map(item => (
                <Option key={item.value} value={item.value}>
                  {item.text}
                </Option>))}
            </Select>)}
          </FormItem>
          {
          getFieldValue('declChannel') === CMS_DECL_CHANNEL.EP.value &&
          <FormItem label={this.msg('easipassList')} {...formItemLayout}>
              {getFieldDecorator('easipass', { initialValue: defaultDecl && defaultDecl.appuuid, rules: [{ required: true, message: '请选择EDI' }] })(<Select placeholder="请选择">
                {easipassList.map(item => (
                  <Option key={item.app_uuid} value={item.app_uuid}>
                    {item.name}
                  </Option>))}
              </Select>)}
          </FormItem>}
          {
          getFieldValue('declChannel') === CMS_DECL_CHANNEL.QP.value &&
          <FormItem label={this.msg('quickpassList')} {...formItemLayout}>
              {getFieldDecorator('quickpass', { initialValue: defaultDecl && defaultDecl.appuuid/* , rules: [{ required: true, message: '请选择QP' }] */ })(<Select placeholder="请选择">
                {quickpassList.map(item => (
                  <Option key={item.app_uuid} value={item.app_uuid}>
                    {item.name}
                  </Option>))}
              </Select>)}
          </FormItem>}
        </Form>
      </Modal>
    );
  }
}

