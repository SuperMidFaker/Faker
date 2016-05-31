import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import AmNavBar from 'client/components/am-navbar';
import ModuleLayout from 'client/components/module-layout';
import { setNavTitle } from 'common/reducers/navbar';
import { format } from 'client/common/i18n/helpers';
import messages from 'client/apps/home/message.i18n';
import 'client/apps/home/home.less';
const formatMsg = format(messages);

const mods = [
  {cls: 'manager',
   url: '/manager',
   text: '租户管理'}];

@injectIntl
@connect(
  state => ({
    accountType: state.account.type,
    logo: state.corpDomain.logo,
    name: state.corpDomain.name
  }),
  { setNavTitle }
)
export default class Home extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    setNavTitle: PropTypes.func.isRequired,
    accountType: PropTypes.string.isRequired,
    logo: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  };
  componentWillMount() {
    this.props.setNavTitle({
      depth: 1
    });
  }
  render() {
    const { intl, logo, name } = this.props;
    const tenantMenus = [
      <Menu.Item key="apps">
        <i className="zmdi zmdi-apps"></i>
        {formatMsg(intl, 'applications')}
      </Menu.Item>,
      <Menu.Item key="activities">
        <i className="zmdi zmdi-view-day"></i>
        {formatMsg(intl, 'trends')}
      </Menu.Item>
    ];
    return (
      <div className="am-wrapper am-nosidebar-left">
        <AmNavBar />
        <div className="am-content">
          <div className="home-header home-header-bg">
            <div className="tenant-info">
              <div className="tenant-logo " style={{backgroundImage:`url("${logo || '/assets/img/home/tenant-logo.png'}")`}} />
              <h2 className="tenant-name">{name}</h2>
            </div>
            <div className="tenant-nav">
              <Menu defaultSelectedKeys={['apps']} mode="horizontal">
              { tenantMenus }
              </Menu>
            </div>
          </div>
          <div className="home-body">
            <div className="home-body-wrapper">
              <ModuleLayout size="large" enabledmods={mods} />
            </div>
          </div>
        </div>
      </div>);
  }
}
