import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {Button} from '../../reusable/ant-ui';
import AmNavBar from '../components/am-navbar';
import NavLink from '../../reusable/components/nav-link';
import ModuleLayout from '../components/module-layout';
import './home.less';

@connect(
  state => ({
    logo: state.corpDomain.logo,
    name: state.corpDomain.name
  })
)
export default class Home extends React.Component {
  static propTypes = {
    logo: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  };

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
            <div className="btn-group">
              <NavLink to="/corp/info"><Button type="primary" size="large"><span>设置</span></Button></NavLink>
            </div>
            <div className="tenant-nav">
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
