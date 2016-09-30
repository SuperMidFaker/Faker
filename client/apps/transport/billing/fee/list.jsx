import React, { PropTypes } from 'react';
import { Button, InputNumber } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadFees } from 'common/reducers/transportBilling';
import TrimSpan from 'client/components/trimSpan';
import { renderConsignLoc } from '../../common/consignLocation';

const formatMsg = format(messages);

const rowSelection = {
  onSelect() {},
};

function fetchData({ state, dispatch }) {
  return dispatch(loadFees({
    tenantId: state.account.tenantId,
    pageSize: state.transportBilling.fees.pageSize,
    currentPage: state.transportBilling.fees.currentPage,
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
    fees: state.transportBilling.fees,
  }),
  { loadFees }
)

export default class FeesList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadFees: PropTypes.func.isRequired,
    fees: PropTypes.object.isRequired,
  }

  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleSave = () => {

  }

  render() {

    const handleLableStyle = {
      marginRight: 30,
      lineHeight: 2,
      fontSize: 14,
    };

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
      dataIndex: 'freight_charge',
    }, {
      title: '特殊费用',
      dataIndex: '  special_charge',
    }, {
      title: '代垫费用',
      dataIndex: 'advance_charge',
    }, {
      title: '调整金额',
      dataIndex: 'adjust_charge',
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
      }
    }, {
      title: '目的地',
      dataIndex: 'consignee_province',
      render(o, record) {
        return (<TrimSpan text={renderConsignLoc(record, 'consignee')} maxLen={8} />);
      }
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
    }, {
      title: '是否入账',
      dataIndex: 'fee_status',
    }];

    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadFees(params),
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
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
        };
        return params;
      },
      remotes: this.props.fees,
    });
    return (
      <div>
        <header className="top-bar">
          <span>{this.msg('fee')}</span>
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary">{this.msg('importAdvanceCharge')}</Button>
              <Button style={{ marginLeft: 16 }}>{this.msg('export')}</Button>
            </div>
            <div className="panel-body">
              <Table dataSource={dataSource} columns={columns} rowKey="id"/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
