import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Main from '../components/Main';
import { setMenuItemKey } from '../../../../../universal/redux/reducers/transportResources';

@connect(state => ({selectedKey: state.transportResources.selectedMenuItemKey}), {setMenuItemKey})
export default class MainContainer extends Component {
  static propTypes = {
    selectedKey: PropTypes.string.isRequired,  // 当前选中的MenuItem key
    setMenuItemKey: PropTypes.func.isRequired, // 改变当前选中的MenuItem key的action creator
  }
  handleMenuItemClick = (e) => {
    this.props.setMenuItemKey(e.key);
  }
  render() {
    return (
      <Main selectedKeys={[this.props.selectedKey]} onClick={this.handleMenuItemClick}/>
    );
  }
}
