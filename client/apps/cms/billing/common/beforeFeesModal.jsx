import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Table, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { loadDispsBeforeTime, loadExpsBeforeTime, alterBillingFees } from 'common/reducers/cmsBilling';
import { formatMsg } from '../message.i18n';

@injectIntl

@connect(
  state => ({
    tenantId: state.account.tenantId,
    billing: state.cmsBilling.billing,
    BfdispIds: state.cmsBilling.BfdispIds,
  }),
  { loadDispsBeforeTime, loadExpsBeforeTime, alterBillingFees }
)

export default class BeforeFeesModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
    BfdispIds: PropTypes.array.isRequired,
    loadDispsBeforeTime: PropTypes.func.isRequired,
    loadExpsBeforeTime: PropTypes.func.isRequired,
    alterBillingFees: PropTypes.func.isRequired,
    toggle: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    dataSource: [],
  }
  componentDidMount() {
    const { tenantId, type } = this.props;
    const {
      beginDate, chooseModel, partnerId, partnerTenantId,
    } = this.props.billing;
    this.props.loadDispsBeforeTime({
      type,
      beginDate: moment(beginDate).format('YYYY-MM-DD 00:00:00'),
      chooseModel,
      partnerId,
      partnerTenantId,
      tenantId,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.BfdispIds !== this.props.BfdispIds) {
      this.props.loadExpsBeforeTime(nextProps.BfdispIds, this.props.tenantId).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          const exps = result.data.data.map(item => ({
            ...item,
            last_updated_tenant_id: this.props.tenantId,
            last_updated_date: new Date(),
            updated_field: 'billing_status',
          }));
          this.setState({ dataSource: exps });
        }
      });
    }
  }

  msg = formatMsg(this.props.intl)

  handleAdd = (fee) => {
    this.props.alterBillingFees(fee);
    const newDataSource = this.state.dataSource.filter(item => item._id !== fee._id);
    this.setState({ dataSource: newDataSource });
  }

  render() {
    const columns = [{
      title: this.msg('delgNo'),
      dataIndex: 'delg_no',
      width: 120,
    }, {
      title: this.msg('invoiceNo'),
      dataIndex: 'invoice_no',
      width: 120,
    }, {
      title: this.msg('servCharge'),
      dataIndex: 'serv_charge',
      width: 120,
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: this.msg('advanceCharge'),
      dataIndex: 'advance_charge',
      width: 120,
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: this.msg('finalCharge'),
      width: 120,
      render(o, record) {
        let total = 0;
        if (record.advance_charge !== null) {
          total += record.advance_charge;
        }
        if (record.serv_charge !== null) {
          total += record.serv_charge;
        }
        return total.toFixed(2);
      },
    }, {
      title: this.msg('billingStatus'),
      dataIndex: 'billing_status',
      width: 120,
      render: (o, record) => (<a onClick={() => this.handleAdd(record)}>入帐</a>),
    }];
    return (
      <Modal maskClosable={false} visible={this.props.visible} width="85%" title="未入账运单" onOk={this.props.toggle} onCancel={this.props.toggle}>
        <Table dataSource={this.state.dataSource} columns={columns} rowKey="id" />
      </Modal>
    );
  }
}
