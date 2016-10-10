import React, { PropTypes } from 'react';
import { Button, InputNumber, Checkbox } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { updateBilling, loadFeesByBillingId } from 'common/reducers/transportBilling';
import TrimSpan from 'client/components/trimSpan';

const formatMsg = format(messages);

const rowSelection = {
  onSelect() {},
};

function fetchData({ state, dispatch, params, cookie }) {
  return dispatch(loadFeesByBillingId({
    billingId: params.billingId,
    pageSize: state.transportBilling.billingFees.pageSize,
    currentPage: state.transportBilling.billingFees.currentPage,
  }));
}

@connectFetch()(fetchData)
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
    billingFees: state.transportBilling.billingFees,
  }),
  { updateBilling, loadFeesByBillingId }
)

export default class CheckBilling extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    billing: PropTypes.object.isRequired,
    billingFees: PropTypes.object.isRequired,
    updateBilling: PropTypes.func.isRequired,
    loadFeesByBillingId: PropTypes.func.isRequired,
  }
  state = {
    changed: false,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleSave = () => {

  }
  render() {
    const { billing, tenantId } = this.props;
    let partnerName = '';
    if (tenantId === billing.srTenantId) {
      partnerName = billing.spName;
    } else if (tenantId === billing.spTenantId) {
      partnerName = billing.srName;
    }
    const handleLableStyle = {
      marginRight: 30,
      lineHeight: 2,
      fontSize: 14,
    };
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadFeesByBillingId(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.currentPage, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
      }),
      getParams: (pagination) => {
        const { pageSize, currentPage } = this.props.billingFees;
        const params = {
          billingId: billing.id,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
        };
        return params;
      },
      remotes: this.props.billingFees,
    });
    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
    }, {
      title: '客户',
      render() {
        return <TrimSpan text={partnerName} maxLen={10} />;
      }
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
      render(o) {
        return (<Checkbox defaultChecked={o === 1} />);
      },
    }, {
      title: '更新',
      dataIndex: 'modify_tenant_id',
    }, {
      title: '更新时间',
      dataIndex: 'modify_time',
      render(o) {
        return o ? moment(o).format('YYYY-MM-DD HH:mm:ss') : '';
      },
    }];
    return (
      <div>
        <header className="top-bar">
          <div className="tools">
            <Button type="primary" onClick={this.handleSave}>{this.msg('accept')}</Button>
          </div>
          <span>{this.msg('checkBilling')}</span>
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <span style={handleLableStyle}>{this.msg('partner')}: <strong>{partnerName}</strong></span>
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
