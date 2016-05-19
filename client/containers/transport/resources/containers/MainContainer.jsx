import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Main from '../components/Main';
import { setMenuItemKey } from '../../../../../universal/redux/reducers/transportResources';
import connectNav from 'reusable/decorators/connect-nav';
import { setNavTitle } from 'universal/redux/reducers/navbar';

@connectNav((props, dispatch) => {
  dispatch(setNavTitle({
    depth: 2,
    text: '资源',
    muduleName: 'transport',
    withModuleLayout: false,
    goBackFn: null
  }));
})
@connect(state => ({selectedKey: state.transportResources.selectedMenuItemKey}), {setMenuItemKey})
export default class MainContainer extends Component {
  static propTypes = {
    selectedKey: PropTypes.string.isRequired,  // 当前选中的MenuItem key
    setMenuItemKey: PropTypes.func.isRequired, // 改变当前选中的MenuItem key的action creator
  }
  componentWillMount() {
    this.props.setMenuItemKey('0');
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
