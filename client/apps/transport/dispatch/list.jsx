import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Radio, Icon, Layout, message, Select, Modal, Alert } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import TrimSpan from 'client/components/trimSpan';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadTable,
         doSend,
         doReturn,
         segmentCancelRequest,
         segmentCancelCheckRequest,
         loadExpandList,
         loadShipmtsGrouped,
         loadShipmtsGroupedSub,
         loadSegRq,
         removeGroupedSubShipmt,
         changeDockStatus } from 'common/reducers/transportDispatch';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import Condition from './condition';
import DispatchDock from './dispatchDock';
import SegmentDock from './segmentDock';
import ShipmtnoColumn from '../common/shipmtnoColumn';
import { loadShipmtDetail } from 'common/reducers/shipment';
import PreviewPanel from '../shipment/modals/preview-panel';
import { renderConsignLoc } from '../common/consignLocation';
import RevokejectModal from '../shipment/modals/revoke-reject';
import SearchBar from 'client/components/search-bar';
import AdvancedSearchBar from '../common/advanced-search-bar';
import MyShipmentsSelect from '../common/myShipmentsSelect';

const { Header, Content } = Layout;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const formatMsg = format(messages);

function fetch({ state, dispatch, cookie }) {
  return dispatch(loadSegRq(cookie, {
    tenantId: state.account.tenantId,
  }));
}

