import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Table, message } from 'antd';
import { loadwhseOwners, addWhseOwners, hideWhseMembers } from 'common/reducers/cwmWarehouse';
import { loadPartners } from 'common/reducers/partner';
import { PARTNER_BUSINESSE_TYPES, PARTNER_ROLES } from 'common/constants';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    partners: state.partner.partners,
    visible: state.cwmWarehouse.whsehouseModal.visible,
    loginId: state.account.loginId,
  }),
  { loadwhseOwners, loadPartners, addWhseOwners, hideWhseMembers }
)
export default class OwnersModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    whseTenantId: PropTypes.number.isRequired,
    whseOwners: PropTypes.array,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whseCode !== this.props.whseCode) {
      const tenantId = nextProps.whseTenantId;
      this.props.loadPartners({
        tenantId,
        role: PARTNER_ROLES.CUS,
        businessType: PARTNER_BUSINESSE_TYPES.warehousing,
      });
    }
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: '货主代码',
    dataIndex: 'partner_code',
  }, {
    title: '货主名称',
    dataIndex: 'name',
  }]
  handleCancel = () => {
    this.props.hideWhseMembers();
  }
  handleAdd = () => {
    const whseCode = this.props.whseCode;
    const data = this.state.selectedRows.map(obj => ({
      partnerId: obj.id,
      name: obj.name,
      code: obj.partner_code,
      whseCode,
      tenantId: obj.partner_tenant_id,
      whseTenantId: this.props.whseTenantId,
    }));
    this.props.addWhseOwners(data, this.props.loginId).then(
      (result) => {
        if (!result.error) {
          message.info('添加成功');
          this.props.hideWhseMembers();
          this.props.loadwhseOwners(whseCode);
        }
      }
    );
  }
  render() {
    const { visible, partners, whseOwners } = this.props;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
      },
      selectedRowKeys: this.state.selectedRowKeys,
    };
    const filterPartners = partners.filter(partner => !whseOwners.find(owners => owners.owner_partner_id === partner.id));
    return (
      <Modal title="添加货主" visible={visible} onCancel={this.handleCancel} onOk={this.handleAdd}>
        <Table columns={this.columns} dataSource={filterPartners} rowKey="id" rowSelection={rowSelection} pagination={false} />
      </Modal>
    );
  }
}
