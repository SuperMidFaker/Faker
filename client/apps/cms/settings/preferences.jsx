import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Card, Form, Radio, Layout } from 'antd';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { switchNavOption } from 'common/reducers/cmsPreferences';
import { CMS_DECL_CHANNEL } from 'common/constants';

const { Header, Content } = Layout;
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
    navOption: 'CC',
    declChannel: '',
  }
  componentWillMount() {
    if (window.localStorage) {
      const navOption = window.localStorage.getItem('cms-nav-option');
      const declChannel = window.localStorage.getItem('decl-channel');
      this.setState({ navOption, declChannel });
    }
  }
  handleNavOptionChange = (ev) => {
    this.props.switchNavOption(ev.target.value);
    if (window.localStorage) {
      window.localStorage.setItem('cms-nav-option', ev.target.value);
      this.setState({ navOption: ev.target.value });
    }
  }
  handleDeclChannelChange = (ev) => {
    if (window.localStorage) {
      window.localStorage.setItem('decl-channel', ev.target.value);
      this.setState({ declChannel: ev.target.value });
    }
  }
  render() {
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
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
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              设置
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              参数设定
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content layout-fixed-width">
          <Card title="导航菜单">
            <RadioGroup value={this.state.navOption} onChange={this.handleNavOptionChange}>
              <Radio style={radioStyle} value="CC">按报关、报检</Radio>
              <Radio style={radioStyle} value="IE">按进口、出口</Radio>
              <Radio style={radioStyle} value="ALL">同时显示</Radio>
            </RadioGroup>
          </Card>
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
    );
  }
}
