import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Card, Radio, Layout } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { switchNavOption } from 'common/reducers/cmsPreferences';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;

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
  }


  msg = key => formatMsg(this.props.intl, key);

  handleNavOptionChange = (ev) => {
    this.props.switchNavOption(ev.target.value);
    if (window.localStorage) {
      window.localStorage.setItem('cms-nav-option', ev.target.value);
    }
  }
  render() {
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <Layout>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
                偏好设置
              </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content layout-fixed-width">
          <Card>
            <RadioGroup onChange={this.handleNavOptionChange}>
              <Radio style={radioStyle} value="CC">按报关、报检</Radio>
              <Radio style={radioStyle} value="IE">按进口、出口</Radio>
              <Radio style={radioStyle} value="ALL">同时显示</Radio>
            </RadioGroup>
          </Card>
        </Content>
      </Layout>
    );
  }
}