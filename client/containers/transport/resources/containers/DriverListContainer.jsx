import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import DriverList from '../components/DriverList.jsx';
import connectFetch from 'reusable/decorators/connect-fetch';
import { loadDriverList } from '../../../../../universal/redux/reducers/transportResources';

function fetchData({dispatch}) {
  return dispatch(loadDriverList());
}

@connectFetch()(fetchData)
@connect(state => ({drivers: state.transportResources.drivers, selectedMenuItemKey: state.transportResources.selectedMenuItemKey}))
export default class DriverListContainer extends Component {
  static propTypes = {
    drivers: PropTypes.array.isRequired, // 服务器返回的司机数组
    selectedMenuItemKey: PropTypes.string.isRequired, // 当先选中的menuItem key
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleAddDriverBtnClicked = () => {
    this.context.router.push('/transport/resources/add_driver');
  }
  render() {
    return (
      <DriverList dataSource={this.props.drivers}
                  visible={this.props.selectedMenuItemKey === '1'}
                  onAddDriverBtnClicked={this.handleAddDriverBtnClicked} />
    );
  }
}
