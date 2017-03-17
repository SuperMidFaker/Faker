import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { Breadcrumb, Button, Card, Col, Layout, Row, Input } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { changeDockStatus } from 'common/reducers/transportDispatch';
import StatsPanel from './panel/statsPanel';
import TodoPanel from './panel/todoPanel';
import PreviewPanel from '../shipment/modals/preview-panel';
import DispatchDock from '../dispatch/dispatchDock';
import SegmentDock from '../dispatch/segmentDock';
import { formatMsg } from './message.i18n';

const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    subdomain: state.account.subdomain,
    statistics: state.shipment.statistics,
  }),
  { changeDockStatus })
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'dashboard' })
export default class Dashboard extends React.Component {
  static propTypes = {
    subdomain: PropTypes.object.isRequired,
    changeDockStatus: PropTypes.func.isRequired,
  }
  state = {
    shipmtNo: '',
  }
  msg = formatMsg(this.props.intl)
  handleDispatchDockClose = () => {
    this.props.changeDockStatus({ dispDockShow: false, shipmts: [] });
  }
  handleSegmentDockClose = () => {
    this.props.changeDockStatus({ segDockShow: false, shipmts: [] });
  }
  handleQuery = () => {
    const subdomain = this.props.subdomain;
    window.open(`${window.location.origin}/pub/tracking?shipmtNo=${this.state.shipmtNo}&subdomain=${subdomain}`);
  }
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('dashboard')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button size="large" icon="global" />
          </div>
        </Header>
        <Content className="main-content" key="main">
          <Row gutter={16}>
            <Col sm={24} md={18}>
              <StatsPanel />
              <TodoPanel />
            </Col>
            <Col sm={24} md={6}>
              <Card title="更多应用" bodyStyle={{ minHeight: 400, textAlign: 'center' }} >
                <Row className="mdc-text-grey"><h3>微骆运输订单查询</h3></Row>
                <br />
                <Row><Input value={this.state.shipmtNo} onChange={e => this.setState({ shipmtNo: e.target.value })} placeholder="输入运单号或客户单号查询" /></Row>
                <br />
                <Row>
                  <Col span={12}><Button type="primary" onClick={this.handleQuery}>查询</Button></Col>
                  <Col span={12}><Button style={{ marginLeft: 20 }}>共享</Button></Col>
                </Row>
                <br />
                <Row style={{ borderTop: 'solid 1px #e9e9e9' }} />
                <br />
                <Row className="mdc-text-grey"><h3>微骆运输APP-司机版</h3></Row>
                <br />
                <Row className="mdc-text-grey">
                  <Col span={12}>
                    <img style={{ width: 50, height: 'auto', marginBottom: 20 }} role="presentation" src={`${__CDN__}/assets/img/apple.png`} />
                    <br />
                    <Button onClick={() => window.open('https://fir.im/welogixApp')}>直接下载</Button>
                  </Col>
                  <Col span={12}>
                    <img style={{ width: 50, height: 'auto', marginBottom: 20 }} role="presentation" src={`${__CDN__}/assets/img/android.png`} />
                    <br />
                    <Button onClick={() => window.open('https://fir.im/welogixios')}>直接下载</Button>
                  </Col>
                </Row>
                <br />
                <Row />
                <br />
                <Row style={{ borderTop: 'solid 1px #e9e9e9' }} />
                <br />
                <Row className="mdc-text-grey"><h3>微骆运输公众号</h3></Row>
                <br />
                <Row className="mdc-text-grey"><img style={{ width: 180, height: 'auto' }} role="presentation" src={`${__CDN__}/assets/img/apple-touch-icon-144x144-precomposed.png`} /></Row>
                <Row className="mdc-text-grey"><h5>直接扫描二维码</h5></Row>
                <br />
                <Row className="mdc-text-grey"><h5>在微信上开启应用</h5></Row>
              </Card>
            </Col>
          </Row>
        </Content>
        <PreviewPanel stage="todo" />
        <DispatchDock
          onClose={this.handleDispatchDockClose}
        />

        <SegmentDock
          onClose={this.handleSegmentDockClose}
        />
      </QueueAnim>
    );
  }
}
