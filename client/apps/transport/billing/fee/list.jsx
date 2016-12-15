import React, { PropTypes } from 'react';
import { Button, Tag, Icon, DatePicker } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadFees, changeFeesFilter, loadPartners, showAdvanceModal } from 'common/reducers/transportBilling';
import TrimSpan from 'client/components/trimSpan';
import { renderConsignLoc } from '../../common/consignLocation';
import { createFilename } from 'client/util/dataTransform';
import ExceptionListPopover from '../../tracking/land/modals/exception-list-popover';
import PreviewPanel from '../../shipment/modals/preview-panel';
import { loadShipmtDetail } from 'common/reducers/shipment';
import ActDate from '../../common/actDate';
import SearchBar from 'client/components/search-bar';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import SpecialChargePopover from './specialChargePopover';
import ShipmentAdvanceModal from '../../tracking/land/modals/shipment-advance-modal';

const formatMsg = format(messages);
const RangePicker = DatePicker.RangePicker;

function fetchData({ state, dispatch }) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  const endDate = new Date();
  return dispatch(loadFees({
    tenantId: state.account.tenantId,
    pageSize: state.transportBilling.fees.pageSize,
    currentPage: state.transportBilling.fees.currentPage,
    searchValue: state.transportBilling.fees.searchValue,
    startDate,
    endDate,
    filters: state.transportBilling.fees.filters,
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
    loaded: state.transportBilling.loaded,
  }),
  { loadFees, loadShipmtDetail, changeFeesFilter, loadPartners, showAdvanceModal }
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
    loaded: PropTypes.bool.isRequired,
    showAdvanceModal: PropTypes.func.isRequired,
  }
  state = {
    customers: [],
    carriers: [],
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadPartners(this.props.tenantId, [PARTNER_ROLES.CUS, PARTNER_ROLES.DCUS], [PARTNER_BUSINESSE_TYPES.transport]).then((result) => {
      this.setState({ customers: result.data });
    });
    this.props.loadPartners(this.props.tenantId, [PARTNER_ROLES.SUP], [PARTNER_BUSINESSE_TYPES.transport]).then((result) => {
      this.setState({ carriers: result.data });
    });
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loaded) {
      this.handleTableLoad();
    }
  }
  onDateChange = (value) => {
    const promises = [this.props.changeFeesFilter('startDate', value[0]), this.props.changeFeesFilter('endDate', value[1])];
    Promise.all(promises).then(() => {
      this.handleTableLoad();
    });
  }
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleTableLoad = () => {
    this.handleSelectionClear();
    const { tenantId } = this.props;
    const { pageSize, currentPage, filters, startDate, endDate, searchValue } = this.props.fees;
    this.props.loadFees({
      tenantId,
      pageSize,
      currentPage,
      startDate,
      endDate,
      searchValue,
      filters,
    });
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleExportExcel = () => {
    const { tenantId } = this.props;
    const { filters, startDate, endDate } = this.props.fees;
    window.open(`${API_ROOTS.default}v1/transport/billing/exportFeesExcel/${createFilename('fees')}.xlsx?tenantId=${tenantId}&filters=${
      JSON.stringify(filters)}&startDate=${moment(startDate).format('YYYY-MM-DD 00:00:00')}&endDate=${moment(endDate).format('YYYY-MM-DD 23:59:59')}`);
    // this.handleClose();
  }
  handleSearchInput = (value) => {
    this.props.changeFeesFilter('searchValue', value);
  }
  handleShowShipmentAdvanceModal = (row) => {
    // todo 取parentDisp sr_tenant_id
    this.props.showAdvanceModal({ visible: true, dispId: row.parent_id, shipmtNo: row.shipmt_no,
      transportModeId: row.transport_mode_id, goodsType: row.goods_type,
    });
  }
  render() {
    const { customers, carriers } = this.state;
    const { loading } = this.props;
    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
      fixed: 'left',
      width: 150,
      render: (o, record) => (<a onClick={() => this.props.loadShipmtDetail(record.shipmt_no, this.props.tenantId, 'sr', 'charge', record)}>{record.shipmt_no}</a>),
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
      filters: customers.map(item => ({ text: item.partner_code ? `${item.partner_code} | ${item.name}` : item.name, value: item.partner_id })),
    }, {
      title: '运输收入',
      dataIndex: 'p_total_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '代垫收入',
      dataIndex: 'p_advance_charge',
      render: (o, row) => {
        if (row.p_sr_name) {
          return (
            <a onClick={() => this.handleShowShipmentAdvanceModal(row)}>
              {o ? o.toFixed(2) : '0.00'}
              <Icon type="edit" />
            </a>
          );
        } else {
          return '';
        }
      },
    }, {
      title: '特殊费用收入',
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
      title: '收入合计',
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
        return record.p_status !== null ? pTotalCharge.toFixed(2) : '';
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
      filters: carriers.map(item => ({ text: item.partner_code ? `${item.partner_code} | ${item.name}` : item.name, value: item.partner_id })),
    }, {
      title: '运输成本',
      dataIndex: 'total_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '代垫成本',
      dataIndex: 'advance_charge',
      render(o) {
        return o ? o.toFixed(2) : '';
      },
    }, {
      title: '特殊费用成本',
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
      title: '成本合计',
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
        return record.status !== null ? totalCharge.toFixed(2) : '';
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
      title: '盈亏',
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
        const profit = pTotalCharge - totalCharge;
        if (profit < 0) {
          return <span style={{ color: '#FF0000' }}>{profit.toFixed(2)}</span>;
        }
        return <span style={{ color: '#339966' }}>{profit.toFixed(2)}</span>;
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
      render: (o, record) => <ActDate actDate={record.pickup_act_date} estDate={record.pickup_est_date} />,
    }, {
      title: '实际交货时间',
      dataIndex: 'deliver_act_date',
      render: (o, record) => <ActDate actDate={record.deliver_act_date} estDate={record.deliver_est_date} />,
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
        const { searchValue, startDate, endDate } = this.props.fees;
        const params = {
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          searchValue,
          startDate: moment(startDate).format('YYYY-MM-DD 00:00:00'),
          endDate: moment(endDate).format('YYYY-MM-DD 23:59:59'),
          filters,
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
    const { startDate, endDate } = this.props.fees;
    return (
      <div>
        <header className="top-bar">
          <span>{this.msg('fee')}</span>
        </header>
        <div className="top-bar-tools">
          <SearchBar placeholder="输入运单号搜索" onInputSearch={this.handleSearchInput}
            value={this.props.fees.searchValue}
          />
        </div>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <Button onClick={this.handleExportExcel}>{this.msg('export')}</Button>
              <div style={{ float: 'right' }}>
                <RangePicker style={{ width: 200 }} value={[moment(startDate), moment(endDate)]}
                  onChange={this.onDateChange}
                />
              </div>
            </div>
            <div className="panel-body table-panel">
              <Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} rowKey="shipmt_no" scroll={{ x: 2000 }} loading={loading} />
            </div>
          </div>
        </div>
        <PreviewPanel stage="billing" />
        <ShipmentAdvanceModal />
      </div>
    );
  }
}
