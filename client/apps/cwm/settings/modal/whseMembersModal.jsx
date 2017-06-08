import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Table, message } from 'antd';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { loadwhseOwners, addWhseOwners, hideWhseMembers } from 'common/reducers/cwmWarehouse';
import { loadPartners } from 'common/reducers/partner';
import { PARTNER_BUSINESSE_TYPES, PARTNER_ROLES } from 'common/constants';

const formatMsg = format(messages);
@injectIntl
@connect(
  state => ({
    partners: state.partner.partners,
    visible: state.cwmWarehouse.whsehouseModal.visible,
  }),
  { loadwhseOwners, loadPartners, addWhseOwners, hideWhseMembers }
)
export default class WhseMembersModal extends Component {
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
  componentWillMount() {
    const { whseTenantId } = this.props;
    this.props.loadPartners({
      tenantId: whseTenantId,
      role: PARTNER_ROLES.CUS,
      businessType: PARTNER_BUSINESSE_TYPES.warehousing,
    });
  }
  componentWillReceiveProps(nextProps) {
    const tenantId = this.props.whseTenantId;
    if (nextProps.whseCode !== this.props.whseCode) {
      this.props.loadPartners({
        tenantId,
        role: PARTNER_ROLES.CUS,
        businessType: PARTNER_BUSINESSE_TYPES.warehousing,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '客户代码',
    dataIndex: 'partner_code',
  }, {
    title: '客户',
    dataIndex: 'name',
  }]
  handleCancel = () => {
    this.props.hideWhseMembers();
  }
  handleAdd = () => {
    const whseCode = this.props.whseCode;
    const { selectedRows } = this.state;
    const data = [];
    for (let i = 0; i < selectedRows.length; i++) {
      const obj = {};
      obj.partnerId = selectedRows[i].id;
      obj.name = selectedRows[i].name;
      obj.whseCode = whseCode;
      obj.tenantId = selectedRows[i].partner_tenant_id;
      data.push(obj);
    }
    this.props.addWhseOwners(data).then(
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
      <Modal title="添加成员" visible={visible} onCancel={this.handleCancel} onOk={this.handleAdd}>
        <Table columns={this.columns} dataSource={filterPartners} rowKey="id" rowSelection={rowSelection} pagination={false} />
      </Modal>
    );
  }
}
