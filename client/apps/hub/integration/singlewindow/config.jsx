import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Card, Collapse, Breadcrumb, Icon, Layout, Tag } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadSingleWindowApp, updateSingleWindowApp } from 'common/reducers/openIntegration';
import PageHeader from 'client/components/PageHeader';
import ProfileForm from '../common/profileForm';
import ParamsForm from './forms/paramsForm';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;
const { Panel } = Collapse;

function fetchData({ dispatch, params }) {
  return dispatch(loadSingleWindowApp(params.uuid));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    app: state.openIntegration.currentApp,
    singlewindow: state.openIntegration.singlewindowApp,
  }),
  { loadSingleWindowApp, updateSingleWindowApp }
)
export default class ConfigQuickPass extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl);
  handleClose = () => {
    this.context.router.goBack();
  }
  renderStatusTag(enabled) {
    return enabled ? <Tag color="green">{this.msg('appEnabled')}</Tag> : <Tag>{this.msg('appDisabled')}</Tag>;
  }
  render() {
    const { singlewindow, app } = this.props;
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Icon type="appstore-o" /> {this.msg('integration')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('appSingleWindow')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {singlewindow.name} {this.renderStatusTag(app.enabled)}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button icon="close" onClick={this.handleClose}>
              {this.msg('close')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content layout-fixed-width">
          <Card bodyStyle={{ padding: 0 }}>
            <Collapse accordion bordered={false} defaultActiveKey={['params']}>
              <Panel header="基本信息" key="profile">
                <ProfileForm app={singlewindow} />
              </Panel>
              <Panel header="参数配置" key="params">
                <ParamsForm />
              </Panel>
            </Collapse>
          </Card>
        </Content>
      </Layout>
    );
  }
}
