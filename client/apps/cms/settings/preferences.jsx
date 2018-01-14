import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Card, Form, Radio, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { switchNavOption } from 'common/reducers/cmsPreferences';
import { CMS_DECL_CHANNEL } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import PageHeader from 'client/components/PageHeader';
import SettingMenu from './menu';
import { formatMsg } from './message.i18n';

const { Content, Sider } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    invTemplates: state.cmsInvoice.invTemplates,
    docuType: state.cmsInvoice.docuType,
  }),
  { switchNavOption }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'setting', action: 'edit' })
export default class Preferences extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    declChannel: '',
  }
  componentWillMount() {
    if (window.localStorage) {
      const declChannel = window.localStorage.getItem('decl-channel');
      this.setState({ declChannel });
    }
  }
  msg = formatMsg(this.props.intl)
  handleDeclChannelChange = (ev) => {
    if (window.localStorage) {
      window.localStorage.setItem('decl-channel', ev.target.value);
      this.setState({ declChannel: ev.target.value });
    }
  }
  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('settings')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <SettingMenu currentKey="preferences" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                参数设定
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
          </PageHeader>
          <Content className="page-content layout-fixed-width">
            <Card title="报关">
              <FormItem label="默认申报通道" {...formItemLayout}>
                <RadioGroup value={this.state.declChannel} onChange={this.handleDeclChannelChange}>
                  {Object.keys(CMS_DECL_CHANNEL).map((declChannel) => {
                    const channel = CMS_DECL_CHANNEL[declChannel];
                    return (<RadioButton
                      value={channel.value}
                      key={channel.value}
                      disabled={channel.disabled}
                    >
                      {channel.text}
                    </RadioButton>);
                  })}
                </RadioGroup>
              </FormItem>
            </Card>
            <Card title="报检" />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
