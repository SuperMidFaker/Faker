import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Card, Radio, Layout } from 'antd';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { switchNavOption } from 'common/reducers/cmsPreferences';

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
  componentWillMount() {
    if (window.localStorage) {
      const navOption = window.localStorage.getItem('cms-nav-option');
      this.setState({ navOption });
    }
  }
  handleNavOptionChange = (ev) => {
    this.props.switchNavOption(ev.target.value);
    if (window.localStorage) {
      window.localStorage.setItem('cms-nav-option', ev.target.value);
      this.setState({ navOption: ev.target.value });
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
          <Card>
            <RadioGroup value={this.state.navOption} onChange={this.handleNavOptionChange}>
              <Radio style={radioStyle} value="CC">按报关、报检</Radio>
              <Radio style={radioStyle} value="IE">按进口、出口</Radio>
              <Radio style={radioStyle} value="ALL">同时显示</Radio>
            </RadioGroup>
          </Card>
          <Card title="报检规则" />
        </Content>
      </Layout>
    );
  }
}
