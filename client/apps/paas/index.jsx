import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import ChartCard from 'client/components/ChartCard';
import HubSiderMenu from './menu';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    visible: state.bssExRateSettings.visibleExRateModal,
  }),
  {
  }
)
export default class Index extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  render() {
    return (
      <Layout>
        <HubSiderMenu currentKey="home" />
        <Layout>
          <PageHeader title={this.msg('home')} />
          <Content className="page-content">
            <Card
              title={this.msg('paasStats')}
              bodyStyle={{ padding: 0 }}
            >
              <ChartCard
                title={this.msg('bizFlow')}
                total={0}
                style={{ width: '20%' }}
                link="/paas/flow"
                grid
                onClick={() => this.handleLinkClick('totalOrders')}
              />
              <ChartCard
                title={this.msg('installedPlugins')}
                total={0}
                style={{ width: '20%' }}
                link="/scof/shipments?from=dashboard"
                grid
                onClick={() => this.handleLinkClick('pending')}
              />
              <ChartCard
                title={this.msg('devApps')}
                total={0}
                style={{ width: '20%' }}
                link="/scof/shipments?from=dashboard"
                grid
                onClick={() => this.handleLinkClick('processing')}
              />
              <ChartCard
                title={this.msg('customizeBizObject')}
                total={0}
                style={{ width: '20%' }}
                type="error"
                link="/scof/shipments?from=dashboard"
                grid
                onClick={() => this.handleLinkClick('urgent')}
              />
              <ChartCard
                title={this.msg('templates')}
                total={0}
                style={{ width: '20%' }}
                type="success"
                link="/scof/shipments?from=dashboard"
                grid
                onClick={() => this.handleLinkClick('completed')}
              />
            </Card>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
