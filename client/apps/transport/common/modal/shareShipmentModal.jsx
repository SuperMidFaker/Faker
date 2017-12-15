import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Modal, Input, message, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { sendTrackingDetailSMSMessage, toggleShareShipmentModal } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import qrcode from 'client/common/qrcode';
import { validatePhone } from 'common/validater';

const formatMsg = format(messages);

const InputGroup = Input.Group;

@injectIntl
@connect(
  state => ({
    subdomain: state.account.subdomain,
    visible: state.shipment.shareShipmentModal.visible,
  }),
  { sendTrackingDetailSMSMessage, toggleShareShipmentModal }
)
export default class ShareShipmentModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    subdomain: PropTypes.string.isRequired,
    sendTrackingDetailSMSMessage: PropTypes.func.isRequired,
    shipmt: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
    toggleShareShipmentModal: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      publicUrlPath: '',
      publicQRcodeUrl: '',
      publicUrl: '',
      tel: '',
      SMSSendLoding: false,
      publicUrlCopy: '',
    };
  }
  componentWillReceiveProps(nextProps) {
    const { shipmt, subdomain } = nextProps;
    const publicUrlPath = `/pub/tms/tracking/detail/${shipmt.shipmt_no}/${shipmt.publicUrlKey}`;
    const publicUrl = `https://${subdomain}.welogix.cn${publicUrlPath}`;
    const qr = qrcode.qrcode(6, 'M');
    qr.addData(publicUrl); // 解决中文乱码
    qr.make();
    const tag = qr.createImgTag(5, 10); // 获取base64编码图片字符串
    const base64 = tag.match(/src="([^"]*)"/)[1]; // 获取图片src数据
    // base64 = base64.replace(/^data:image\/\w+;base64,/, '');  // 获取base64编码
    // base64 = new Buffer(base64, 'base64');  // 新建base64图片缓存
    const publicQRcodeUrl = base64;
    this.setState({
      publicUrlPath,
      publicUrl,
      publicQRcodeUrl,
      tel: shipmt.consignee_mobile,
    });
    if (nextProps.visible && !this.props.visible) {
      document.addEventListener('copy', this.handlePublicUrlCopy);
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handlePublicUrlCopy = (ev) => {
    if (this.state.publicUrlCopy) {
      ev.preventDefault();
      ev.clipboardData.setData('text/plain', this.state.publicUrlCopy);
      message.info('复制成功', 3);
      this.state.publicUrlCopy = '';
    }
  }
  handleOk = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false });
    }, 3000);
    document.removeEventListener('copy', this.handlePublicUrlCopy);
  }
  handleCancel = () => {
    this.props.toggleShareShipmentModal(false);
    this.setState({ publicQRcodeUrl: '' });
    document.removeEventListener('copy', this.handlePublicUrlCopy);
  }
  handleNavigationTo = (to, query) => {
    this.context.router.push({ pathname: to, query });
  }
  handleCopyClick() {
    this.state.publicUrlCopy = this.state.publicUrl;
    document.execCommand('copy');
  }
  handleTelInput = (e) => {
    const value = e.target.value;
    this.setState({ tel: value });
  }
  handleSMSSend = () => {
    const { shipmt } = this.props;
    const shipmtNo = shipmt.shipmt_no;
    this.setState({ SMSSendLoding: true });
    validatePhone(
      this.state.tel, (err) => {
        if (err) {
          message.error('电话号码不正确');
          this.setState({ SMSSendLoding: false });
        } else {
          this.props.sendTrackingDetailSMSMessage({
            tel: this.state.tel,
            url: this.state.publicUrl,
            shipmtNo,
            lsp_name: shipmt.lsp_name,
          }).then((result) => {
            this.setState({ SMSSendLoding: false });
            if (result.error) {
              message.error(result.error, 3);
            } else {
              message.info('发送成功', 3);
            }
          });
        }
      },
      () => '电话号码不正确'
    );
  }
  render() {
    const { shipmt } = this.props;
    const shipmtNo = shipmt.shipmt_no;
    return (
      <Modal maskClosable={false} style={{ width: '680px' }} visible={this.props.visible}
        title={`分享运单 ${shipmtNo}`} onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={[
          <Button key="back" type="ghost" onClick={this.handleCancel}>关 闭</Button>,
        ]}
      >
        <div style={{ width: '250px', height: '250px', margin: '0 auto' }}>
          <a href={this.state.publicUrlPath} target="_blank" rel="noopener noreferrer">
            <img style={{ width: '100%', height: '100%' }} src={this.state.publicQRcodeUrl} alt="二维码加载中..." />
          </a>
        </div>
        <br />
        <div style={{ width: '90%', margin: '0 auto' }}>
          <InputGroup>
            <Col span="18">
              <Input placeholder="" value={this.state.publicUrl} />
            </Col>
            <Col span="6">
              <Button onClick={() => this.handleCopyClick()} icon="copy">复制链接</Button>
            </Col>
          </InputGroup>
          <br />
          <InputGroup>
            <Col span="18">
              <Input placeholder="填写手机号" value={this.state.tel} onChange={this.handleTelInput} />
            </Col>
            <Col span="6">
              <Button type="primary" icon="message" onClick={this.handleSMSSend} loading={this.state.SMSSendLoding}>
                发送短信
              </Button>
            </Col>
          </InputGroup>
        </div>
      </Modal>
    );
  }
}
