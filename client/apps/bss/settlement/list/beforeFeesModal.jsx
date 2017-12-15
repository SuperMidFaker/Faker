import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadFeesBeforeTime, alterBillingFees, loadClearanceFeesBeforeTime, loadTransportFeesBeforeTime,
  showBeforeFeesModal } from 'common/reducers/crmBilling';
import TrimSpan from 'client/components/trimSpan';
import TrsShipmtNoColumn from '../../common/trsShipmtNoColumn';
import CcbDelgNoColumn from '../../common/ccbDelgNoColumn';
import { loadOrderDetail } from 'common/reducers/crmOrders';
import { CRM_ORDER_MODE } from 'common/constants';

const formatMsg = format(messages);

@injectIntl

@connect(
  state => ({
    tenantId: state.account.tenantId,
    billing: state.crmBilling.billing,
    visible: state.crmBilling.beforeFeesModal.visible,
    beforeFees: state.crmBilling.beforeFeesModal.data,
  }),
  {
    loadFeesBeforeTime,
    alterBillingFees,
    loadOrderDetail,
    loadClearanceFeesBeforeTime,
    loadTransportFeesBeforeTime,
    showBeforeFeesModal,
  }
)

export default class BeforeFeesModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadFeesBeforeTime: PropTypes.func.isRequired,
    loadClearanceFeesBeforeTime: PropTypes.func.isRequired,
    loadTransportFeesBeforeTime: PropTypes.func.isRequired,
    alterBillingFees: PropTypes.func.isRequired,
    showBeforeFeesModal: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    loadOrderDetail: PropTypes.func.isRequired,
    beforeFees: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }
  componentWillMount() {
    const { tenantId } = this.props;
    const { beginDate, partnerId } = this.context.location.query;
    this.props.loadFeesBeforeTime({
      beginDate,
      partnerId,
      tenantId,
    }).then((result) => {
      if (!result.error) {
        const shipmtOrders = [];
        this.props.beforeFees.forEach((item) => {
          shipmtOrders.push({
            trs_shipmt_no: item.trs_shipmt_no,
            ccb_delg_no: item.ccb_delg_no,
            shipmt_order_no: item.shipmt_order_no,
          });
        });
        this.props.loadTransportFeesBeforeTime(shipmtOrders);
        this.props.loadClearanceFeesBeforeTime(shipmtOrders);
      }
    });
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)

  handleAdd = (fee) => {
    this.props.alterBillingFees(fee);
    const newDataSource = this.state.dataSource.filter(item => item.id !== fee.id);
    this.setState({ dataSource: newDataSource });
  }
  renderTransportCharge = (o, record) => {
    if (record.shipmt_order_mode.indexOf(CRM_ORDER_MODE.transport) >= 0) {
      return o ? o.toFixed(2) : '';
    } else {
      return '';
    }
  }
  renderClearanceCharge = (o, record) => {
    if (record.shipmt_order_mode.indexOf(CRM_ORDER_MODE.clearance) >= 0) {
      return o ? o.toFixed(2) : '';
    } else {
      return '';
    }
  }
  render() {
    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_order_no',
      render: o => (<a onClick={() => this.props.loadOrderDetail(o, this.props.tenantId)}>{o}</a>),
    }, {
      title: '客户单号',
      dataIndex: 'cust_order_no',
      render: o => <TrimSpan text={o} />,
    }, {
      title: '委托编号',
      dataIndex: 'ccb_delg_no',
      render: o => <CcbDelgNoColumn nos={o} />,
    }, {
      title: '报关服务费',
      key: 'ccb_server_charge',
      dataIndex: 'ccb_server_charge',
      render: this.renderClearanceCharge,
    }, {
      title: '报关代垫费用',
      key: 'ccb_cush_charge',
      dataIndex: 'ccb_cush_charge',
      render: this.renderClearanceCharge,
    }, {
      title: '报关费用合计',
      key: 'ccbTotalCharge',
      dataIndex: 'ccbTotalCharge',
      render: this.renderClearanceCharge,
    }, {
      title: '运输单号',
      dataIndex: 'trs_shipmt_no',
      render(o) {
        return <TrsShipmtNoColumn nos={o} />;
      },
    }, {
      title: '基本运费',
      key: 'trs_freight_charge',
      dataIndex: 'trs_freight_charge',
      render: this.renderTransportCharge,
    }, {
      title: '特殊费用',
      key: 'trs_excp_charge',
      dataIndex: 'trs_excp_charge',
      render: this.renderTransportCharge,
    }, {
      title: '运输代垫费用',
      key: 'trs_advance_charge',
      dataIndex: 'trs_advance_charge',
      render: this.renderTransportCharge,
    }, {
      title: '运输费用合计',
      key: 'trsTotalCharge',
      dataIndex: 'trsTotalCharge',
      render: this.renderTransportCharge,
    }, {
      title: '订单总费用',
      key: 'total_charge',
      dataIndex: 'total_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '操作',
      dataIndex: 'status',
      render: (o, record) => (<a onClick={() => this.handleAdd(record)}>入帐</a>),
    }];
    return (
      <Modal maskClosable={false} visible={this.props.visible} width="85%" title="未入账运单"
        onOk={() => this.props.showBeforeFeesModal(false)}
        onCancel={() => this.props.showBeforeFeesModal(false)}
      >
        <Table dataSource={this.props.beforeFees} columns={columns} rowKey="id" />
      </Modal>
    );
  }
}
