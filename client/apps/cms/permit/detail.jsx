import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Form, Layout, Button, Tabs, message } from 'antd';

import MagicCard from 'client/components/MagicCard';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { updatePermit } from 'common/reducers/cmsPermit';
import PermitHeadPane from './tabpane/permitHeadPane';
import PermitItemsPane from './tabpane/permitItemsPane';
import PermitUsagePane from './tabpane/permitUsagePane';
import { formatMsg } from './message.i18n';


const { Content } = Layout;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { updatePermit }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class PermitDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    permit_file: '',
  }
  msg = formatMsg(this.props.intl)
  handleSave = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        const data = { ...values };
        data.permit_file = this.state.permit_file;
        this.props.updatePermit({ ...data, id: this.context.router.params.id }).then((result) => {
          if (!result.error) {
            message.info(this.msg('updateSuccess'));
            this.context.router.push('/clearance/permit');
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }
  handleFileChange = (file) => {
    this.setState({
      permit_file: file,
    });
  }
  render() {
    const { form } = this.props;
    const tabs = [];
    tabs.push(<TabPane tab={this.msg('infoTab')} key="head">
      <PermitHeadPane action="edit" form={form} onFileChange={this.handleFileChange} />
    </TabPane>);
    tabs.push(<TabPane tab={this.msg('itemsTab')} key="items">
      <PermitItemsPane />
    </TabPane>);
    tabs.push(<TabPane tab={this.msg('usageTab')} key="usage">
      <PermitUsagePane />
    </TabPane>);
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('permit')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('editPermit')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" icon="save" onClick={this.handleSave}>
              {this.msg('save')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <MagicCard
            bodyStyle={{ padding: 0 }}

            onSizeChange={this.toggleFullscreen}
          >
            <Tabs defaultActiveKey="head">
              {tabs}
            </Tabs>
          </MagicCard>
        </Content>
      </Layout>
    );
  }
}
