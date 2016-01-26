import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AmNavBar from '../components/am-navbar';
import { setNavTitle } from '../../universal/redux/reducers/navbar';
import {DEFAULT_MODULES} from '../../universal/constants';

@connect(
  null,
  { setNavTitle }
)
export default class Module extends React.Component {
  static propTypes = {
    setNavTitle: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired
  };

  componentWillMount() {
    const moduleName = this.props.location.pathname.split('/')[1];
    this.props.setNavTitle({
      depth: 2,
      text: DEFAULT_MODULES[moduleName].text,
      moduleName,
      withModuleLayout: true,
      backUrl: ''
    });
  }
  componentWillReceiveProps(nextProps) {
    const moduleName = nextProps.location.pathname.split('/')[1];
    this.props.setNavTitle({
      depth: 2,
      text: DEFAULT_MODULES[moduleName].text,
      moduleName,
      withModuleLayout: true,
      backUrl: ''
    });
  }

  render() {
    return (
      <div className="am-wrapper am-fixed-sidebar">
        <AmNavBar />
        {this.props.children}
      </div>);
  }
}
