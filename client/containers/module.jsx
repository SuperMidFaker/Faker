import React, { PropTypes } from 'react';
import AmNavBar from '../components/am-navbar';
import { setNavTitle } from '../../universal/redux/reducers/navbar';
import connectNav from '../../reusable/decorators/connect-nav';
import {DEFAULT_MODULES} from '../../universal/constants';

@connectNav((props, dispatch) => {
  const moduleName = props.location.pathname.split('/')[1];
  dispatch(setNavTitle({
    depth: 2,
    text: DEFAULT_MODULES[moduleName].text,
    moduleName,
    withModuleLayout: true,
    goBackFn: null
  }));
})
export default class Module extends React.Component {
  static propTypes = {
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
