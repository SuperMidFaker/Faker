import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import DriverList from '../components/DriverList.jsx';
import connectFetch from 'reusable/decorators/connect-fetch';
import { loadDriverList } from '../../../../../universal/redux/reducers/transportResources';

function fetchData({dispatch}) {
  return dispatch(loadDriverList());
}

@connectFetch()(fetchData)
@connect(state => ({
  drivers: state.transportResources.drivers,
  selectedMenuItemKey: state.transportResources.selectedMenuItemKey,
  loading: state.transportResources.loading
}))
export default class DriverListContainer extends Component {
  static propTypes = {
    drivers: PropTypes.array.isRequired,              // 服务器返回的司机数组
    selectedMenuItemKey: PropTypes.string.isRequired, // 当先选中的menuItem key
    loading: PropTypes.bool.isRequired,               // 当前组件是否正在加载
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleAddDriverBtnClicked = () => {
    this.context.router.push('/transport/resources/add_driver');
  }
  render() {
    const { drivers, selectedMenuItemKey, loading } = this.props;
    return (
      <DriverList dataSource={drivers}
                  visible={selectedMenuItemKey === '1'}
                  loading={loading}
                  onAddDriverBtnClicked={this.handleAddDriverBtnClicked} />
    );
  }
}
