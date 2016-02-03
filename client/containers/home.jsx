import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu } from 'ant-ui';
import AmNavBar from '../components/am-navbar';
import NavLink from '../../reusable/components/nav-link';
import ModuleLayout from '../components/module-layout';
import { setNavTitle } from '../../universal/redux/reducers/navbar';
import './home.less';

@connect(
  state => ({
    logo: state.corpDomain.logo,
    name: state.corpDomain.name
  }),
  { setNavTitle }
)
export default class Home extends React.Component {
  static propTypes = {
    setNavTitle: PropTypes.func.isRequired,
    logo: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  };
  componentWillMount() {
    this.props.setNavTitle({
      depth: 1
    });
  }
  render() {
    const {logo, name} = this.props;
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
              <Menu selectedKeys="apps" mode="horizontal">
                <Menu.Item key="apps">
                  <i className="zmdi zmdi-apps"></i>应用
                </Menu.Item>
                <Menu.Item key="activities">
                  <i className="zmdi zmdi-view-day"></i>动态
                </Menu.Item>
                <Menu.Item key="setting">
                  <NavLink to="/corp/info"><i className="zmdi zmdi-settings"></i>设置</NavLink>
                </Menu.Item>
              </Menu>
            </div>
          </div>
          <div className="home-body">
            <div className="home-body-wrapper">
              <ModuleLayout size="large" />
            </div>
          </div>
        </div>
      </div>);
  }
}
