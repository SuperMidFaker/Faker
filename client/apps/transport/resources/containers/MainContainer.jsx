import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Main from '../components/Main';
import { setMenuItemKey } from 'common/reducers/transportResources';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';

@connectNav((props, dispatch) => {
  dispatch(setNavTitle({
    depth: 2,
    text: '资源',
    muduleName: 'transport',
    withModuleLayout: false,
    goBackFn: null
  }));
})
@connect(state => ({
  selectedKey: state.transportResources.selectedMenuItemKey,
  loading: state.transportResources.loading
}), {setMenuItemKey})
export default class MainContainer extends Component {
  static propTypes = {
    selectedKey: PropTypes.string.isRequired,  // 当前选中的MenuItem key
    setMenuItemKey: PropTypes.func.isRequired, // 改变当前选中的MenuItem key的action creator
  }
  handleMenuItemClick = (e) => {
    this.props.setMenuItemKey(e.key);
  }
  render() {
    const { selectedKey, loading } = this.props;
    return (
      <Main selectedKeys={[selectedKey]}
            onClick={this.handleMenuItemClick}
            loading={loading}/>
    );
  }
}
