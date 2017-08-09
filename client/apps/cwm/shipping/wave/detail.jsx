import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Layout, Tabs, Button, Card, Col, Row } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import OrderListPane from './tabpane/orderListPane';
import OrderDetailsPane from './tabpane/orderDetailsPane';
import { loadReceiveModal } from 'common/reducers/cwmReceive';
import { releaseWave, loadWaveHead } from 'common/reducers/cwmShippingOrder';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    defaultWhse: state.cwmContext.defaultWhse,
    waveHead: state.cwmShippingOrder.waveHead,
    reload: state.cwmShippingOrder.waveReload,
  }),
  { loadReceiveModal, loadWaveHead, releaseWave }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class WaveDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.props.loadWaveHead(this.props.params.waveNo);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadWaveHead(this.props.params.waveNo);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleRelease = () => {
    this.props.releaseWave(this.props.params.waveNo);
  }
  render() {
    const { defaultWhse, waveHead } = this.props;
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {defaultWhse.name}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('shippingWave')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.props.params.waveNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button size="large" onClick={this.handleRelease}>释放</Button>
          </div>
        </Header>
        <Content className="main-content">
          <Card>
            <Row className="info-group-inline">
              <Col sm={24} lg={6}>
                <InfoItem label="波次号" field={this.props.params.waveNo} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem label="总订单数" field={waveHead.orderCount} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem label="总订单明细数" field={waveHead.detailCount} />
              </Col>
            </Row>
          </Card>
          <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 0 }}>
            <Tabs defaultActiveKey="orderList">
              <TabPane tab="订单列表" key="orderList">
                <OrderListPane waveNo={this.props.params.waveNo} />
              </TabPane>
              <TabPane tab="订单明细" key="orderDetails">
                <OrderDetailsPane waveNo={this.props.params.waveNo} />
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </div>
    );
  }
}
