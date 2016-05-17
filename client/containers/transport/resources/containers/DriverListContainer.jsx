import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import DriverList from '../components/DriverList.jsx';
import connectFetch from 'reusable/decorators/connect-fetch';
import { loadDriverList } from '../../../../../universal/redux/reducers/transportResources';

function fetchData({dispatch}) {
  return dispatch(loadDriverList());
}

@connectFetch()(fetchData)
@connect(state => ({drivers: state.transportResources.drivers}))
export default class DriverListContainer extends Component {
  static propTypes = {
    drivers: PropTypes.array.isRequired, // 服务器返回的司机数组
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleAddDriverBtnClicked = () => {
    this.context.router.push('/transport/resources/add_driver');
  }
  render() {
    return (
      <DriverList dataSource={this.props.drivers} onAddDriverBtnClicked={this.handleAddDriverBtnClicked} />
    );
  }
}
