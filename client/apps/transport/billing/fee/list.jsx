import React, { PropTypes } from 'react';
import { Button, Tag, Icon } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadFees, changeFeesFilter, loadPartners, toggleAdvanceChargeModal } from 'common/reducers/transportBilling';
import TrimSpan from 'client/components/trimSpan';
import { renderConsignLoc } from '../../common/consignLocation';
import { createFilename } from 'client/util/dataTransform';
import ExceptionListPopover from '../../tracking/land/modals/exception-list-popover';
import PreviewPanel from '../../shipment/modals/preview-panel';
import { loadShipmtDetail } from 'common/reducers/shipment';
import ActDate from '../../common/actDate';
import SearchBar from 'client/components/search-bar';
import { PARTNERSHIP_TYPE_INFO } from 'common/constants';
import SpecialChargePopover from './specialChargePopover';
import AdvanceChargeModal from '../modals/advanceChargeModal';

const formatMsg = format(messages);

function fetchData({ state, dispatch }) {
  return dispatch(loadFees({
    tenantId: state.account.tenantId,
    pageSize: state.transportBilling.fees.pageSize,
    currentPage: state.transportBilling.fees.currentPage,
    searchValue: state.transportBilling.fees.searchValue,
    filters: JSON.stringify(state.transportBilling.fees.filters),
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
    loading: state.transportBilling.loading,
  }),
  { loadFees, loadShipmtDetail, changeFeesFilter, loadPartners, toggleAdvanceChargeModal }
)

export default class FeesList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    loadFees: PropTypes.func.isRequired,
    fees: PropTypes.object.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    changeFeesFilter: PropTypes.func.isRequired,
    loadPartners: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    toggleAdvanceChargeModal: PropTypes.func.isRequired,
  }
  state = {
    customers: [],
    carriers: [],
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadPartners(this.props.tenantId, PARTNERSHIP_TYPE_INFO.customer).then((result) => {
      this.setState({ customers: result.data });
    });
    this.props.loadPartners(this.props.tenantId, PARTNERSHIP_TYPE_INFO.transportation).then((result) => {
      this.setState({ carriers: result.data });
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.fees.searchValue !== nextProps.fees.searchValue) {
      this.handleTableLoad(nextProps.fees.searchValue);
    }
  }
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleTableLoad = (searchValue) => {
    this.handleSelectionClear();
    const { tenantId } = this.props;
    const { pageSize, currentPage, filters } = this.props.fees;
    this.props.loadFees({
      tenantId,
      pageSize,
      currentPage,
      searchValue: searchValue !== undefined ? searchValue : this.props.fees.searchValue,
      filters: JSON.stringify(filters),
    });
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleExportExcel = () => {
    window.open(`${API_ROOTS.default}v1/transport/billing/exportFeesExcel/${createFilename('fees')}.xlsx?tenantId=${this.props.tenantId}`);
    // this.handleClose();
  }
  handleSearchInput = (value) => {
    this.props.changeFeesFilter('searchValue', value);
  }
  render() {
    const { customers, carriers } = this.state;
    const { loading } = this.props;
    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
      fixed: 'left',
      width: 150,
      render: (o, record) => {
        return (<a onClick={() => this.props.loadShipmtDetail(record.shipmt_no, this.props.tenantId, 'sr', 'charge', record)}>{record.shipmt_no}</a>);
      },
    }, {
      title: '客户单号',
      dataIndex: 'ref_external_no',
      render: o => <TrimSpan text={o} />,
    }, {
      title: '托运客户',
      dataIndex: 'p_sr_name',
      render(o) {
        return <TrimSpan text={o} maxLen={10} />;
      },
      filters: customers.map(item => ({ text: item.name, value: item.name })),
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
      render(o, record) {
        if (o !== undefined && o !== null) {
          return (
            <span>
              <SpecialChargePopover dispId={record.parent_id} shipmtNo={record.shipmt_no}>{o.toFixed(2)}</SpecialChargePopover>
            </span>
          );
        } else {
          return '';
        }
      },
    }, {
      title: '收款合计',
      key: 'pTotalCharge',
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
      filters: carriers.map(item => ({ text: item.name, value: item.name })),
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
      render(o, record) {
        if (o !== undefined && o !== null) {
          return (
            <span>
              <SpecialChargePopover dispId={record.disp_id} shipmtNo={record.shipmt_no}>{o.toFixed(2)}</SpecialChargePopover>
            </span>
          );
        } else {
          return '';
        }
      },
    }, {
      title: '付款合计',
      key: 'totalCharge',
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
      key: 'profit',
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
      render: (o, record) => {
        return <ActDate actDate={record.pickup_act_date} estDate={record.pickup_est_date} />;
      },
    }, {
      title: '实际交货时间',
      dataIndex: 'deliver_act_date',
      render: (o, record) => {
        return <ActDate actDate={record.deliver_act_date} estDate={record.deliver_est_date} />;
      },
    }, {
      title: '异常',
      dataIndex: 'excp_count',
      render(o, record) {
        return (<ExceptionListPopover
          shipmtNo={record.shipmt_no}
          dispId={record.disp_id}
          excpCount={o}
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
      getParams: (pagination, filters) => {
        const params = {
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          searchValue: this.props.fees.searchValue,
          filters: JSON.stringify(filters),
        };
        return params;
      },
      remotes: this.props.fees,
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <div>
        <header className="top-bar">
          <span>{this.msg('fee')}</span>
          <div className="tools">
            <SearchBar placeholder="输入运单号搜索" onInputSearch={this.handleSearchInput}
              value={this.props.fees.searchValue}
            />
          </div>
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary" onClick={() => this.props.toggleAdvanceChargeModal(true)} >{this.msg('importAdvanceCharge')}</Button>
              <Button style={{ marginLeft: 16 }} onClick={this.handleExportExcel}>{this.msg('export')}</Button>
            </div>
            <div className="panel-body table-panel">
              <Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} rowKey="shipmt_no" scroll={{ x: 2000 }} loading={loading} />
            </div>
          </div>
        </div>
        <PreviewPanel stage="billing" />
        <AdvanceChargeModal data={[]} onOk={this.handleTableLoad} />
      </div>
    );
  }
}
