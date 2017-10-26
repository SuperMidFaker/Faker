import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Card, Form, Tabs, Layout } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Content } = Layout;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
  }),
  { }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class ManualDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
  }
  msg = key => formatMsg(this.props.intl, key);


  render() {
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('manual')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('manual')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
        </PageHeader>
        <Content className="page-content">
          <Card bodyStyle={{ padding: 0 }} noHovering>
            <Tabs defaultActiveKey="head">
              <TabPane tab="基本信息" key="head" />
              <TabPane tab="料件表" key="img" />
              <TabPane tab="成品表" key="exg" />
              <TabPane tab="单损耗表" key="consume" />
            </Tabs>
          </Card>
        </Content>
      </Layout>
    );
  }
}
