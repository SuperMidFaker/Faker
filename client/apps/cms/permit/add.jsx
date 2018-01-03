import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Form, Layout, Button, Tabs } from 'antd';
import { format } from 'client/common/i18n/helpers';
import MagicCard from 'client/components/MagicCard';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { addPermit } from 'common/reducers/cmsPermit';
import PermitHeadPane from './tabpane/permitHeadPane';
import messages from './message.i18n';


const formatMsg = format(messages);
const { Content } = Layout;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { addPermit }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class PermitAdd extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    permit_file: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  handleFileChange = (file) => {
    this.setState({
      permit_file: file,
    });
  }
  handleSave = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        const data = { ...values };
        data.permit_file = this.state.permit_file;
        this.props.addPermit(data).then((result) => {
          if (!result.error) {
            this.context.router.push('clearance/permit');
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }

  render() {
    const { form } = this.props;
    const tabs = [];
    tabs.push(<TabPane tab={this.msg('infoTab')} key="head">
      <PermitHeadPane action="create" form={form} onFileChange={this.handleFileChange} />
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
                {this.msg('addPermit')}
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
