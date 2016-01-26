import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AmNavBar from '../components/am-navbar';
import { setNavTitle } from '../../universal/redux/reducers/navbar';
import connectNav from '../../reusable/decorators/connect-nav';
import {DEFAULT_MODULES} from '../../universal/constants';

@connect(
  null,
  { setNavTitle }
)
@connectNav((props) => {
  const moduleName = props.location.pathname.split('/')[1];
  props.setNavTitle({
    depth: 2,
    text: DEFAULT_MODULES[moduleName].text,
    moduleName,
    withModuleLayout: true,
    goBackFn: null
  });
})
export default class Module extends React.Component {
  static propTypes = {
    setNavTitle: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired
  };

  render() {
    return (
      <div className="am-wrapper am-fixed-sidebar">
        <AmNavBar />
        {this.props.children}
      </div>);
  }
}
