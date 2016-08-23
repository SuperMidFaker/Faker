import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Row, Col, Progress } from 'antd';
import NavLink from 'client/components/nav-link';
import { setModalFalse } from 'common/reducers/cmsDelegation';

@connect(
  state => ({
    tenantId: state.account.tenantId,
    billMakeModal: state.cmsDelegation.billMakeModal,
  }),
  { setModalFalse }
)
export default class BillModal extends Component {
  static propTypes = {
    billMakeModal: PropTypes.object.isRequired,
  }

  handleCancel = () => {
    this.props.setModalFalse();
  }

  render() {
    const { ietype, billMakeModal } = this.props;
    const billPros = billMakeModal.bills.map((bill) => {
      const perVal = (bill.bill_status * 20);
      return (
        <Row>
          <Col span={8}>
            <NavLink to={`/clearance/${ietype}/declare/make/${bill.bill_seq_no}`}>
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
      <Modal title="选择清单-开始制单" visible={billMakeModal.visible}
        onCancel={() => this.handleCancel()} onOk={() => this.handleCancel()}
      >
        {billPros}
      </Modal>
  ); }
}
