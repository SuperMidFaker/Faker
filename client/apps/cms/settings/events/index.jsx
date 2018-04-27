import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Card, List, Layout, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CMS_EVENTS } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import { toggleEventsModal } from 'common/reducers/cmsEvents';
import withPrivilege from 'client/common/decorators/withPrivilege';
import PageHeader from 'client/components/PageHeader';
import SettingMenu from '../menu';
import EventsModal from './modal/eventsModal';
import { formatMsg } from '../message.i18n';

const { Sider, Content } = Layout;
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { toggleEventsModal }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'setting', action: 'edit' })
export default class Events extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillMount() {
  }
  handleClick = (key) => {
    this.props.toggleEventsModal(true, key);
  }
  msg = formatMsg(this.props.intl)
  render() {
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('events')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <SettingMenu currentKey="events" />
          </div>
        </Sider>
        <Layout>
          <PageHeader title={this.msg('events')} />
          <Content className="page-content layout-fixed-width">
            <Card bodyStyle={{ padding: 0 }} style={{ marginBottom: 0 }} >
              <List
                dataSource={CMS_EVENTS}
                renderItem={event => (
                  <List.Item
                    key={event.key}
                    actions={[<Icon onClick={() => this.handleClick(event.key)} type="pay-circle-o" />]}
                  >
                    <List.Item.Meta
                      title={event.text}
                      description={event.desc}
                    />
                  </List.Item>
                  )}
              />
            </Card>
            <EventsModal />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