@connectFetch()(fetch)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    avatar: state.account.profile.avatar,
    shipmentlist: state.transportDispatch.shipmentlist,
    filters: { ...state.transportDispatch.filters, loginId: state.account.loginId },
    loading: state.transportDispatch.loading,
    dispatched: state.transportDispatch.dispatched,
    expandList: state.transportDispatch.expandList,
    cond: state.transportDispatch.cond,
    dispDockShow: state.transportDispatch.dispDockShow,
    segDockShow: state.transportDispatch.segDockShow,
    shipmts: state.transportDispatch.shipmts,
    loaded: state.transportDispatch.loaded,
  }),
  { loadTable,
    doReturn,
    doSend,
    segmentCancelRequest,
    segmentCancelCheckRequest,
    loadExpandList,
    loadShipmtsGrouped,
    loadShipmtsGroupedSub,
    removeGroupedSubShipmt,
    loadShipmtDetail,
    changeDockStatus })
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'dispatch' })
export default class DispatchList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    filters: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    shipmentlist: PropTypes.object.isRequired,
    loadTable: PropTypes.func.isRequired,
    doSend: PropTypes.func.isRequired,
    doReturn: PropTypes.func.isRequired,
    segmentCancelRequest: PropTypes.func.isRequired,
    segmentCancelCheckRequest: PropTypes.func.isRequired,
    loadShipmtsGroupedSub: PropTypes.func.isRequired,
    loadShipmtsGrouped: PropTypes.func.isRequired,
    removeGroupedSubShipmt: PropTypes.func.isRequired,
    loadExpandList: PropTypes.func.isRequired,
    dispatched: PropTypes.bool.isRequired,
    expandList: PropTypes.object.isRequired,
    cond: PropTypes.object.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    changeDockStatus: PropTypes.func.isRequired,
    dispDockShow: PropTypes.bool.isRequired,
    segDockShow: PropTypes.bool.isRequired,
    shipmts: PropTypes.array.isRequired,
    loaded: PropTypes.bool.isRequired,
  }
  state = {
    selectedRowKeys: [],
    panelHeader: [],
    advancedSearchVisible: false,
    searchValue: '',
  }

  componentWillMount() {
    const { filters } = this.props;
    this.setState({ searchValue: filters.shipmt_no || '' });
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loaded && !nextProps.loading) {
      const { filters } = this.props;
      this.handleStatusChange({ target: { value: filters.status } });
    }
  }
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadTable(null, params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        filters: JSON.stringify(this.props.filters),
      };
      return params;
    },
    remotes: this.props.shipmentlist,
  })

  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  commonCols = [{
    title: this.msg('packageNum'),
    dataIndex: 'total_count',
    width: 40,
  }, {
    title: this.msg('shipWeight'),
    dataIndex: 'total_weight',
    width: 60,
  }, {
    title: this.msg('shipVolume'),
    dataIndex: 'total_volume',
    width: 60,
  }, {
    title: this.msg('shipPickupDate'),
    dataIndex: 'pickup_est_date',
    width: 90,
    render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD'),
  }, {
    title: this.msg('shipConsigner'),
    dataIndex: 'consigner_name',
    width: 120,
    render: o => <TrimSpan text={o} maxLen={8} />,
  }, {
    title: this.msg('consignerPlace'),
    width: 120,
    render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consigner')} maxLen={8} />,
  }, {
    title: this.msg('consignerAddr'),
    dataIndex: 'consigner_addr',
    width: 140,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('shipDeliveryDate'),
    dataIndex: 'deliver_est_date',
    width: 90,
    render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD'),
  }, {
    title: this.msg('shipConsignee'),
    dataIndex: 'consignee_name',
    width: 120,
    render: o => <TrimSpan text={o} maxLen={8} />,
  }, {
    title: this.msg('consigneePlace'),
    width: 120,
    render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consignee')} maxLen={8} />,
  }, {
    title: this.msg('consigneeAddr'),
    dataIndex: 'consignee_addr',
    width: 140,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }];
  buildCols(sub) {
    const { status, origin } = this.props.filters;
    const s = status;
    let t = this.msg('shipNo');
    let fixedLeft = 'left';
    let fixedRight = 'right';
    if (origin) {
      t = this.msg('originShipNo');
      fixedLeft = false;
      fixedRight = false;
    }
    if (sub === 'sub') {
      t = this.msg('segmentShipNo');
      fixedLeft = false;
      fixedRight = false;
    }
    if (sub === 'merge') {
      fixedLeft = false;
      fixedRight = false;
    }
    let cols = [{
      title: t,
      dataIndex: 'shipmt_no',
      fixed: fixedLeft,
      width: 150,
      render: (o, record) => {
        if (!sub) {
          return (
            <ShipmtnoColumn shipmtNo={record.shipmt_no} publicKey={record.public_key} shipment={record} onClick={this.handleShipmtPreview} />
          );
        }
        return (<span>{o}</span>);
      },
    }, {
      title: this.msg('refCustomerNo'),
      dataIndex: 'ref_external_no',
      width: 80,
      render: o => <TrimSpan text={o} />,
    }];
    if (s === 'waiting') {
      cols.push({
        title: this.msg('shipRequirement'),
        dataIndex: 'sr_name',
        width: 200,
        render: o => <TrimSpan text={o} maxLen={15} />,
      }, {
        title: this.msg('shipMode'),
        dataIndex: 'transport_mode',
        width: 80,
      });
      cols = cols.concat(this.commonCols);
      cols.push({
        title: this.msg('shipAcceptTime'),
        dataIndex: 'acpt_time',
        width: 100,
        render: (text, record) => (record.acpt_time ?
         moment(record.acpt_time).format('MM-DD HH:mm') : ' '),
      }, {
        title: this.msg('spDispLoginName'),
        dataIndex: 'sp_disp_login_name',
        width: 60,
      }, {
        title: this.msg('shipmtOP'),
        width: 100,
        fixed: fixedRight,
        render: (o, record) => {
          if (sub === 'merge') {
            return (<span><a role="button" onClick={() => this.handleRemoveShipmt(record)}>
              {this.msg('btnTextRemove')}
            </a></span>);
          }
          if (origin) {
            if (record.segmented === 1 && sub !== 'sub') {
              return (<span>
                <a role="button" onClick={ev => this.handleSegmentCancelConfirm(record, ev)}>
                  {this.msg('btnTextSegmentCancel')}
                </a></span>);
            } else {
              return (<span />);
            }
          }
          return (
            <PrivilegeCover module="transport" feature="dispatch" action="create">
              <span>
                <a role="button" onClick={ev => this.handleDispatchDockShow(record, ev)}>
                  {this.msg('btnTextDispatch')}
                </a>
                <span className="ant-divider" />
                <a role="button" onClick={ev => this.handleSegmentDockShow(record, ev)}>
                  {this.msg('btnTextSegment')}
                </a>
              </span>
            </PrivilegeCover>
          );
        },
      });
    } else if (s === 'dispatching' || s === 'dispatched') {
      cols.push({
        title: this.msg('shipSp'),
        dataIndex: 'sp_name',
        width: 180,
        render: (o, record) => {
          if (record.sp_name) {
            const spSpan = <TrimSpan text={record.sp_name} maxLen={10} />;
            if (record.sp_tenant_id > 0) {
          // todo pure css circle
              return (
                <span>
                  <i className="zmdi zmdi-circle mdc-text-green" />
                  {spSpan}
                </span>
              );
            } else if (record.sp_tenant_id === -1) {
              return (
                <span>
                  <i className="zmdi zmdi-circle mdc-text-grey" />
                  {spSpan}
                </span>
              );
            } else {
              return spSpan;
            }
          } else {
            return this.msg('ownFleet');
          }
        },
      }, {
        title: this.msg('shipVehicle'),
        dataIndex: 'task_vehicle',
        width: 80,
      });
      cols = cols.concat(this.commonCols);
      let timetitle = this.msg('shipDispTime');
      if (s === 'dispatched') {
        timetitle = this.msg('shipSendTime');
      }
      cols.push(
        /* {
        title: this.msg('shipPod'),
        dataIndex: 'pod_type',
        width: 40,
        render: (text) => {
          switch (text) {
            case 'qrPOD':
              return (<Tooltip title="扫码签收回单"><Icon type="qrcode" /></Tooltip>);
            case 'ePOD':
              return (<Tooltip title="拍摄上传回单"><Icon type="scan" /></Tooltip>);
            default:
              return (<Tooltip title="无须上传回单"><Icon type="file-excel" /></Tooltip>);
          }
        },
      }, {
        title: this.msg('shipFreightCharge'),
        dataIndex: 'freight_charge',
        width: 60,
        render: text => {
          if (text > 0) {
            return (<span>{text}</span>);
          }
        },
      }, */
        {
          title: timetitle,
          dataIndex: 'disp_time',
          width: 100,
          render: (text, record) => (record.disp_time ?
         moment(record.disp_time).format('MM-DD HH:mm') : ' '),
        }, {
          title: this.msg('spDispLoginName'),
          dataIndex: 'sp_disp_login_name',
          width: 60,
        }, {
          title: this.msg('shipmtOP'),
          width: 100,
          fixed: fixedRight,
          render: (o, record) => {
            if (s === 'dispatched') {
              if (record.disp_status === 2) {
                return (
                  <PrivilegeCover module="transport" feature="dispatch" action="edit">
                    <span>
                      <a role="button" onClick={ev => this.handleShipmtReturn(record, ev)}>
                        {this.msg('btnTextReturn')}
                      </a>
                    </span>
                  </PrivilegeCover>
                );
              }
              return (<span />);
            }
            return (
              <PrivilegeCover module="transport" feature="dispatch" action="edit">
                <span>
                  <a role="button" onClick={ev => this.handleShipmtSend(record, ev)}>
                    {this.msg('btnTextSend')}
                  </a>
                  <span className="ant-divider" />
                  <a role="button" onClick={ev => this.handleShipmtReturn(record, ev)}>
                    {this.msg('btnTextReturn')}
                  </a>
                </span>
              </PrivilegeCover>
            );
          },
        });
    }

    return cols;
  }

  buildConditionCols() {
    const cols = [{
      title: this.msg('shipNoCount'),
      dataIndex: 'count',
      width: 100,
    }, {
      title: this.msg('shipConsigner'),
      dataIndex: 'consigner_name',
      width: 180,
    }, {
      title: this.msg('consignerPlace'),
      width: 120,
      render: (o, record) => renderConsignLoc(record, 'consigner'),
    }, {
      title: this.msg('consignerAddr'),
      dataIndex: 'consigner_addr',
      width: 200,
    }, {
      title: this.msg('shipConsignee'),
      dataIndex: 'consignee_name',
      width: 180,
    }, {
      title: this.msg('consigneePlace'),
      width: 120,
      render: (o, record) => renderConsignLoc(record, 'consignee'),
    }, {
      title: this.msg('consigneeAddr'),
      dataIndex: 'consignee_addr',
      width: 200,
    }, {
      title: this.msg('shipmtOP'),
      width: 100,
      render: (o, record) => (
        <PrivilegeCover module="transport" feature="dispatch" action="create">
          <span>
            <a role="button" onClick={ev => this.handleCondDispatchDockShow(record, ev)}>
              {this.msg('btnTextDispatch')}
            </a>
            <span className="ant-divider" />
            <a role="button" onClick={ev => this.handleCondSegmentDockShow(record, ev)}>
              {this.msg('btnTextSegment')}
            </a>
          </span>
        </PrivilegeCover>
        ),
    }];

    return cols;
  }

  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }

  msgWrapper = s => this.msg(s)

  handleShipmtPreview = (row) => {
    this.props.loadShipmtDetail(row.shipmt_no, this.props.tenantId, 'sp', 'detail', row).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }

  handleStatusChange = (ev) => {
    const { shipmentlist, tenantId, filters } = this.props;
    const tmp = Object.assign({}, filters);
    tmp.status = ev.target.value;
    tmp.origin = 0;

    this.props.loadTable(null, {
      tenantId,
      filters: JSON.stringify(tmp),
      pageSize: shipmentlist.pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.handlePanelHeaderChange();
      }
    });
  }

  handleTableLoad = (newFilters) => {
    const { shipmentlist, tenantId, filters } = this.props;
    const tmp = Object.assign({}, filters);

    this.props.loadTable(null, {
      tenantId,
      filters: JSON.stringify(newFilters || tmp),
      pageSize: shipmentlist.pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.handlePanelHeaderChange();
      }
    });
  }

  handlePanelHeaderChange() {
    const { status, origin } = this.props.filters;
    const { type } = this.props.cond;
    const panelHeader = [];
    if (type !== 'none') {
      let str = '已经按线路汇总';
      if (type === 'consigner') {
        str = '已经按发货汇总';
      } else if (type === 'consignee') {
        str = '已经按到货汇总';
      }
      const tmp = (<div className="dispatch-condition-head">
        <Button onClick={this.handleOriginShipmtsReturn}>
          <span>{this.msg('btnTextReturnList')}</span>
          <Icon type="eye-o" />
        </Button>
        <Alert message={str} type="info" showIcon />
      </div>);
      panelHeader.push(tmp);
    } else if (origin) {
      panelHeader.push((<span className="ant-divider" style={{ width: '0px' }} />),
      (<Button onClick={this.handleOriginShipmtsReturn}><span>{this.msg('btnTextReturnList')}</span><Icon type="eye-o" /></Button>));
    } else if (status === 'waiting') {
      panelHeader.push((<Condition msg={this.msgWrapper} onConditionChange={this.handleConditionChange} />),
        (<Button onClick={this.handleOriginShipmts}><span>{this.msg('btnTextOriginShipments')}</span><Icon type="eye" /></Button>));
    } else if (status === 'dispatched') {
      panelHeader.push((<Select defaultValue="0" style={{ width: 90 }} onChange={this.handleDayChange}>
        <Option value="0">最近七天</Option>
        <Option value="1">最近一月</Option>
      </Select>),
        (<Button onClick={this.handleExportDispShipmts} icon="export"><span>{this.msg('btnTextExport')}</span></Button>));
    }

    this.setState({ panelHeader, selectedRowKeys: [] });
    this.props.changeDockStatus({ dispDockShow: false, segDockShow: false, shipmts: [] });
  }

  handleSearch = (searchVal) => {
    const filters = this.mergeFilters(this.props.filters, 'shipmt_no', searchVal);
    this.handleTableLoad(filters);
    this.setState({ searchValue: searchVal });
  }

  handleAdvancedSearch = (searchVals) => {
    let filters = this.props.filters;
    Object.keys(searchVals).forEach((key) => {
      filters = this.mergeFilters(filters, key, searchVals[key]);
    });
    this.handleTableLoad(filters);
    this.showAdvancedSearch(false);
  }

  mergeFilters(curFilters, name, value) {
    const newFilters = {};
    Object.keys(curFilters).forEach((key) => {
      if (key !== name) {
        newFilters[key] = curFilters[key];
      }
    });
    if (value !== null && value !== undefined && value !== '') {
      newFilters[name] = value;
    }
    return newFilters;
  }

  handleDispatchDockShow(shipmt, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({ selectedRowKeys: [shipmt.key] });
    this.props.changeDockStatus({ dispDockShow: true, shipmts: [shipmt] });
  }

  handleBatchDockShow(type) {
    const { shipmentlist } = this.props;
    const { selectedRowKeys } = this.state;
    const shipmts = [];
    shipmentlist.data.forEach((s) => {
      if (selectedRowKeys.indexOf(s.key) > -1) {
        shipmts.push(s);
      }
    });
    if (type === 'dispatch') {
      this.props.changeDockStatus({ dispDockShow: true, shipmts });
    } else {
      this.props.changeDockStatus({ segDockShow: true, shipmts });
    }
  }

  handleDispatchDockClose = (reload) => {
    if (typeof reload === 'boolean') {
      this.handleStatusChange({ target: { value: 'waiting' } });
    } else {
      this.setState({ selectedRowKeys: [] });
      this.props.changeDockStatus({ dispDockShow: false, shipmts: [] });
    }
  }

  handleSegmentDockShow(shipmt, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({ selectedRowKeys: [shipmt.key] });
    this.props.changeDockStatus({ segDockShow: true, shipmts: [shipmt] });
  }

  handleSegmentDockClose = (reload) => {
    if (typeof reload === 'boolean') {
      this.handleStatusChange({ target: { value: 'waiting' } });
    } else {
      this.setState({ selectedRowKeys: [] });
      this.props.changeDockStatus({ segDockShow: false, shipmts: [] });
    }
  }

  handleSegmentCancelConfirm = (shipmt, ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const { tenantId } = this.props;
    this.props.segmentCancelCheckRequest(null, {
      tenantId,
      shipmtNo: shipmt.shipmt_no,
    }).then((rs) => {
      if (!rs.data) {
        message.error(`${shipmt.shipmt_no}-分段运单中已存在预分配，不能取消分段，必须分配退回后才能操作！`, 5);
      } else {
        Modal.confirm({
          content: `确定取消对运单编号为【${shipmt.shipmt_no}】的分段？`,
          okText: this.msg('btnTextOk'),
          cancelText: this.msg('btnTextCancel'),
          onOk: () => {
            this.props.segmentCancelRequest(null, {
              tenantId,
              shipmtNo: shipmt.shipmt_no,
            }).then((result) => {
              if (result.error) {
                message.error(result.error.message, 5);
              } else {
                this.handleOriginShipmts();
              }
            });
          },
        });
      }
    });
  }

  handleShipmtBatchSend() {
    const { shipmentlist } = this.props;
    const { selectedRowKeys } = this.state;
    const count = selectedRowKeys.length;
    const list = [];
    shipmentlist.data.forEach((s) => {
      if (selectedRowKeys.indexOf(s.key) > -1) {
        list.push({
          dispId: s.key,
          shipmtNo: s.shipmt_no,
          parentId: s.parent_id,
          sp_tenant_id: s.sp_tenant_id,
          sr_name: s.sr_name,
          status: s.status,
          consigner_province: s.consigner_province,
          consigner_city: s.consigner_city,
          consigner_district: s.consigner_district,
          consignee_province: s.consignee_province,
          consignee_city: s.consignee_city,
          consignee_district: s.consignee_district,
        });
      }
    });

    Modal.confirm({
      title: '确认批量发送运单',
      content: `将已选定的${count}个运单发送给承运商？`,
      okText: this.msg('btnTextOk'),
      cancelText: this.msg('btnTextCancel'),
      onOk: () => {
        if (count === 0) {
          return;
        }
        const { tenantId, loginId, avatar, loginName } = this.props;
        this.props.doSend(null, {
          tenantId,
          loginId,
          avatar,
          loginName,
          list: JSON.stringify(list),
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 5);
          } else {
            this.handleStatusChange({ target: { value: 'dispatching' } });
          }
        });
      },
    });
  }

  handleShipmtSend(shipmt, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    let msg = `将【${shipmt.shipmt_no}】运单发送给【${shipmt.sp_name}】？`;
    if (!shipmt.sp_tenant_id && shipmt.task_id > 0) {
      msg = `将【${shipmt.shipmt_no}】运单发送给【${shipmt.task_vehicle}】？`;
    }
    Modal.confirm({
      title: '确认发送运单',
      content: msg,
      okText: this.msg('btnTextOk'),
      cancelText: this.msg('btnTextCancel'),
      onOk: () => {
        const { tenantId, loginId, avatar, loginName } = this.props;
        this.props.doSend(null, {
          tenantId,
          loginId,
          avatar,
          loginName,
          list: JSON.stringify([{ dispId: shipmt.key,
            shipmtNo: shipmt.shipmt_no,
            sp_tenant_id: shipmt.sp_tenant_id,
            sr_name: shipmt.sr_name,
            status: shipmt.status,
            consigner_province: shipmt.consigner_province,
            consigner_city: shipmt.consigner_city,
            consigner_district: shipmt.consigner_district,
            consignee_province: shipmt.consignee_province,
            consignee_city: shipmt.consignee_city,
            consignee_district: shipmt.consignee_district,
            parentId: shipmt.parent_id }]),
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 5);
          } else {
            this.handleStatusChange({ target: { value: 'dispatching' } });
          }
        });
      },
    });
  }

  handleShipmtReturn(shipmt, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const { status } = this.props.filters;
    let msg = `将预分配给【${shipmt.sp_name}】的【${shipmt.shipmt_no}】运单退回吗？`;
    if (!shipmt.sp_tenant_id && shipmt.task_id > 0) {
      msg = `将预分配给【${shipmt.task_vehicle}】的【${shipmt.shipmt_no}】运单退回吗？`;
    }

    Modal.confirm({
      title: '确认退回运单',
      content: msg,
      okText: this.msg('btnTextOk'),
      cancelText: this.msg('btnTextCancel'),
      onOk: () => {
        const { tenantId } = this.props;
        this.props.doReturn(null, {
          tenantId,
          dispId: shipmt.key,
          parentId: shipmt.parent_id,
          shipmtNo: shipmt.shipmt_no,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 5);
          } else {
            this.handleStatusChange({ target: { value: status } });
          }
        });
      },
    });
  }

  handleDayChange = () => {

  }

  handleExportDispShipmts = () => {

  }

  handleConditionChange = (condition) => {
    const { tenantId, shipmentlist } = this.props;
    this.props.loadShipmtsGrouped(null, {
      tenantId,
      filters: JSON.stringify(condition),
      pageSize: shipmentlist.pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.handlePanelHeaderChange();
      }
    });
  }

  handleOriginShipmtsReturn = () => {
    this.handleStatusChange({ target: { value: 'waiting' } });
  }

  handleOriginShipmts = () => {
    const { shipmentlist, tenantId, filters } = this.props;
    const tmp = Object.assign({}, filters);
    tmp.origin = 1;

    this.props.loadTable(null, {
      tenantId,
      filters: JSON.stringify(tmp),
      pageSize: shipmentlist.pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.handlePanelHeaderChange();
      }
    });
  }

  handleExpandList = (row) => {
    const { tenantId } = this.props;
    if (!this.props.expandList[row.shipmt_no]) {
      this.props.loadExpandList(null, {
        tenantId,
        shipmtNo: row.shipmt_no,
        srTenantId: row.sr_tenant_id,
        spTenantId: row.sp_tenant_id,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 5);
        }
      });
    }
    const ccols = this.buildCols('sub');

    return (<Table columns={ccols} pagination={false} dataSource={this.props.expandList[row.shipmt_no] || []}
      size="small"
    />);
  }

  handleRemoveShipmt = (row) => {
    this.props.removeGroupedSubShipmt(row.parentKey, row.shipmt_no);
  }

  genFilters(row) {
    const { type, consignerStep, consigneeStep } = this.props.cond;
    const filters = {};
    let cer = false;
    let cee = false;
    if (type === 'subline') {
      cer = true;
      cee = true;
    } else if (type === 'consigner') {
      cer = true;
    } else {
      cee = true;
    }
    if (cer) {
      switch (consignerStep) {
        case 20: {
          filters.consigner_province = row.consigner_province;
          filters.consigner_city = row.consigner_city;
        }
          break;
        case 40:
          filters.consigner_district = row.consigner_district;
          break;
        case 60:
          filters.consigner_addr = row.consigner_addr;
          break;
        case 80: {
          filters.consigner_addr = row.consigner_addr;
          filters.consigner_name = row.consigner_name;
        }
          break;
        default:
          filters.consigner_province = row.consigner_province;
          break;
      }
    }
    if (cee) {
      switch (consigneeStep) {
        case 20: {
          filters.consignee_province = row.consignee_province;
          filters.consignee_city = row.consignee_city;
        }
          break;
        case 40:
          filters.consignee_district = row.consignee_district;
          break;
        case 60:
          filters.consignee_addr = row.consignee_addr;
          break;
        case 80: {
          filters.consignee_addr = row.consignee_addr;
          filters.consignee_name = row.consignee_name;
        }
          break;
        default:
          filters.consignee_province = row.consignee_province;
          break;
      }
    }
    return filters;
  }

  handleCondDispatchDockShow = (row, ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const { tenantId } = this.props;
    const filters = this.genFilters(row);
    if (!this.props.expandList[row.key]) {
      this.props.loadShipmtsGroupedSub(null, {
        tenantId,
        filters: JSON.stringify(filters),
        shipmtNo: row.key,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 5);
        } else {
          this.props.changeDockStatus({ dispDockShow: true, shipmts: result.data });
        }
      });
    } else {
      this.props.changeDockStatus({ dispDockShow: true, shipmts: this.props.expandList[row.key] });
    }
  }

  handleCondSegmentDockShow = (row, ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const { tenantId } = this.props;
    const filters = this.genFilters(row);
    if (!this.props.expandList[row.key]) {
      this.props.loadShipmtsGroupedSub(null, {
        tenantId,
        filters: JSON.stringify(filters),
        shipmtNo: row.key,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 5);
        } else {
          this.props.changeDockStatus({ segDockShow: true, shipmts: result.data });
        }
      });
    } else {
      this.props.changeDockStatus({ segDockShow: true, shipmts: this.props.expandList[row.key] });
    }
  }

  handleConditionExpandList = (row) => {
    const filters = this.genFilters(row);
    const { tenantId } = this.props;
    if (!this.props.expandList[row.key]) {
      this.props.loadShipmtsGroupedSub(null, {
        tenantId,
        filters: JSON.stringify(filters),
        shipmtNo: row.key,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 5);
        }
      });
    }
    const ccols = this.buildCols('merge');

    return (<Table columns={ccols} pagination={false} dataSource={this.props.expandList[row.key] || []}
      size="small"
    />);
  }

  toggleAdvancedSearch = () => {
    this.setState({ advancedSearchVisible: !this.state.advancedSearchVisible });
  }
  showAdvancedSearch = (advancedSearchVisible) => {
    this.setState({ advancedSearchVisible });
  }

  render() {
    const { shipmentlist, loading } = this.props;
    this.dataSource.remotes = shipmentlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const { status, origin } = this.props.filters;
    const { type } = this.props.cond;
    let cols = this.buildCols();

    let tb = (<Table rowSelection={rowSelection} columns={cols} loading={loading}
      dataSource={this.dataSource} scroll={{ x: 2000 }}
    />);
    if (origin) {
      tb = (<Table expandedRowRender={this.handleExpandList} columns={cols} loading={loading}
        dataSource={this.dataSource} scroll={{ x: 2000 }}
      />);
    }
    if (type !== 'none') {
      cols = this.buildConditionCols();
      tb = (<Table expandedRowRender={this.handleConditionExpandList} columns={cols} loading={loading}
        dataSource={this.dataSource} scroll={{ x: 2000 }}
      />);
    }
    let bulkBtns = '';
    if (status === 'waiting') {
      bulkBtns = (
        <span>
          <Button type="default" onClick={() => { this.handleBatchDockShow('dispatch'); }}>
            {this.msg('btnTextBatchDispatch')}
          </Button>
          <Button onClick={() => this.handleBatchDockShow()}>
            {this.msg('btnTextBatchSegment')}
          </Button>
        </span>
      );
    } else if (status === 'dispatching') {
      bulkBtns = (
        <Button type="default" onClick={() => this.handleShipmtBatchSend()}>
          {this.msg('btnTextBatchSend')}
        </Button>
      );
    }

    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar" key="header">
          <span>{this.msg('transportDispatch')}</span>
          <RadioGroup onChange={this.handleStatusChange} value={status} size="large">
            <RadioButton value="waiting">{this.msg('rdTextWaiting')}</RadioButton>
            <RadioButton value="dispatching">{this.msg('rdTextDispatching')}</RadioButton>
            <RadioButton value="dispatched">{this.msg('rdTextDispatched')}</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools">
            <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} value={this.state.searchValue} size="large" />
            <span />
            <a onClick={this.toggleAdvancedSearch}>高级搜索</a>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <AdvancedSearchBar visible={this.state.advancedSearchVisible} onSearch={this.handleAdvancedSearch} toggle={this.toggleAdvancedSearch} />
          <div className="page-body">
            <div className="toolbar">
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3> {bulkBtns}
              </div>
              <div className="toolbar-right">
                <MyShipmentsSelect onSearch={this.handleAdvancedSearch} />
              </div>
            </div>
            <div className="panel-body table-panel">
              <div className="dispatch-table">
                {tb}
              </div>
            </div>
          </div>
        </Content>
        <PreviewPanel stage="dispatch" />
        <DispatchDock
          show={this.props.dispDockShow}
          shipmts={this.props.shipmts}
          msg={this.msgWrapper}
          onClose={this.handleDispatchDockClose}
        />

        <SegmentDock
          show={this.props.segDockShow}
          shipmts={this.props.shipmts}
          msg={this.msgWrapper}
          onClose={this.handleSegmentDockClose}
        />
        <RevokejectModal reload={this.handleTableLoad} />
      </QueueAnim>
    );
  }
}
