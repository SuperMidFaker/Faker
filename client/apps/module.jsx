import React, { PropTypes } from 'react';
import AmNavBar from '../components/am-navbar';
import { setNavTitle } from 'common/reducers/navbar';
import connectNav from 'client/common/decorators/connect-nav';
import { DEFAULT_MODULES } from 'common/constants';

@connectNav((props, dispatch) => {
  let pathname = props.location.pathname;
  if (pathname[0] !== '/') {
    pathname = `/${pathname}`;
  }
  const mod = pathname.split('/')[1];
  const moduleName = DEFAULT_MODULES[mod].cls;
  const text = DEFAULT_MODULES[mod].text;
  dispatch(setNavTitle({
    depth: 2,
    text,
    moduleName,
    withModuleLayout: true,
    goBackFn: null,
  }));
})
export default class Module extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div className="am-wrapper am-fixed-sidebar">
        <AmNavBar />
        {this.props.children}
      </div>);
  }
}
