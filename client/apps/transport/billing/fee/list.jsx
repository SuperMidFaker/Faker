import React, { PropTypes } from 'react';
import { Button, Tag, Icon, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadFees, importAdvanceCharge } from 'common/reducers/transportBilling';
import TrimSpan from 'client/components/trimSpan';
import { renderConsignLoc } from '../../common/consignLocation';
import { createFilename } from 'client/util/dataTransform';
import ExceptionListPopover from '../../tracking/land/modals/exception-list-popover';

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
    loginId: state.account.loginId,
    loginName: state.account.username,
    fees: state.transportBilling.fees,
  }),
  { loadFees, importAdvanceCharge }
)

export default class FeesList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    loadFees: PropTypes.func.isRequired,
    fees: PropTypes.object.isRequired,
    importAdvanceCharge: PropTypes.func.isRequired,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleImportAdvanceCharge = () => {
    const { tenantId, loginId, loginName, fees } = this.props;
    this.props.importAdvanceCharge({ tenantId, loginId, loginName }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        message.info('导入成功');
        this.props.loadFees({
          tenantId,
          pageSize: fees.pageSize,
          currentPage: fees.currentPage,
        });
      }
    });
  }
  handleExportExcel = () => {
    window.open(`${API_ROOTS.default}v1/transport/billing/exportFeesExcel/${createFilename('fees')}.xlsx?tenantId=${this.props.tenantId}`);
    this.handleClose();
  }
  render() {
    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
      fixed: 'left',
      width: 150,
    }, {
      title: '托运客户',
      dataIndex: 'p_sr_name',
      render(o) {
        return <TrimSpan text={o} maxLen={10} />;
      },
    }, {
      title: '运输费用',
      dataIndex: 'p_total_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '代垫收款',
      dataIndex: 'p_advance_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '特殊费用收款',
      dataIndex: 'p_excp_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '收款合计',
      render(o, record) {
        let pTotalCharge = 0;
        if (record.p_advance_charge) {
          pTotalCharge += record.p_advance_charge;
        }
        if (record.p_excp_charge) {
          pTotalCharge += record.p_excp_charge;
        }
        if (record.p_total_charge) {
          pTotalCharge += record.p_total_charge;
        }
        return record.p_status !== null ? (<span style={{ color: '#339966' }}>{pTotalCharge.toFixed(2)}</span>) : '';
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
      dataIndex: 'total_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '代垫付款',
      dataIndex: 'advance_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '特殊费用付款',
      dataIndex: 'excp_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '付款合计',
      render(o, record) {
        let totalCharge = 0;
        if (record.advance_charge) {
          totalCharge += record.advance_charge;
        }
        if (record.excp_charge) {
          totalCharge += record.excp_charge;
        }
        if (record.total_charge) {
          totalCharge += record.total_charge;
        }
        return record.status !== null ? (<span style={{ color: '#FF0000' }}>{totalCharge.toFixed(2)}</span>) : '';
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
        let pTotalCharge = 0;
        if (record.p_advance_charge) {
          pTotalCharge += record.p_advance_charge;
        }
        if (record.p_excp_charge) {
          pTotalCharge += record.p_excp_charge;
        }
        if (record.p_total_charge) {
          pTotalCharge += record.p_total_charge;
        }
        let totalCharge = 0;
        if (record.advance_charge) {
          totalCharge += record.advance_charge;
        }
        if (record.excp_charge) {
          totalCharge += record.excp_charge;
        }
        if (record.total_charge) {
          totalCharge += record.total_charge;
        }
        return <span style={{ color: '#FF9900' }}>{(pTotalCharge - totalCharge).toFixed(2)}</span>;
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
      title: '异常',
      dataIndex: 'excp_count',
      render(o, record) {
        return (<ExceptionListPopover
          shipmtNo={record.shipmt_no}
          dispId={record.disp_id}
          parentId={record.parent_id}
          excpCount={o}
          onShowExcpModal={() => {}}
        />);
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
              <Button type="primary" >{this.msg('importAdvanceCharge')}</Button>
              <Button style={{ marginLeft: 16 }} onClick={this.handleExportExcel}>{this.msg('export')}</Button>
            </div>
            <div className="panel-body table-panel">
              <Table dataSource={dataSource} columns={columns} rowKey="id" scroll={{ x: 2000 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
