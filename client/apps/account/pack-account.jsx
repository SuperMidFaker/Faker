import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AmNavBar from 'client/components/am-navbar';
import { setNavTitle } from 'common/reducers/navbar';

@connect()
export default class AccountPack extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.props.dispatch(setNavTitle({
      depth: 1,
    }));
  }
  render() {
    return (
      <div className="am-wrapper am-nosidebar-left">
        <AmNavBar />
        <div className="am-content">
          <div className="main-content no-top-bar">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
