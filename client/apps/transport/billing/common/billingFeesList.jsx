import React, { PropTypes } from 'react';
import { Button, InputNumber } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { updateBilling } from 'common/reducers/transportBilling';

const formatMsg = format(messages);

const rowSelection = {
  onSelect() {},
};
@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    billing: state.transportBilling.billing,
  }),
  { updateBilling }
)

export default class BillingFeesList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
    billing: PropTypes.object.isRequired,
    updateBilling: PropTypes.func.isRequired,
  }
  state = {
    changed: false,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleSave = () => {

  }
  handleChangeAdjustCharges = (feeId, adjustCharges) => {
    console.log(feeId, adjustCharges);
  }
  render() {
    const { billing } = this.props;
    console.log(this.props.billing);
    const handleLableStyle = {
      marginRight: 30,
      lineHeight: 2,
      fontSize: 14,
    };
    const dataSource = [{
      id: '1',
      name: '胡彦斌',
      age: 32,
      address: '西湖区湖底公园1号',
      adjust_charges: 0,
    }, {
      id: '2',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖底公园1号',
      adjust_charges: 99.99,
    }];

    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
    }, {
      title: '客户',
      dataIndex: 'customer_name',
    }, {
      title: '费率',
      dataIndex: 'charge_gradient',
    }, {
      title: '计费量',
      dataIndex: 'charg_amount',
    }, {
      title: '运费',
      dataIndex: 'freight_charges',
    }, {
      title: '特殊费用',
      dataIndex: '  excp_charges',
    }, {
      title: '代垫费用',
      dataIndex: 'advance_charges',
    }, {
      title: '调整金额',
      dataIndex: 'adjust_charges',
      render: (o, record) => {
        return (<InputNumber defaultValue={o} step={0.01} onChange={value => this.handleChangeAdjustCharges(record.id, value)} />);
      },
    }, {
      title: '最终费用',
      dataIndex: 'total_charges',
    }, {
      title: '异常',
      dataIndex: 'excp_count',
    }, {
      title: '始发地',
      dataIndex: 'consigner_province',
    }, {
      title: '目的地',
      dataIndex: 'consignee_province',
    }, {
      title: '实际提货时间',
      dataIndex: 'pickup_act_date',
    }, {
      title: '实际交货时间',
      dataIndex: 'deliver_act_date',
    }, {
      title: '回单',
      dataIndex: 'pod_status',
    }, {
      title: '是否入账',
      dataIndex: 'fee_status',
    }];
    return (
      <div>
        <header className="top-bar">
          <div className="tools">
            <Button type="primary" onClick={this.handleSave}>{this.msg('save')}</Button>
          </div>
          <span>{this.msg('createBilling')}</span>
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <span style={handleLableStyle}>{this.msg('partner')}: <strong>{billing.partnerName}</strong></span>
              <span style={handleLableStyle}>{this.msg('range')}: <strong>{moment(billing.beginDate).format('YYYY-MM-DD')} ~ {moment(billing.endDate).format('YYYY-MM-DD')}</strong></span>
              <span style={handleLableStyle}>{this.msg('chooseModel')}: <strong>{this.msg(billing.chooseModel)}</strong></span>
            </div>
            <div className="panel-body">
              <Table dataSource={dataSource} columns={columns} rowKey="id" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
