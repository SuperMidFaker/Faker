import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { Breadcrumb, Col, Layout, Row } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { changeDockStatus } from 'common/reducers/transportDispatch';
import ButtonToggle from 'client/components/ButtonToggle';
import ShipmentAdvanceModal from 'client/apps/transport/tracking/land/modals/shipment-advance-modal';
import CreateSpecialCharge from 'client/apps/transport/tracking/land/modals/create-specialCharge';
import { ShipmentDock, DelegationDock, FreightDock } from 'client/components/Dock';
import StatsPanel from './panel/statsPanel';
import TodoPanel from './panel/todoPanel';
import MoreApplications from './panel/moreApplications';
import DispatchDock from '../dispatch/dispatchDock';
import SegmentDock from '../dispatch/segmentDock';
import { formatMsg } from './message.i18n';


const { Header, Content, Sider } = Layout;

@injectIntl
@connect(
  () => ({
  }),
  { changeDockStatus }
)
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'dashboard' })
export default class Dashboard extends React.Component {
  static propTypes = {
    changeDockStatus: PropTypes.func.isRequired,
  }
  state = {
    collapsed: true,
  }
  msg = formatMsg(this.props.intl)
  handleDispatchDockClose = () => {
    this.props.changeDockStatus({ dispDockShow: false, shipmts: [] });
  }
  handleSegmentDockClose = () => {
    this.props.changeDockStatus({ segDockShow: false, shipmts: [] });
  }
  toggle = () => {
    this.setState({ collapsed: !this.state.collapsed });
  }
  render() {
    const { collapsed } = this.state;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Layout>
          <Layout>
            <Header className="page-header">
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('dashboard')}
                </Breadcrumb.Item>
              </Breadcrumb>
              <div className="page-header-tools" style={{ marginRight: collapsed ? 0 : 330 }}>
                <ButtonToggle
                  iconOn="menu-unfold"
                  iconOff="menu-fold"
                  onClick={this.toggle}
                />
              </div>
            </Header>
            <Content className="main-content" key="main">
              <Row gutter={16}>
                <Col sm={24} md={24}>
                  <StatsPanel />
                  <TodoPanel />
                </Col>
              </Row>
            </Content>
            <ShipmentDock />
            <FreightDock />
            <DelegationDock />
            <DispatchDock
              onClose={this.handleDispatchDockClose}
            />
            <SegmentDock
              onClose={this.handleSegmentDockClose}
            />
            <ShipmentAdvanceModal />
            <CreateSpecialCharge />
          </Layout>
          <Sider
            width={320}
            className="menu-sider"
            key="sider"
            trigger={null}
            collapsible
            collapsed={collapsed}
            collapsedWidth={0}
          >
            <MoreApplications />
          </Sider>
        </Layout>
      </QueueAnim>
    );
  }
}
