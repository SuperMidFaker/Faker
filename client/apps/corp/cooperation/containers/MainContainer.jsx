import React, { Component, PropTypes } from 'react';
import Main from '../components/Main';
import { connect } from 'react-redux';
import { loadPartners, setMenuItemKey } from 'common/reducers/partner';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadPartners(cookie, {
    tenantId: state.account.tenantId,
  }));
}

@connectFetch()(fetchData)
@connect(state => ({
  selectedMenuItemKey: state.partner.selectedMenuItemKey,
}),
  { setMenuItemKey })
@connectNav({
  depth: 2,
  text: '协作网络',
  muduleName: 'corp',
})
@withPrivilege({ module: 'corp', feature: 'partners' })
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
      <Main selectedMenuItemKey={selectedMenuItemKey} onMenuItemClick={this.handleMenuItemClick} />
    );
  }
}
