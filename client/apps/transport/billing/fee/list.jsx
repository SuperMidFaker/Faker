import React, { PropTypes } from 'react';
import { Button, Tag, Icon } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadFees } from 'common/reducers/transportBilling';
import TrimSpan from 'client/components/trimSpan';
import { renderConsignLoc } from '../../common/consignLocation';

const formatMsg = format(messages);

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
  render() {
    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
    }, {
      title: '托运客户',
      dataIndex: 'p_sr_name',
      render(o) {
        return <TrimSpan text={o} maxLen={10} />;
      },
    }, {
      title: '运输费用',
      dataIndex: 'p_freight_charge',
    }, {
      title: '代垫收款',
      dataIndex: 'p_advance_charge',
    }, {
      title: '特殊费用收款',
      dataIndex: 'p_excp_charge',
    }, {
      title: '收款合计',
      dataIndex: 'p_total_charge',
      render(o) {
        return <span style={{ color: '#339966' }}>{o}</span>;
      },
    }, {
      title: '入账状态',
      dataIndex: 'p_status',
      render(o) {
        if (o === 0) {
          return <Tag>未入账</Tag>;
        } else if (o === 1) {
          return <Tag color="yellow">已入账</Tag>;
        } else if (o === 2) {
          return <Tag color="green">已结单</Tag>;
        }
        return '';
      },
    }, {
      title: '承运商',
      dataIndex: 'sp_name',
      render(o) {
        return <TrimSpan text={o} maxLen={10} />;
      },
    }, {
      title: '运输成本',
      dataIndex: 'freight_charge',
    }, {
      title: '代垫付款',
      dataIndex: 'advance_charge',
    }, {
      title: '特殊费用付款',
      dataIndex: 'excp_charge',
    }, {
      title: '付款合计',
      dataIndex: 'total_charge',
      render(o) {
        return <span style={{ color: '#FF0000' }}>{o}</span>;
      },
    }, {
      title: '入账状态',
      dataIndex: 'status',
      render(o) {
        if (o === 0) {
          return <Tag>未入账</Tag>;
        } else if (o === 1) {
          return <Tag color="yellow">已入账</Tag>;
        } else if (o === 2) {
          return <Tag color="green">已结单</Tag>;
        }
        return '';
      },
    }, {
      title: '利润',
      render(_, record) {
        return <span style={{ color: '#FF9900' }}>{(record.p_total_charge - record.total_charge).toFixed(2)}</span>;
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
      title: '异常',
      dataIndex: 'excp_count',
      render(o) {
        if (o === 0) {
          return '';
        }
        return o;
      },
    }, {
      title: '回单',
      dataIndex: 'pod_id',
      render(o) {
        if (!o || o === 0) {
          return '';
        }
        return <Icon type="link" />;
      },
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
            <div className="panel-body table-panel">
              <Table dataSource={dataSource} columns={columns} rowKey="id" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
