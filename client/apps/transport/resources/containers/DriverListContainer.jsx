import React, { Component, PropTypes } from 'react';
import { message } from 'antd';
import { connect } from 'react-redux';
import DriverList from '../components/DriverList';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadDriverList, editDriver, editDriverLogin, toggleDriverModal } from 'common/reducers/transportResources';
import { transformRawDriverDataToDisplayData } from '../utils/dataMapping';
import connectNav from 'client/common/decorators/connect-nav';

function fetchData({ dispatch, state }) {
  return dispatch(loadDriverList(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  loaded: state.transportResources.loaded,
  loading: state.transportResources.loading,
  drivers: state.transportResources.drivers,
  tenantId: state.account.tenantId,
}), { editDriver, editDriverLogin, toggleDriverModal, loadDriverList })
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
export default class DriverListContainer extends Component {
  static propTypes = {
    loaded: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    drivers: PropTypes.array.isRequired,              // 服务器返回的司机数组
    toggleDriverModal: PropTypes.func.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadDriverList: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    searchText: '',
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loaded && !nextProps.loading) {
      this.props.loadDriverList(nextProps.tenantId);
    }
  }
  handleAddDriverBtnClicked = () => {
    this.props.toggleDriverModal(true, 'add');
  }
  handleStopDriverBtnClick = (driverId) => {
    this.props.editDriver({ driverId, driverInfo: { status: 0 } });
  }
  handleResumeDriverBtnClick = (driverId) => {
    this.props.editDriver({ driverId, driverInfo: { status: 1 } });
  }
  handleEditDriverLogin = (driver) => {
    this.props.editDriverLogin(driver).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleEditDriver = (driverId) => {
    const driver = this.props.drivers.find(item => item.driver_id === driverId);
    this.props.toggleDriverModal(true, 'edit', driver);
  }
  handleSearch = (searchText) => {
    this.setState({ searchText });
  }
  render() {
    const { drivers } = this.props;
    const dataSource = drivers.map(transformRawDriverDataToDisplayData).filter((item) => {
      if (this.state.searchText) {
        const reg = new RegExp(this.state.searchText);
        return reg.test(item.name) || reg.test(item.phone);
      } else {
        return true;
      }
    });
    return (
      <DriverList dataSource={dataSource}
        onStopDriverBtnClick={this.handleStopDriverBtnClick}
        onResumeDriverBtnClick={this.handleResumeDriverBtnClick}
        onAddDriverBtnClicked={this.handleAddDriverBtnClicked}
        handleEditDriverLogin={this.handleEditDriverLogin}
        onEditDriver={this.handleEditDriver}
        onSearch={this.handleSearch}
        searchText={this.state.searchText}
      />
    );
  }
}
