import React, { Component, PropTypes } from 'react';
import { message } from 'antd';
import { connect } from 'react-redux';
import CarrierList from '../components/CarrierList.jsx';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadPartners, addPartner, editPartner, changePartnerStatus, deletePartner } from 'common/reducers/partner';
import connectNav from 'client/common/decorators/connect-nav';
import partnerModal from '../../../corp/cooperation/components/partnerModal';

function fetchData({ dispatch, state, cookie }) {
  return dispatch(loadPartners(cookie, {
    tenantId: state.account.tenantId,
  }));
}

@connectFetch()(fetchData)
@connect(state => ({
  partnerlist: state.partner.partnerlist,
  tenantId: state.account.tenantId,
}), { addPartner, editPartner, changePartnerStatus, deletePartner })
@connectNav({
  depth: 3,
  text: '承运商管理',
  muduleName: 'transport',
})
export default class DriverListContainer extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    partnerlist: PropTypes.array.isRequired,
    addPartner: PropTypes.func.isRequired,
    editPartner: PropTypes.func.isRequired,
    changePartnerStatus: PropTypes.func.isRequired,
    deletePartner: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleEditBtnClick = (key, name, code) => {
    partnerModal({
      onOk: (ename, ecode) => {
        this.props.editPartner(key, ename, ecode).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message);
            }
          });
      },
      editInfo: {
        name,
        code,
      },
    });
  }
  handleAddBtnClick = () => {
    const { tenantId } = this.props;
    partnerModal({
      isProvider: true,
      partnerships: ['TRS'],
      onOk: (partnerInfo) => {
        this.props.addPartner({ tenantId, partnerInfo, partnerships: partnerInfo.partnerships }).then(() => {
          message.success('添加成功');
        });
      },
    });
  }
  handleStopBtnClick = (id) => {
    this.props.changePartnerStatus(id, 0);
  }
  handleDeleteBtnClick = (id) => {
    this.props.deletePartner(id);
  }
  handleResumeBtnClick = (id) => {
    this.props.changePartnerStatus(id, 1);
  }
  render() {
    const { partnerlist } = this.props;
    const dataSource = partnerlist.filter(partner => partner.partnerships.some(ps => ps === 'TRS'));
    return (
      <CarrierList
        dataSource={dataSource}
        onAddBtnClicked={this.handleAddBtnClick}
        onEditBtnClick={this.handleEditBtnClick}
        onStopBtnClick={this.handleStopBtnClick}
        onDeleteBtnClick={this.handleDeleteBtnClick}
        onResumeBtnClick={this.handleResumeBtnClick}
      />
    );
  }
}
