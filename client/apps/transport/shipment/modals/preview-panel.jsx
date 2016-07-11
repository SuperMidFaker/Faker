import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Tabs, Tag, Modal, Input, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import DetailPane from './tabpanes/detail-pane';
import TrackingPane from './tabpanes/trackingPane';
import ChargePane from './tabpanes/chargePane';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_EFFECTIVES } from 'common/constants';
import { hidePreviewer, sendTrackingDetailSMSMessage } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import './preview-panel.less';
import qrcode from '../../../../../server/util/qrcode';
import { validatePhone } from 'common/validater';
const formatMsg = format(messages);
const TabPane = Tabs.TabPane;
const InputGroup = Input.Group;

function getTrackStatusMsg(status, eff) {
  let msg = 'trackDraft';
  if (eff === SHIPMENT_EFFECTIVES.cancelled) {
    msg = 'trackNullified';
  } else if (status === SHIPMENT_TRACK_STATUS.unaccepted) {
    msg = 'trackUnaccept';
  } else if (status === SHIPMENT_TRACK_STATUS.undispatched) {
    msg = 'trackUndispatched';
  } else if (status === SHIPMENT_TRACK_STATUS.undelivered) {
    msg = 'trackUndelivered';
  } else if (status === SHIPMENT_TRACK_STATUS.intransit) {
    msg = 'trackIntransit';
  } else if (status === SHIPMENT_TRACK_STATUS.delivered) {
    msg = 'trackDelivered';
  } else if (status > SHIPMENT_TRACK_STATUS.delivered) {
    msg = 'trackPod';
  }
  return msg;
}
@injectIntl
@connect(
  state => ({
    visible: state.shipment.previewer.visible,
    tabKey: state.shipment.previewer.tabKey,
    shipmtNo: state.shipment.previewer.shipmt.shipmt_no,
    status: state.shipment.previewer.shipmt.status,
    effective: state.shipment.previewer.shipmt.effective,
    shipmt: state.shipment.previewer.shipmt,
    previewer: state.shipment.previewer
  }),
  { hidePreviewer, sendTrackingDetailSMSMessage }
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    tabKey: PropTypes.string,
    shipmtNo: PropTypes.string,
    status: PropTypes.number,
    effective: PropTypes.number,
    hidePreviewer: PropTypes.func.isRequired,
    sendTrackingDetailSMSMessage: PropTypes.func.isRequired,
    shipmt: PropTypes.object.isRequired,
    previewer: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {
      tabKey: props.tabKey || 'detail',
      trackingDetailModalVisible: false,
      publickUrlPath: '',
      publicQRcodeUrl: '',
      publickUrl: '',
      tel: '',
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tabKey !== this.state.tabKey) {
      this.setState({ tabKey: nextProps.tabKey || 'detail' });
    }
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  handleClose = () => {
    this.props.hidePreviewer();
  }
  showTrackingDetailModal = () => {
    const { shipmtNo, shipmt } = this.props;
    const publickUrlPath = `/pub/tms/tracking/detail/${shipmtNo}/${shipmt.publicUrlKey}`;
    const publickUrl = `https://wx.welogix.cn${publickUrlPath}`;
    const qr = qrcode.qrcode(6, 'M');
    qr.addData(publickUrl);  // 解决中文乱码
    qr.make();
    const tag = qr.createImgTag(5, 10);  // 获取base64编码图片字符串
    const base64 = tag.match(/src="([^"]*)"/)[1];  // 获取图片src数据
    // base64 = base64.replace(/^data:image\/\w+;base64,/, '');  // 获取base64编码
    // base64 = new Buffer(base64, 'base64');  // 新建base64图片缓存
    const publicQRcodeUrl = base64;
    this.setState({
      trackingDetailModalVisible: true,
      publickUrlPath,
      publickUrl,
      publicQRcodeUrl
    });
    document.addEventListener('copy', (e) => {
      e.clipboardData.setData('text/plain', this.state.publickUrl);
      e.preventDefault();
    });
  }
  handleTrackingDetailOk = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false, trackingDetailModalVisible: false });
    }, 3000);
  }
  handleTrackingDetailCancel = () => {
    this.setState({ trackingDetailModalVisible: false, publicQRcodeUrl: '' });
  }
  handleNavigationTo = (to, query) => {
    this.context.router.push({ pathname: to, query });
  }
  handleCopyClick() {
    document.execCommand('copy');
    message.info('复制成功', 3);
  }
  handleTelInput = (e) => {
    const value = e.target.value;
    this.setState({tel: value});
  }
  handleSMSSend = () => {
    validatePhone(
      this.state.tel, (err) => {
        if (err) {
          message.error('电话号码不正确');
        } else {
          this.props.sendTrackingDetailSMSMessage({
            tel: this.state.tel,
            url: this.state.publickUrl,
            shipmtNo: this.props.shipmtNo,
            lsp_name: this.props.previewer.shipmt.lsp_name,
          }).then((result) => {
            if (result.error) {
              message.error(result.error, 3);
            } else {
              message.info('发送成功', 3);
            }
          });
        }
      },
      () => { return '电话号码不正确';}
    );
  }
  render() {
    const { visible, shipmtNo, status, effective } = this.props;
    return (
      <div className={`preview-panel ${visible ? 'inside' : ''}`}>
        <div className="panel-content">
          <div className="header">
            <span className="title">{shipmtNo}</span>
            <Tag color="blue">{this.msg(getTrackStatusMsg(status, effective))}</Tag>
            <div className="pull-right">
              <Button type="primary" shape="circle-outline" style={{marginRight: '10px'}} onClick={this.showTrackingDetailModal}>
                <Icon type="share-alt" />
              </Button>
              <Button type="ghost" shape="circle-outline" onClick={this.handleClose}>
                <Icon type="cross" />
              </Button>
            </div>
          </div>
          <div className="body">
            <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
              <TabPane tab={this.msg('shipmtDetail')} key="detail">
                <DetailPane />
              </TabPane>
              <TabPane tab={this.msg('shipmtTracking')} key="tracking">
                <TrackingPane />
              </TabPane>
              <TabPane tab={this.msg('shipmtCharge')} key="charge">
                <ChargePane />
              </TabPane>
            </Tabs>
          </div>
        </div>
        <div>
          <Modal ref="modal" style={{width: '680px'}}
            visible={this.state.trackingDetailModalVisible}
            title={`${shipmtNo} 分享详情`} onOk={this.handleTrackingDetailOk} onCancel={this.handleTrackingDetailCancel}
            footer={[
              <Button key="back" type="ghost" size="large" onClick={this.handleTrackingDetailCancel}>关 闭</Button>
            ]}
          >
            <div style={{width: '250px', height: '250px', margin: '0 auto'}}>
              <a href={this.state.publickUrlPath} target="_blank">
                <img style={{width: '100%', height: '100%'}} src={this.state.publicQRcodeUrl} alt="二维码加载中..."/>
              </a>
            </div>
            <br/>
            <div style={{width: '90%', margin: '0 auto'}}>
              <InputGroup className="ant-search-input ant-search-input-focus">
                <Input placeholder="" defaultValue={this.state.publickUrl}/>
                <div className="ant-input-group-wrap">
                  <Button className="ant-search-btn ant-search-btn-noempty" onClick={() => this.handleCopyClick()}><Icon type="copy" />复制</Button>
                </div>
              </InputGroup>
              <br/>
              <InputGroup className="ant-search-input ant-search-input-focus" help="123">
                <Input placeholder="发送短信给客户" value={this.state.tel} onChange={this.handleTelInput}/>
                <div className="ant-input-group-wrap">
                  <Button className="ant-search-btn ant-search-btn-noempty" onClick={this.handleSMSSend}><Icon type="message" />发送</Button>
                </div>
              </InputGroup>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}
