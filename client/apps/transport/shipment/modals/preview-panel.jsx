import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Tabs, Tag, Modal, Input, message, Col, Menu, Dropdown } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DetailPane from './tabpanes/detail-pane';
import TrackingPane from './tabpanes/trackingPane';
import ChargePane from './tabpanes/chargePane';
import PodPane from './tabpanes/podPane';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_EFFECTIVES, SHIPMENT_POD_STATUS } from 'common/constants';
import { hidePreviewer, sendTrackingDetailSMSMessage } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import './preview-panel.less';
import qrcode from 'client/common/qrcode';
import { validatePhone } from 'common/validater';
const formatMsg = format(messages);
const TabPane = Tabs.TabPane;
const InputGroup = Input.Group;
const DropdownButton = Dropdown.Button;

const menu = (
  <Menu>
    <Menu.Item key="terminate"><span className="mdc-text-red"><Icon type="delete" /> 终止运单</span></Menu.Item>
  </Menu>
);

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
    tenantId: state.account.tenantId,
    visible: state.shipment.previewer.visible,
    tabKey: state.shipment.previewer.tabKey,
    shipmtNo: state.shipment.previewer.shipmt.shipmt_no,
    status: state.shipment.previewer.shipmt.status,
    effective: state.shipment.previewer.shipmt.effective,
    shipmt: state.shipment.previewer.shipmt,
    previewer: state.shipment.previewer,
  }),
  { hidePreviewer, sendTrackingDetailSMSMessage }
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    tabKey: PropTypes.string,
    shipmtNo: PropTypes.string,
    status: PropTypes.number,
    effective: PropTypes.number,
    hidePreviewer: PropTypes.func.isRequired,
    sendTrackingDetailSMSMessage: PropTypes.func.isRequired,
    shipmt: PropTypes.object.isRequired,
    previewer: PropTypes.object.isRequired,
    stage: PropTypes.oneOf(['acceptance', 'dispatch', 'transit', 'pod', 'exception']),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      tabKey: props.tabKey || 'detail',
      trackingDetailModalVisible: false,
      publicUrlPath: '',
      publicQRcodeUrl: '',
      publicUrl: '',
      tel: '',
      SMSSendLoding: false,
    };
  }
  componentDidMount() {
    window.$(document).click((event) => {
      const previewerClicked = window.$(event.target).closest('#preview-panel').length > 0;
      if (!previewerClicked) {
        this.handleClose();
      }
    });
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
    const publicUrlPath = `/pub/tms/tracking/detail/${shipmtNo}/${shipmt.publicUrlKey}`;
    const publicUrl = `https://wx.welogix.cn${publicUrlPath}`;
    const qr = qrcode.qrcode(6, 'M');
    qr.addData(publicUrl);  // 解决中文乱码
    qr.make();
    const tag = qr.createImgTag(5, 10);  // 获取base64编码图片字符串
    const base64 = tag.match(/src="([^"]*)"/)[1];  // 获取图片src数据
    // base64 = base64.replace(/^data:image\/\w+;base64,/, '');  // 获取base64编码
    // base64 = new Buffer(base64, 'base64');  // 新建base64图片缓存
    const publicQRcodeUrl = base64;
    this.setState({
      trackingDetailModalVisible: true,
      publicUrlPath,
      publicUrl,
      publicQRcodeUrl,
      tel: shipmt.consignee_mobile,
    });
    document.addEventListener('copy', ev => {
      ev.preventDefault();
      ev.clipboardData.setData('text/plain', this.state.publicUrl);
      message.info('复制成功', 3);
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
  }
  handleTelInput = (e) => {
    const value = e.target.value;
    this.setState({ tel: value });
  }
  handleSMSSend = () => {
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
            shipmtNo: this.props.shipmtNo,
            lsp_name: this.props.previewer.shipmt.lsp_name,
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
      () => { return '电话号码不正确'; }
    );
  }
  renderTabs() {
    const shipmt = this.props.previewer.shipmt;
    if (shipmt.status >= SHIPMENT_TRACK_STATUS.podsubmit) {
      return (
        <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
          <TabPane tab={this.msg('shipmtDetail')} key="detail">
            <DetailPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtCharge')} key="charge">
            <ChargePane />
          </TabPane>
          <TabPane tab={this.msg('trackPod')} key="pod">
            <PodPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtLogs')} key="events">
            <TrackingPane />
          </TabPane>
        </Tabs>
      );
    } else {
      return (
        <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
          <TabPane tab={this.msg('shipmtDetail')} key="detail">
            <DetailPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtCharge')} key="charge">
            <ChargePane />
          </TabPane>
          <TabPane tab={this.msg('shipmtEvents')} key="events">
            <TrackingPane />
          </TabPane>
        </Tabs>
      );
    }
  }
  renderButtons() {
    const { tenantId, status, stage, previewer: { dispatch, tracking } } = this.props;
    if (stage === 'acceptance') {
      if (status === SHIPMENT_TRACK_STATUS.unaccepted) {
        return (
          <div>
            <Button type="primary" >
              接单
            </Button>
          </div>
        );
      } else if (status !== SHIPMENT_TRACK_STATUS.unaccepted) {
        return (
          <div>
            <Button type="default" >
              退回
            </Button>
          </div>
        );
      }
    } else if (stage === 'dispatch') {
      if (dispatch.child_send_status === 0 && dispatch.status === 2 && dispatch.disp_status === 1 && dispatch.sp_tenant_id === tenantId) {
        return (
          <div>
            <Button type="primary" >
              分配
            </Button>
            <Button type="default" >
              分段
            </Button>
          </div>
        );
      } else if (dispatch.disp_status === 0 && dispatch.sr_tenant_id === tenantId) {
        return (
          <div>
            <Button type="primary" >
              发送
            </Button>
            <Button type="default" >
              退回
            </Button>
          </div>
        );
      } else if (dispatch.disp_status > 0 && dispatch.sr_tenant_id === tenantId) {
        if (tracking.downstream_status === 1) {
          return (
            <div>
              <Button type="primary" >
                导出 PDF
              </Button>
              <Button type="default" >
                撤回
              </Button>
            </div>
          );
        } else {
          return (
            <div>
              <Button type="primary" >
                导出 PDF
              </Button>
            </div>
          );
        }
      }
    } else if (stage === 'transit') {
      if (status === SHIPMENT_TRACK_STATUS.unaccepted) {
        return (
          <div>
            <Button type="default" >
              催促接单
            </Button>
          </div>
        );
      } else if (status === SHIPMENT_TRACK_STATUS.undispatched) {
        return (
          <div>
            <Button type="default" >
              催促调度
            </Button>
          </div>
        );
      } else if (status === SHIPMENT_TRACK_STATUS.undelivered) {
        return (
          <div>
            <Button type="primary" >
              更新提货
            </Button>
            <Button type="default" >
              催促提货
            </Button>
          </div>
        );
      } else if (status === SHIPMENT_TRACK_STATUS.intransit) {
        return (
          <div>
            <Button type="primary" >
              更新交货
            </Button>
            <Button type="default" >
              上报位置
            </Button>
          </div>
        );
      } else if (status === SHIPMENT_TRACK_STATUS.delivered) {
        return (
          <div>
            <Button type="primary" >
              上传回单
            </Button>
            <Button type="default" >
              催促回单
            </Button>
          </div>
        );
      }
    } else if (stage === 'pod') {
      if (dispatch.pod_status === SHIPMENT_POD_STATUS.pending || dispatch.pod_status === SHIPMENT_POD_STATUS.rejectByUs) {
        return (
          <div>
            <Button type="primary" >
              接受
            </Button>
            <Button type="default" >
              拒绝
            </Button>
          </div>
        );
      } else if (dispatch.pod_status === SHIPMENT_POD_STATUS.acceptByUs || dispatch.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
        return (<div></div>);
      } else if (dispatch.pod_status === SHIPMENT_POD_STATUS.acceptByClient) {
        return (<div></div>);
      }
    } else if (stage === 'exception') {
      return (<div></div>);
    }
    return (<div></div>);
  }
  render() {
    const { visible, shipmtNo, status, effective } = this.props;
    return (
      <div className={`preview-panel ${visible ? 'inside' : ''}`} id="preview-panel">
        <div className="panel-content">
          <div className="header">
            <span className="title">{shipmtNo}</span>
            <Tag color="blue">{this.msg(getTrackStatusMsg(status, effective))}</Tag>
            <div className="pull-right">
              <Button type="ghost" shape="circle-outline" onClick={this.handleClose}>
                <Icon type="cross" />
              </Button>
            </div>
          </div>
          <div className="body">
            {this.renderTabs()}
          </div>
          <div className="footer">
            <div className="more-actions">
              <DropdownButton size="large" overlay={menu} onClick={this.showTrackingDetailModal}>
                <Icon type="share-alt" />共享运单
              </DropdownButton>
            </div>
          </div>
        </div>
        <div>
          <Modal ref="modal" style={{ width: '680px' }}
            visible={this.state.trackingDetailModalVisible}
            title={`${shipmtNo} 分享运单`} onOk={this.handleTrackingDetailOk} onCancel={this.handleTrackingDetailCancel}
            footer={[
              <Button key="back" type="ghost" size="large" onClick={this.handleTrackingDetailCancel}>关 闭</Button>,
            ]}
          >
            <div style={{ width: '250px', height: '250px', margin: '0 auto' }}>
              <a href={this.state.publicUrlPath} target="_blank">
                <img style={{ width: '100%', height: '100%' }} src={this.state.publicQRcodeUrl} alt="二维码加载中..." />
              </a>
            </div>
            <br />
            <div style={{ width: '90%', margin: '0 auto' }}>
              <InputGroup>
                <Col span="18">
                <Input placeholder="" defaultValue={this.state.publicUrl} />
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
        </div>
      </div>
    );
  }
}
