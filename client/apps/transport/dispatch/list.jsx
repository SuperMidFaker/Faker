import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio, Icon, message, Select, Modal, Alert } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import TrimSpan from 'client/components/trimSpan';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadTable,
         doSend,
         doReturn,
         segmentCancelRequest,
         segmentCancelCheckRequest,
         loadExpandList,
         loadShipmtsGrouped,
         loadShipmtsGroupedSub,
         loadSegRq,
         removeGroupedSubShipmt } from 'common/reducers/transportDispatch';
import { setNavTitle } from 'common/reducers/navbar';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import containerMessages from 'client/apps/message.i18n';
import Condition from './condition';
import DispatchDock from './dispatchDock';
import SegmentDock from './segmentDock';
import { loadShipmtDetail } from 'common/reducers/shipment';
import PreviewPanel from '../shipment/modals/preview-panel';
import { renderConsignLoc } from '../common/consignLocation';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);

function fetch({ state, dispatch, cookie }) {
  return dispatch(loadSegRq(cookie, {
    tenantId: state.account.tenantId
  }));
}

@connectFetch()(fetch)
@injectIntl
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: formatContainerMsg(props.intl, 'transportDispatch'),
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: null
  }));
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    avatar: state.account.profile.avatar,
    shipmentlist: state.transportDispatch.shipmentlist,
    filters: state.transportDispatch.filters,
    loading: state.transportDispatch.loading,
    dispatched: state.transportDispatch.dispatched,
    expandList: state.transportDispatch.expandList,
    cond: state.transportDispatch.cond
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
    loadShipmtDetail })
