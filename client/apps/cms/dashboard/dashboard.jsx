import React from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Col, Layout, Row } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import StatsCard from './card/statsCard';
import ImportStatsCard from './card/importStatsCard';
import ExportStatsCard from './card/exportStatsCard';
import ClassificationStatsCard from './card/classificationStatsCard';
import TaxStatsCard from './card/taxStatsCard';
import { formatMsg } from './message.i18n';


const { Content } = Layout;

@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class CMSDashboard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader title={this.msg('dashboard')} />
        <Content className="page-content" key="main">
          <Row gutter={16}>
            <Col sm={24} lg={24}>
              <StatsCard />
            </Col>
            <Col sm={24} lg={12}>
              <ImportStatsCard />
            </Col>
            <Col sm={24} lg={12}>
              <ExportStatsCard />
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
