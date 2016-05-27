import React, { Component, PropTypes } from 'react';
import Main from '../components/Main';
import { connect } from 'react-redux';
import { loadPartners, setMenuItemKey } from 'common/reducers/partner';
import connectFetch from 'client/common/decorators/connect-fetch';

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadPartners(cookie, {
    tenantId: state.account.tenantId,
    pageSize: state.partner.partnerlist.pageSize,
    currentPage: state.partner.partnerlist.current
  }));
}

@connectFetch()(fetchData)
// @connect(state => ({selectedMenuItemKey: state.partner.selectedMenuItemKey}), { setMenuItemKey })
export default class MainContainer extends Component {
  static propsTypes = {
    selectedMenuItemKey: PropTypes.string.isRequired,   // 当前选中的Menu Item Key
    setMenuItemKey: PropTypes.func.isRequired,          // MenuItem点击时触发的action creator
  }
  handleMenuItemClick = (e) => {
    console.log(e.value);
    // this.props.setmenuItemKey(e.value);
  }
  render() {
    console.log('hehh');
    const { selectedMenuItemKey } = this.props;
    return (
      <Main selectedMenuItemKey={selectedMenuItemKey} onMenuItemClick={this.handleMenuItemClick}/>
    );
  }
}
