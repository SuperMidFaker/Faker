import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AmNavBar from 'client/components/am-navbar';
import ModuleLayout from 'client/components/module-layout';
import { setNavTitle } from 'common/reducers/navbar';
import './home.less';

const mods = [{
  cls: 'manager',
  url: '/manager',
  text: '运营管理'
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
    return (
      <div className="am-wrapper am-nosidebar-left">
        <AmNavBar />
        <div className="am-content">
          <div className="home-header home-header-bg">
            <div className="tenant-info">
              <h2 className="tenant-name">微骆SaaS云平台管理系统</h2>
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
