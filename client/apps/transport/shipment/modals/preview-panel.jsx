import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Tabs, Tag, Modal, Input, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import DetailPane from './tabpanes/detail-pane';
import TrackingPane from './tabpanes/trackingPane';
import ChargePane from './tabpanes/chargePane';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_EFFECTIVES } from 'common/constants';
import { hidePreviewer } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import './preview-panel.less';
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
  }),
  { hidePreviewer }
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
    shipmt: PropTypes.object.isRequired,
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
    this.setState({
      trackingDetailModalVisible: true,
      publickUrlPath,
      publickUrl: `https://wx.welogix.cn${publickUrlPath}`,
      publicQRcodeUrl: `http://qr.topscan.com/api.php?bg=ffffff&fg=000000&el=h&w=700&m=20&text=https://wx.welogix.cn${publickUrlPath}`
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
              <img style={{width: '100%', height: '100%'}} src={this.state.publicQRcodeUrl} alt="二维码加载中..."/>
            </div>
            <br/>
            <div style={{width: '90%', margin: '0 auto'}}>
              <InputGroup className="ant-search-input ant-search-input-focus">
                <Input placeholder="" value={this.state.publickUrl}/>
                <div className="ant-input-group-wrap">
                  <Button className="ant-search-btn ant-search-btn-noempty" onClick={() => this.handleCopyClick()}><Icon type="copy" />复制</Button>
                </div>
              </InputGroup>
              <p><a href={this.state.publickUrlPath} target="_blank">访问</a></p>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}
