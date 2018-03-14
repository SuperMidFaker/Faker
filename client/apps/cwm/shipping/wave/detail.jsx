import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Layout, Tabs, Button, Card, Col, Row, Icon } from 'antd';
import { loadReceiveModal } from 'common/reducers/cwmReceive';
import { releaseWave, loadWaveHead } from 'common/reducers/cwmShippingOrder';
import { format } from 'client/common/i18n/helpers';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import InfoItem from 'client/components/InfoItem';
import OrderListPane from './tabpane/orderListPane';
import OrderDetailsPane from './tabpane/orderDetailsPane';
import messages from '../message.i18n';


const formatMsg = format(messages);
const { Content } = Layout;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
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
  state = {
    fullscreen: true,
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
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  handleRelease = () => {
    this.props.releaseWave(this.props.params.waveNo);
  }
  render() {
    const { defaultWhse, waveHead } = this.props;
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            defaultWhse.name,
            this.msg('shippingWave'),
            this.props.params.waveNo,
          ]}
        >
          <PageHeader.Actions>
            <Button onClick={this.handleRelease}>释放</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Card bodyStyle={{ padding: 16 }} >
            <Row gutter={16} className="info-group-underline">
              <Col sm={24} lg={6}>
                <InfoItem label="波次号" field={this.props.params.waveNo} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="总订单数" field={waveHead.orderCount} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="总订单明细数" field={waveHead.detailCount} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem
                  label="创建时间"
                  addonBefore={<Icon type="clock-circle-o" />}
                  field={waveHead.created_date && moment(waveHead.created_date).format('YYYY.MM.DD HH:mm')}
                />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem
                  label="出库时间"
                  addonBefore={<Icon type="clock-circle-o" />}
                  field={waveHead.completed_date && moment(waveHead.completed_date).format('YYYY.MM.DD HH:mm')}
                />
              </Col>
            </Row>
          </Card>
          <MagicCard bodyStyle={{ padding: 0 }} onSizeChange={this.toggleFullscreen}>
            <Tabs defaultActiveKey="orderDetails">
              <TabPane tab="发货明细" key="orderDetails">
                <OrderDetailsPane
                  waveNo={this.props.params.waveNo}
                  fullscreen={this.state.fullscreen}
                />
              </TabPane>
              <TabPane tab="订单列表" key="orderList">
                <OrderListPane
                  waveNo={this.props.params.waveNo}
                  fullscreen={this.state.fullscreen}
                />
              </TabPane>
            </Tabs>
          </MagicCard>
        </Content>
      </Layout>
    );
  }
}
