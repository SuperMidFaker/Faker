import React, { PropTypes } from 'react';
import { Button, InputNumber, Icon, Checkbox, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadFeesByChooseModal, createBilling } from 'common/reducers/transportBilling';
import { renderConsignLoc } from '../../common/consignLocation';
import TrimSpan from 'client/components/trimSpan';

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
    billingFees: state.transportBilling.billingFees,
  }),
  { loadFeesByChooseModal, createBilling }
)

export default class CreateBilling extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
    billing: PropTypes.object.isRequired,
    billingFees: PropTypes.object.isRequired,
    loadFeesByChooseModal: PropTypes.func.isRequired,
    createBilling: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    changed: false,
  }
  componentDidMount() {
    const { tenantId, loginId, type } = this.props;
    const { beginDate, endDate, chooseModel, partnerId, partnerTenantId } = this.props.billing;
    const { pageSize, currentPage } = this.props.billingFees;
    this.props.loadFeesByChooseModal({
      type,
      beginDate: moment(beginDate).format('YYYY-MM-DD 00:00:00'),
      endDate: moment(endDate).format('YYYY-MM-DD 23:59:59'),
      chooseModel,
      partnerId,
      partnerTenantId,
      tenantId,
      pageSize,
      currentPage,
    });
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleSave = () => {
    const { loginId, tenantId, type } = this.props;
    const { beginDate, endDate, chooseModel, partnerTenantId, name, cancelCharge, freightCharge,
    advanceCharge, excpCharge, adjustCharge, totalCharge } = this.props.billing;
    if (this.props.billingFees.data.length > 0) {
      const fees = this.props.billingFees.data.filter((item) => {
        return true; //item[`${type}_status`] === 1;
      });
      const fee = fees[0];
      this.props.createBilling({
        type, tenantId, loginId, name, chooseModel, beginDate: moment(beginDate).format('YYYY-MM-DD 00:00:00'),
        endDate: moment(endDate).format('YYYY-MM-DD 23:59:59'), cancelCharge, freightCharge,
        advanceCharge, excpCharge, adjustCharge, totalCharge, srTenantId: fee.sr_tenant_id, srName: fee.sr_name,
        spTenantId: fee.sp_tenant_id, spName: fee.sp_name, toTenantId: partnerTenantId,
        shipmtCount: fees.length, fees,
      }).then(result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.context.router.push(`/transport/billing/${this.props.type}`);
        }
      });
    } else {
      message.error('此条件下没有运单');
    }
    
  }
  handleChangeAdjustCharges = (feeId, adjustCharges) => {
    console.log(feeId, adjustCharges);
  }
  render() {
    const { tenantId, loginId, type, billing } = this.props;
    const { beginDate, endDate, chooseModel, partnerId, partnerTenantId } = this.props.billing;

    const handleLableStyle = {
      marginRight: 30,
      lineHeight: 2,
      fontSize: 14,
    };
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadFeesByChooseModal(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.currentPage, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
      }),
      getParams: (pagination) => {
        const params = {
          type,
          beginDate: moment(beginDate).format('YYYY-MM-DD 00:00:00'),
          endDate: moment(endDate).format('YYYY-MM-DD 23:59:59'),
          chooseModel,
          partnerId,
          partnerTenantId,
          tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
        };
        return params;
      },
      remotes: this.props.billingFees,
    });
    let sourceType = 'sr';
    let partnerSourceType = 'sp';
    if (type === 'payable') {
      sourceType = 'sr';
      partnerSourceType = 'sp';
    } else if (type === 'receivable') {
      sourceType = 'sp';
      partnerSourceType = 'sr';
    }
    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
    }, {
      title: '客户',
      dataIndex: `${partnerSourceType}_name`,
      render(o) {
        return <TrimSpan text={o} maxLen={10} />;
      },
    }, {
      title: '费率',
      dataIndex: 'charge_gradient',
    }, {
      title: '计费量',
      dataIndex: 'charg_amount',
    }, {
      title: '运费',
      dataIndex: 'freight_charge',
    }, {
      title: '特殊费用',
      dataIndex: 'excp_charge',
    }, {
      title: '代垫费用',
      dataIndex: 'advance_charge',
    }, {
      title: '调整金额',
      dataIndex: 'adjust_charge',
      render: (o, record) => {
        return (<InputNumber defaultValue={o} step={0.01} onChange={value => this.handleChangeAdjustCharges(record.id, value)} />);
      },
    }, {
      title: '最终费用',
      dataIndex: 'total_charge',
    }, {
      title: '异常',
      dataIndex: 'excp_count',
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
      title: '是否入账',
      dataIndex: `${this.props.type}_status`,
      render(o) {
        return (<Checkbox defaultChecked={o === 1} />);
      },
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
