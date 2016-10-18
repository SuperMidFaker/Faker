import React, { PropTypes } from 'react';
import { Modal, Icon, Table, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadFeesBeforeTime, alterBillingFees } from 'common/reducers/transportBilling';
import { renderConsignLoc } from '../../common/consignLocation';
import TrimSpan from 'client/components/trimSpan';
import ExceptionListPopover from '../../tracking/land/modals/exception-list-popover';

const formatMsg = format(messages);

@injectIntl

@connect(
  state => ({
    tenantId: state.account.tenantId,
    billing: state.transportBilling.billing,
    billingFees: state.transportBilling.billingFees,
  }),
  { loadFeesBeforeTime, alterBillingFees }
)

export default class BeforeFeesModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
    billingFees: PropTypes.object.isRequired,
    loadFeesBeforeTime: PropTypes.func.isRequired,
    alterBillingFees: PropTypes.func.isRequired,
    toggle: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }
  state = {
    dataSource: [],
  }
  componentDidMount() {
    const { tenantId, type } = this.props;
    const { beginDate, endDate, chooseModel, partnerId, partnerTenantId } = this.context.location.query;
    this.props.loadFeesBeforeTime({
      type,
      beginDate: moment(beginDate).format('YYYY-MM-DD 00:00:00'),
      endDate: moment(endDate).format('YYYY-MM-DD 23:59:59'),
      chooseModel,
      partnerId,
      partnerTenantId,
      tenantId,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        const fees = result.data.data.map((item) => {
          return {
            ...item,
            last_updated_tenant_id: this.props.tenantId,
            last_updated_date: new Date(),
            updated_field: 'status',
          };
        });
        this.setState({ dataSource: fees });
      }
    });
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)

  handleAdd = (fee) => {
    this.props.alterBillingFees(fee);
    const newDataSource = this.state.dataSource.filter(item => item.id !== fee.id);
    this.setState({ dataSource: newDataSource });
  }

  render() {
    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
    }, {
      title: '费率',
      dataIndex: 'charge_gradient',
    }, {
      title: '计费量',
      dataIndex: 'charge_amount',
    }, {
      title: '运费',
      dataIndex: 'total_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '特殊费用',
      dataIndex: 'excp_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '代垫费用',
      dataIndex: 'advance_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '最终费用',
      render(o, record) {
        let totalCharge = 0;
        if (record.advance_charge !== null) {
          totalCharge += record.advance_charge;
        }
        if (record.excp_charge !== null) {
          totalCharge += record.excp_charge;
        }
        if (record.adjust_charge !== null) {
          totalCharge += record.adjust_charge;
        }
        if (record.total_charge !== null) {
          totalCharge += record.total_charge;
        }
        return totalCharge.toFixed(2);
      },
    }, {
      title: '异常',
      dataIndex: 'excp_count',
      render(o, record) {
        return (<ExceptionListPopover
          shipmtNo={record.shipmt_no}
          dispId={record.disp_id}
          excpCount={o}
          onShowExcpModal={() => {}}
        />);
      },
    }, {
      title: '始发地',
      dataIndex: 'consigner_province',
      render(o, record) {
        return (<TrimSpan text={renderConsignLoc(record, 'consigner')} maxLen={8} />);
      },
    }, {
      title: '目的地',
      dataIndex: 'consignee_province',
      render(o, record) {
        return (<TrimSpan text={renderConsignLoc(record, 'consignee')} maxLen={8} />);
      },
    }, {
      title: '运输模式',
      dataIndex: 'transport_mode',
    }, {
      title: '实际提货时间',
      dataIndex: 'pickup_act_date',
      render(o) {
        return moment(o).format('YYYY.MM.DD');
      },
    }, {
      title: '实际交货时间',
      dataIndex: 'deliver_act_date',
      render(o) {
        return moment(o).format('YYYY.MM.DD');
      },
    }, {
      title: '回单',
      dataIndex: 'pod_status',
      render(o) {
        if (!o || o === 0) {
          return '';
        }
        return <Icon type="link" />;
      },
    }, {
      title: '操作',
      dataIndex: 'status',
      render: (o, record) => {
        return (<a onClick={() => this.handleAdd(record)}>入帐</a>);
      },
    }];
    return (
      <Modal visible={this.props.visible} width="85%" title="未入账运单" onOk={this.props.toggle} onCancel={this.props.toggle}>
        <Table dataSource={this.state.dataSource} columns={columns} rowKey="id" />
      </Modal>
    );
  }
}
