import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AmNavBar from 'client/components/am-navbar';
import ModuleLayout from 'client/components/module-layout';
import { setNavTitle } from 'common/reducers/navbar';
import 'client/apps/home/home.less';

const mods = [{
  cls: 'manager',
  url: '/manager',
  text: '租户管理'
}];

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
    const { logo, name } = this.props;
    return (
      <div className="am-wrapper am-nosidebar-left">
        <AmNavBar />
        <div className="am-content">
          <div className="home-header home-header-bg">
            <div className="tenant-info">
              <div className="tenant-logo " style={{backgroundImage:`url("${logo || '/assets/img/welogix-badge.png'}")`}} />
              <h2 className="tenant-name">{name}</h2>
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