export default class DispatchList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
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
    expandList: PropTypes.array.isRequired,
    cond: PropTypes.object.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
  }
  state = {
    selectedRowKeys: [],
    show: false,
    sshow: false,
    shipmts: [],
    panelHeader: []
  }

  componentDidMount() {
    this.handleStatusChange({target:{value: 'waiting'}});
  }

  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadTable(null, params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        filters: JSON.stringify(this.props.filters)
      };
      return params;
    },
    remotes: this.props.shipmentlist
  })

  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  commonCols = [{
    title: this.msg('packageNum'),
    dataIndex: 'total_count',
    width: 80
  }, {
    title: this.msg('shipWeight'),
    dataIndex: 'total_weight',
    width: 80
  }, {
    title: this.msg('shipVolume'),
    dataIndex: 'total_volume',
    width: 80
  }, {
    title: this.msg('shipPickupDate'),
    dataIndex: 'pickup_est_date',
    width: 90,
    render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipConsigner'),
    dataIndex: 'consigner_name',
    width: 190,
    render: (o) => <TrimSpan text={o} />,
  }, {
    title: this.msg('consignerPlace'),
    width: 190,
    render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consigner')} />,
  }, {
    title: this.msg('consignerAddr'),
    dataIndex: 'consigner_addr',
    width: 210,
    render: (o) => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('shipDeliveryDate'),
    dataIndex: 'deliver_est_date',
    width: 90,
    render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipConsignee'),
    dataIndex: 'consignee_name',
    width: 190,
    render: (o) => <TrimSpan text={o} />,
  }, {
    title: this.msg('consigneePlace'),
    width: 190,
    render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consignee')} />,
  }, {
    title: this.msg('consigneeAddr'),
    dataIndex: 'consignee_addr',
    width: 210,
    render: (o) => <TrimSpan text={o} maxLen={14} />,
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
          return <a onClick={() => this.handleShipmtPreview(record.shipmt_no)}>{o}</a>;
        }
        return (<span>{o}</span>);
      }
    }];
    if (s === 'waiting') {
      cols.push({
        title: this.msg('shipRequirement'),
        dataIndex: 'sr_name',
        width: 230,
        render: (o) => <TrimSpan text={o} maxLen={15} />,
      }, {
        title: this.msg('shipMode'),
        dataIndex: 'transport_mode',
        width: 80
      });
      cols = cols.concat(this.commonCols);
      cols.push({
        title: this.msg('shipAcceptTime'),
        dataIndex: 'acpt_time',
        width: 100,
        render: (text, record) => record.acpt_time ?
         moment(record.acpt_time).format('MM-DD HH:mm') : ' '
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
                  <a role="button" onClick={() => this.handleSegmentCancelConfirm(record)}>
                  {this.msg('btnTextSegmentCancel')}
                  </a></span>);
            } else {
              return (<span className="na-operation">NA</span>);
            }
          }
          return (
            <span>
              <a role="button" onClick={() => this.handleDispatchDockShow(record)}>
              {this.msg('btnTextDispatch')}
              </a>
              <span className="ant-divider" />
              <a role="button" onClick={() => this.handleSegmentDockShow(record)}>
              {this.msg('btnTextSegment')}
              </a>
            </span>
          );
        }
      });
    } else if (s === 'dispatching' || s === 'dispatched') {
      cols.push({
        title: this.msg('shipSp'),
        dataIndex: 'sp_name',
        width: 220
      }, {
        title: this.msg('shipVehicle'),
        dataIndex: 'task_vehicle',
        width: 80
      });
      cols = cols.concat(this.commonCols);
      let timetitle = this.msg('shipDispTime');
      if (s === 'dispatched') {
        timetitle = this.msg('shipSendTime');
      }
      cols.push({
        title: this.msg('shipPod'),
        dataIndex: 'pod_type',
        width: 100,
        render: (text) => {
          switch (text) {
            case 'qrPOD':
              return '扫描签收回单';
            case 'ePOD':
              return '需要电子回单';
            default:
              return '不要电子回单';
          }
        }
      }, {
        title: this.msg('shipFreightCharge'),
        dataIndex: 'freight_charge',
        width: 60,
        render: text => {
          if (text > 0) {
            return (<span>{text}</span>);
          }
        }
      }, {
        title: timetitle,
        dataIndex: 'disp_time',
        width: 100,
        render: (text, record) => record.disp_time ?
         moment(record.disp_time).format('MM-DD HH:mm') : ' '
      }, {
        title: this.msg('shipmtOP'),
        width: 100,
        fixed: fixedRight,
        render: (o, record) => {
          if (s === 'dispatched') {
            if (record.disp_status === 2) {
              return (<span><a role="button" onClick={() => this.handleShipmtReturn(record)}>
                      {this.msg('btnTextReturn')}</a></span>);
            }
            return (<span className="na-operation">NA</span>);
          }
          return (
            <span>
              <a role="button" onClick={() => this.handleShipmtSend(record)}>
              {this.msg('btnTextSend')}
              </a>
              <span className="ant-divider" />
              <a role="button" onClick={() => this.handleShipmtReturn(record)}>
              {this.msg('btnTextReturn')}
              </a>
            </span>
          );
        }
      });
    }

    return cols;
  }

  buildConditionCols() {
    const cols = [{
      title: this.msg('shipNoCount'),
      dataIndex: 'count',
      width: 100
    }, {
      title: this.msg('shipConsigner'),
      dataIndex: 'consigner_name',
      width: 180,
    }, {
      title: this.msg('consignerPlace'),
      width: 120,
      render: (o, record) => renderConsignLoc(record, 'consigner')
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
      render: (o, record) => renderConsignLoc(record, 'consignee')
    }, {
      title: this.msg('consigneeAddr'),
      dataIndex: 'consignee_addr',
      width: 200,
    }, {
        title: this.msg('shipmtOP'),
        width: 100,
        render: (o, record) => {
          return (
            <span>
              <a role="button" onClick={() => this.handleCondDispatchDockShow(record)}>
              {this.msg('btnTextDispatch')}
              </a>
              <span className="ant-divider" />
              <a role="button" onClick={() => this.handleCondSegmentDockShow(record)}>
              {this.msg('btnTextSegment')}
              </a>
            </span>
          );
        }
      }];

    return cols;
  }

  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }

  msgWrapper = (s) => {
    return this.msg(s);
  }

  handleShipmtPreview(shipmtNo) {
    this.props.loadShipmtDetail(shipmtNo, this.props.tenantId, 'sp').then(result => {
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
      current: 1
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.handlePanelHeaderChange();
      }
    });
  }

  handlePanelHeaderChange() {
    const { status, origin } = this.props.filters;
    const {type} = this.props.cond;
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
      panelHeader.push((<span className="ant-divider" style={{width: '0px'}}/>),
      (<Button onClick={this.handleOriginShipmtsReturn}><span>{this.msg('btnTextReturnList')}</span><Icon type="eye-o" /></Button>));
    } else {
      if (status === 'waiting') {
        panelHeader.push((<Condition msg={this.msgWrapper} onConditionChange={this.handleConditionChange}/>),
        (<Button onClick={this.handleOriginShipmts}><span>{this.msg('btnTextOriginShipments')}</span><Icon type="eye" /></Button>));
      } else if (status === 'dispatched') {
        panelHeader.push((<Select defaultValue="0" style={{ width: 90 }} onChange={this.handleDayChange}>
          <Option value="0">最近七天</Option>
          <Option value="1">最近一月</Option>
        </Select>),
        (<Button onClick={this.handleExportDispShipmts} icon="export"><span>{this.msg('btnTextExport')}</span></Button>));
      }
    }

    this.setState({panelHeader, show: false, sshow: false, shipmts: [], selectedRowKeys: []});
  }

  handleDispatchDockShow(shipmt) {
    this.setState({show: true, shipmts: [shipmt], selectedRowKeys: [shipmt.key]});
  }

  handleBatchDockShow(type) {
    const { shipmentlist } = this.props;
    const { selectedRowKeys } = this.state;
    const shipmts = [];
    shipmentlist.data.forEach(s => {
      if (selectedRowKeys.indexOf(s.key) > -1) {
        shipmts.push(s);
      }
    });
    if (type === 'dispatch') {
      this.setState({show: true, shipmts});
    } else {
      this.setState({sshow: true, shipmts});
    }
  }

  handleDispatchDockClose = (reload) => {
    if (typeof reload === 'boolean') {
      this.handleStatusChange({target:{value: 'waiting'}});
    } else {
      this.setState({show: false, shipmts: [], selectedRowKeys: []});
    }
  }

  handleSegmentDockShow(shipmt) {
    this.setState({sshow: true, shipmts: [shipmt], selectedRowKeys: [shipmt.key]});
  }

  handleSegmentDockClose = (reload) => {
    if (typeof reload === 'boolean') {
      this.handleStatusChange({target:{value: 'waiting'}});
    } else {
      this.setState({sshow: false, shipmts: [], selectedRowKeys: []});
    }
  }

  handleSegmentCancelConfirm = (shipmt) => {
    const { tenantId } = this.props;
    this.props.segmentCancelCheckRequest(null, {
      tenantId,
      shipmtNo: shipmt.shipmt_no
    }).then(rs => {
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
              shipmtNo: shipmt.shipmt_no
            }).then(result => {
              if (result.error) {
                message.error(result.error.message, 5);
              } else {
                this.handleOriginShipmts();
              }
            });
          }
        });
      }
    });
  }

  handleShipmtBatchSend() {
    const { shipmentlist } = this.props;
    const { selectedRowKeys } = this.state;
    const count = selectedRowKeys.length;
    const list = [];
    shipmentlist.data.forEach(s => {
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
      title: `确认批量发送运单`,
      content: `将已选定的${count}个运单发送给承运商？`,
      okText: this.msg('btnTextOk'),
      cancelText: this.msg('btnTextCancel'),
      onOk: () => {
        if (count === 0) {
          return;
        }
        const { tenantId, loginId, avatar } = this.props;
        this.props.doSend(null, {
          tenantId,
          loginId,
          avatar,
          list: JSON.stringify(list)
        }).then(result => {
          if (result.error) {
            message.error(result.error.message, 5);
          } else {
            this.handleStatusChange({target:{value: 'dispatching'}});
          }
        });
      }
    });
  }

  handleShipmtSend(shipmt) {
    let msg = `将【${shipmt.shipmt_no}】运单发送给【${shipmt.sp_name}】？`;
    if (!shipmt.sp_tenant_id && shipmt.task_id > 0) {
      msg = `将【${shipmt.shipmt_no}】运单发送给【${shipmt.task_vehicle}】？`;
    }
    Modal.confirm({
      title: `确认发送运单`,
      content: msg,
      okText: this.msg('btnTextOk'),
      cancelText: this.msg('btnTextCancel'),
      onOk: () => {
        const { tenantId, loginId, avatar } = this.props;
        this.props.doSend(null, {
          tenantId,
          loginId,
          avatar,
          list: JSON.stringify([{dispId: shipmt.key,
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
          parentId: shipmt.parent_id}])
        }).then(result => {
          if (result.error) {
            message.error(result.error.message, 5);
          } else {
            this.handleStatusChange({target:{value: 'dispatching'}});
          }
        });
      }
    });
  }

  handleShipmtReturn(shipmt) {
    const { status } = this.props.filters;
    let msg = `确定退回分配给【${shipmt.sp_name}】承运商的【${shipmt.shipmt_no}】的运单？`;
    if (!shipmt.sp_tenant_id && shipmt.task_id > 0) {
      msg = `确定退回分配给【${shipmt.task_vehicle}】的【${shipmt.shipmt_no}】的运单？`;
    }

    Modal.confirm({
      content: msg,
      okText: this.msg('btnTextOk'),
      cancelText: this.msg('btnTextCancel'),
      onOk: () => {
        const { tenantId } = this.props;
        this.props.doReturn(null, {
          tenantId,
          dispId: shipmt.key,
          parentId: shipmt.parent_id,
          shipmtNo: shipmt.shipmt_no
        }).then(result => {
          if (result.error) {
            message.error(result.error.message, 5);
          } else {
            this.handleStatusChange({target:{value: status}});
          }
        });
      }
    });
  }

  handleDayChange = () => {

  }

  handleExportDispShipmts = () => {

  }

  handleConditionChange = (condition) => {
    const {tenantId, shipmentlist} = this.props;
    this.props.loadShipmtsGrouped(null, {
      tenantId,
      filters: JSON.stringify(condition),
      pageSize: shipmentlist.pageSize,
      current: 1
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.handlePanelHeaderChange();
      }
    });
  }

  handleOriginShipmtsReturn = () => {
    this.handleStatusChange({target: {value: 'waiting'}});
  }

  handleOriginShipmts = () => {
    const { shipmentlist, tenantId, filters } = this.props;
    const tmp = Object.assign({}, filters);
    tmp.origin = 1;

    this.props.loadTable(null, {
      tenantId,
      filters: JSON.stringify(tmp),
      pageSize: shipmentlist.pageSize,
      current: 1
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.handlePanelHeaderChange();
      }
    });
  }

  handleExpandList = row => {
    const { tenantId } = this.props;
    if (!this.props.expandList[row.shipmt_no]) {
      this.props.loadExpandList(null, {
        tenantId,
        shipmtNo: row.shipmt_no,
        srTenantId: row.sr_tenant_id,
        spTenantId: row.sp_tenant_id
      }).then(result => {
        if (result.error) {
          message.error(result.error.message, 5);
        }
      });
    }
    const ccols = this.buildCols('sub');

    return (<Table columns={ccols} pagination={false} dataSource={this.props.expandList[row.shipmt_no] || []}
        size="small" />);
  }

  handleRemoveShipmt = row => {
    this.props.removeGroupedSubShipmt(row.parentKey, row.shipmt_no);
  }

  genFilters(row) {
    const {type, consignerStep, consigneeStep} = this.props.cond;
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

  handleCondDispatchDockShow = row => {
    const {tenantId} = this.props;
    const filters = this.genFilters(row);
    if (!this.props.expandList[row.key]) {
      this.props.loadShipmtsGroupedSub(null, {
        tenantId,
        filters: JSON.stringify(filters),
        shipmtNo: row.key
      }).then(result => {
        if (result.error) {
          message.error(result.error.message, 5);
        } else {
          this.setState({show: true, shipmts: result.data});
        }
      });
    } else {
      this.setState({show: true, shipmts: this.props.expandList[row.key]});
    }
  }

  handleCondSegmentDockShow = row => {
    const {tenantId} = this.props;
    const filters = this.genFilters(row);
    if (!this.props.expandList[row.key]) {
      this.props.loadShipmtsGroupedSub(null, {
        tenantId,
        filters: JSON.stringify(filters),
        shipmtNo: row.key
      }).then(result => {
        if (result.error) {
          message.error(result.error.message, 5);
        } else {
          this.setState({sshow: true, shipmts: result.data});
        }
      });
    } else {
      this.setState({sshow: true, shipmts: this.props.expandList[row.key]});
    }
  }

  handleConditionExpandList = row => {
    const filters = this.genFilters(row);
    const { tenantId } = this.props;
    if (!this.props.expandList[row.key]) {
      this.props.loadShipmtsGroupedSub(null, {
        tenantId,
        filters: JSON.stringify(filters),
        shipmtNo: row.key
      }).then(result => {
        if (result.error) {
          message.error(result.error.message, 5);
        }
      });
    }
    const ccols = this.buildCols('merge');

    return (<Table columns={ccols} pagination={false} dataSource={this.props.expandList[row.key] || []}
       size="small" />);
  }

  render() {
    const { shipmentlist, loading } = this.props;
    this.dataSource.remotes = shipmentlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      }
    };
    const { status, origin } = this.props.filters;
    const {type} = this.props.cond;
    let cols = this.buildCols();

    let tb = (<Table rowSelection={rowSelection} columns={cols} loading={loading}
              dataSource={this.dataSource} scroll={{ x: 2420, y: 460 }}
            />);
    if (origin) {
      tb = (<Table expandedRowRender={this.handleExpandList} columns={cols} loading={loading}
              dataSource={this.dataSource} scroll={{ x: 2420, y: 460 }}
            />);
    }
    if (type !== 'none') {
      cols = this.buildConditionCols();
      tb = (<Table expandedRowRender={this.handleConditionExpandList} columns={cols} loading={loading}
              dataSource={this.dataSource} scroll={{ x: 1900, y: 460 }}
            />);
    }

    let btns = '';
    if (status === 'waiting') {
      btns = (
        <div style={{float: 'left'}}>
          <Button type="primary" size="large" onClick={() => { this.handleBatchDockShow('dispatch'); }}>
          {this.msg('btnTextBatchDispatch')}
          </Button>
          <span className="ant-divider" style={{width: '0px'}}/>
          <Button type="ghost" size="large" onClick={() => this.handleBatchDockShow() }>
          {this.msg('btnTextBatchSegment')}
          </Button>
        </div>
      );
    } else if (status === 'dispatching') {
      btns = (
        <div style={{float: 'left'}}>
          <Button type="primary" size="large" onClick={() => this.handleShipmtBatchSend() }>
          {this.msg('btnTextBatchSend')}
          </Button>
        </div>
      );
    }

    return (
      <div className="main-content">
        <div className="page-header">
          <RadioGroup onChange={this.handleStatusChange} value={status} size="large">
            <RadioButton value="waiting">{this.msg('rdTextWaiting')}</RadioButton>
            <RadioButton value="dispatching">{this.msg('rdTextDispatching')}</RadioButton>
            <RadioButton value="dispatched">{this.msg('rdTextDispatched')}</RadioButton>
          </RadioGroup>
          <span style={{marginLeft: '10px'}} />
          {this.state.panelHeader}
        </div>
        <div className="page-body">
          <div className="panel-body">
            <div className="dispatch-table">
              {tb}
            </div>
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            {btns}
            <Button shape="circle-outline" icon="cross" onClick={this.handleSelectionClear} className="pull-right" />
          </div>
        </div>
        <PreviewPanel />
        <DispatchDock key="dispDock"
          show={this.state.show}
          shipmts={this.state.shipmts}
          msg={this.msgWrapper}
          onClose={this.handleDispatchDockClose} />

        <SegmentDock key="segDock"
          show={this.state.sshow}
          shipmts={this.state.shipmts}
          msg={this.msgWrapper}
          onClose={this.handleSegmentDockClose} />
      </div>
    );
  }
}
