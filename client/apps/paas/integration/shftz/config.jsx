import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Card, Collapse, Layout, Tag } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadShftzApp, updateShftzApp } from 'common/reducers/hubIntegration';
import PageHeader from 'client/components/PageHeader';
import ProfileForm from '../common/profileForm';
import ParamsForm from './forms/paramsForm';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;
const { Panel } = Collapse;

function fetchData({ dispatch, params }) {
  return dispatch(loadShftzApp(params.uuid));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    app: state.hubIntegration.currentApp,
    shftz: state.hubIntegration.shftzApp,
  }),
  { updateShftzApp }
)
export default class ConfigSHFTZ extends React.Component {
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
    const { shftz, app } = this.props;
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            this.msg('installedPlugins'),
            this.msg('appSHFTZ'),
            <span>{shftz.name} {this.renderStatusTag(app.enabled)}</span>,
          ]}
        >
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
                <ProfileForm app={shftz} />
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
