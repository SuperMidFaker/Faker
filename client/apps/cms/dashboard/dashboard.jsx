import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Col, Layout, Row } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';

import StatsCard from './card/statsCard';
import ClassificationStatsCard from './card/classificationStatsCard';
import TaxStatsCard from './card/taxStatsCard';
import { formatMsg } from './message.i18n';


const { Header, Content } = Layout;

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
}), )
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class CMSDashboard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('dashboard')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools" />
        </Header>
        <Content className="main-content" key="main">
          <Row gutter={16}>
            <Col sm={24} lg={24}>
              <StatsCard />
            </Col>
            <Col sm={24} lg={10}>
              <ClassificationStatsCard />
            </Col>
            <Col sm={24} lg={14}>
              <TaxStatsCard />
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
