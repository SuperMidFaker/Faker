import React, { Component, PropTypes } from 'react';
import Main from '../components/Main';
import { connect } from 'react-redux';
import { loadPartners, setMenuItemKey } from 'common/reducers/partner';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadPartners(cookie, {
    tenantId: state.account.tenantId,
    pageSize: state.partner.partnerlist.pageSize,
    currentPage: state.partner.partnerlist.current
  }));
}

@connectFetch()(fetchData)
@connectNav((props, dispatch) => {
  dispatch(setNavTitle({
    depth: 2,
    text: '协作网络',
    muduleName: 'corp',
    withModuleLayout: false,
    goBackFn: null
  }));
})
@connect(state => ({selectedMenuItemKey: state.partner.selectedMenuItemKey}), { setMenuItemKey })
export default class MainContainer extends Component {
  static propsTypes = {
    selectedMenuItemKey: PropTypes.string.isRequired,   // 当前选中的Menu Item Key
    setMenuItemKey: PropTypes.func.isRequired,          // MenuItem点击时触发的action creator
  }
  handleMenuItemClick = (e) => {
    this.props.setMenuItemKey(e.key);
  }
  render() {
    const { selectedMenuItemKey = '0' } = this.props;
    return (
      <Main selectedMenuItemKey={selectedMenuItemKey} onMenuItemClick={this.handleMenuItemClick}/>
    );
  }
}
