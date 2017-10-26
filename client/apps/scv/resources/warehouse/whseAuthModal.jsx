import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { Modal, Transfer } from 'antd';
import { closeWhseAuthModal, saveWhseAuths } from 'common/reducers/scvWarehouse';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(state => ({
  visible: state.scvWarehouse.whseAuthModal.visible,
  tenantId: state.account.tenantId,
  whse: state.scvWarehouse.whseAuthModal.warehouse,
  whseOwners: state.scvWarehouse.whseOwners,
}),
  { closeWhseAuthModal, saveWhseAuths }
)
export default class WhseAuthModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    whse: PropTypes.shape({ auths: PropTypes.arrayOf(PropTypes.shape({
      owner_partner_id: PropTypes.number.isRequired,
      owner_name: PropTypes.string.isRequired,
    })) }),
    whseOwners: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      pid: PropTypes.number,
      name: PropTypes.string.isRequired,
    })),
    closeWhseAuthModal: PropTypes.func.isRequired,
    saveWhseAuths: PropTypes.func.isRequired,
  }
  state = {
    removedKeys: [],
    appendKeys: [],
    targetKeys: [],
    transferItems: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whse.auths !== this.props.whse.auths) {
      this.setState({
        targetKeys: nextProps.whse.auths.map(auth => auth.owner_partner_id),
        transferItems: nextProps.whseOwners.filter(wo => nextProps.whse.auths
          .filter(auth => auth.owner_partner_id === wo.id)).map(wo => ({
            key: wo.id,
            title: wo.name,
          })),
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handleOwnerChange = (nextTargetKeys, direction, moveKeys) => {
    if (direction === 'left') {
      const appendKeys = this.state.appendKeys.filter(ak => moveKeys.filter(mk => mk === ak).length === 0);
      const removedKeys = this.state.removedKeys.concat(moveKeys.filter(mk => this.state.appendKeys.filter(ak => ak === mk).length === 0));
      this.setState({ targetKeys: nextTargetKeys, removedKeys, appendKeys });
    } else if (direction === 'right') {
      const removedKeys = this.state.removedKeys.filter(rk => moveKeys.filter(mk => mk === rk).length === 0);
      const appendKeys = this.state.appendKeys.concat(moveKeys.filter(mk => this.state.removedKeys.filter(rk => rk === mk).length === 0));
      this.setState({ targetKeys: nextTargetKeys, appendKeys, removedKeys });
    }
  }
  handleOk = () => {
    const { whse, whseOwners } = this.props;
    const appendOwners = [];
    for (let i = 0; i < this.state.appendKeys.length; i++) {
      const key = this.state.appendKeys[i];
      const owner = whseOwners.filter(whseo => whseo.id === key)[0];
      if (owner) {
        appendOwners.push({
          owner_tenant_id: owner.pid,
          owner_partner_id: owner.id,
          owner_name: owner.name,
        });
      }
    }
    this.props.saveWhseAuths({
      wh_no: whse.wh_no,
      whse_name: whse.whse_name,
      removedOwners: this.state.removedKeys,
      appendOwners,
      tenantId: this.props.tenantId,
    });
  }
  handleCancel = () => {
    this.props.closeWhseAuthModal();
  }
  render() {
    const { visible, whse } = this.props;
    return (
      <Modal maskClosable={false} title={whse.whse_name} visible={visible} key="whse-auth-modal"
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Transfer dataSource={this.state.transferItems} titles={['全部货主', '授权货主']}
          targetKeys={this.state.targetKeys}
          render={item => item.title} onChange={this.handleOwnerChange}
        />
      </Modal>);
  }
}
