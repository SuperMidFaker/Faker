import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Row, Col, Progress, Button } from 'antd';
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
    let linkTo = `/clearance/${ietype}/docs/make/`;
    let title = '选择清单-开始制单';
    if (billMakeModal.type === 'view') {
      linkTo = `/clearance/${ietype}/docs/view/`;
      title = '选择查看清单';
    }
    const footer = (
        <Button type="ghost" size="large" onClick={this.handleCancel}>取消</Button>
    );
    const billPros = billMakeModal.bills.map((bill, index) => {
      const perVal = (bill.bill_status * 20);
      return (
        <Row key={`make-bill${index}`}>
          <Col span={8} style={{ padding: 8 }}>
            <NavLink onChange={this.handleCancel} to={`${linkTo}${bill.bill_seq_no}`}>
              {bill.bill_seq_no}
            </NavLink>
          </Col>
          <Col span={16} style={{ padding: 8 }}>
            <Progress percent={perVal} />
          </Col>
        </Row>
      );
    });
    return (
      <Modal visible={billMakeModal.visible} title={title} footer={footer} onCancel={this.handleCancel}>
        <Row>
          <Col span={8} style={{ padding: 8 }}>
            清单编号
          </Col>
          <Col span={16} style={{ padding: 8 }}>
            制单进度
          </Col>
        </Row>
        {billPros}
      </Modal>
  ); }
}
