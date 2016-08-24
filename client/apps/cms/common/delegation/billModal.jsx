import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Row, Col, Progress } from 'antd';
import NavLink from 'client/components/nav-link';
import { closeBillMakeModal } from 'common/reducers/cmsDelegation';

@connect(
  state => ({
    tenantId: state.account.tenantId,
    billMakeModal: state.cmsDelegation.billMakeModal,
  }),
  { closeBillMakeModal }
)
export default class BillModal extends Component {
  static propTypes = {
    billMakeModal: PropTypes.object.isRequired,
  }

  handleCancel = () => {
    this.props.closeBillMakeModal();
  }

  render() {
    const { ietype, billMakeModal } = this.props;
    let linkTo = `/clearance/${ietype}/declare/make/`;
    let title = '选择清单-开始制单';
    if (billMakeModal.type === 'view') {
      linkTo = `/clearance/${ietype}/declare/view/`;
      title = '选择查看清单';
    }
    const billPros = billMakeModal.bills.map((bill, index) => {
      const perVal = (bill.bill_status * 20);
      return (
        <Row key={`make-bill${index}`}>
          <Col span={8}>
            <NavLink onChange={this.handleCancel} to={`${linkTo}${bill.bill_seq_no}`}>
              {bill.bill_seq_no}
            </NavLink>
          </Col>
          <Col span={16}>
            <Progress percent={perVal} status="active" />
          </Col>
        </Row>
      );
    });
    return (
      <Modal visible={billMakeModal.visible} title={title}
        onCancel={this.handleCancel} onOk={this.handleCancel}
      >
        {billPros}
      </Modal>
  ); }
}
