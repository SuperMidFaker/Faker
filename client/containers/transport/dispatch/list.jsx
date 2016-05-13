import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio, Icon, message, Select, Modal } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'reusable/decorators/connect-fetch';
import connectNav from 'reusable/decorators/connect-nav';
import { loadTable, doSend, doReturn } from 'universal/redux/reducers/transportDispatch';
import { setNavTitle } from 'universal/redux/reducers/navbar';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import containerMessages from 'client/containers/message.i18n';
import Condition from './condition';
import DispatchDock from './dispatch-dock';
import SegmentDock from './segment-dock';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadTable(cookie, {
    tenantId: state.account.tenantId,
    filters: JSON.stringify(state.transportDispatch.filters),
    pageSize: state.transportDispatch.shipmentlist.pageSize,
    current: state.transportDispatch.shipmentlist.current,
  }));
}

@connectFetch()(fetchData)
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
    shipmentlist: state.transportDispatch.shipmentlist,
    filters: state.transportDispatch.filters,
    loading: state.transportDispatch.loading,
    dispatched: state.transportDispatch.dispatched
  }),
  { loadTable, doReturn, doSend })
class DispatchList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    filters: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    shipmentlist: PropTypes.object.isRequired,
    loadTable: PropTypes.func.isRequired,
    doSend: PropTypes.func.isRequired,
    doReturn: PropTypes.func.isRequired,
    dispatched: PropTypes.bool.isRequired
  }
  state = {
    selectedRowKeys: [],
    show: false,
    sshow: false,
    shipmts: [],
    panelHeader: []
  }

  componentWillMount() {
    this.handlePanelHeaderChange();
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

  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  commonCols = [{
    title: this.msg('packageNum'),
    dataIndex: 'total_count',
    width: 40
  }, {
    title: this.msg('shipWeight'),
    dataIndex: 'total_weight',
    width: 40
  }, {
    title: this.msg('shipVolume'),
    dataIndex: 'total_volume',
    width: 40
  }, {
    title: this.msg('shipPickupDate'),
    dataIndex: 'pickup_est_date',
    width: 80,
    render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipConsignor'),
    dataIndex: 'consigner_name',
    width: 150,
  }, {
    title: this.msg('consignorPlace'),
    width: 120,
    render: (o, record) => this.renderConsignLoc(record, 'consigner')
  }, {
    title: this.msg('consignorAddr'),
    dataIndex: 'consigner_addr',
    width: 150,
  }, {
    title: this.msg('shipDeliveryDate'),
    dataIndex: 'deliver_est_date',
    width: 80,
    render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipConsignee'),
    dataIndex: 'consignee_name',
    width: 150,
  }, {
    title: this.msg('consigneePlace'),
    width: 120,
    render: (o, record) => this.renderConsignLoc(record, 'consignee')
  }, {
    title: this.msg('consigneeAddr'),
    dataIndex: 'consignee_addr',
    width: 150,
  }];
  buildCols() {
    const s = this.props.filters.status;
    let cols = [{
      title: this.msg('shipNo'),
      dataIndex: 'shipmt_no',
      width: 200
    }];
    if (s === 'waiting') {
      cols.push({
        title: this.msg('shipRequirement'),
        dataIndex: 'sr_name',
        width: 140
      }, {
        title: this.msg('shipMode'),
        dataIndex: 'transport_mode',
        width: 80
      });
      cols = cols.concat(this.commonCols);
      cols.push({
        title: this.msg('shipAcceptTime'),
        dataIndex: 'acpt_time',
        width: 60,
        render: (text, record) => record.acpt_time ?
         moment(record.acpt_time).format('YYYY.MM.DD') : ' '
      }, {
        title: this.msg('shipmtOP'),
        width: 100,
        render: (o, record) => {
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
        width: 140
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
        width: 60,
        render: (text) => {
          switch (text) {
            case 'qrcode':
              return '扫描签收回单';
            case 'dreceipt':
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
        width: 60,
        render: (text, record) => record.disp_time ?
         moment(record.disp_time).format('YYYY.MM.DD') : ' '
      }, {
        title: this.msg('shipmtOP'),
        width: 100,
        render: (o, record) => {
          if (s === 'dispatched') {
            return (<span></span>);
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

  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }

  msgWrapper = (s) => {
    return this.msg(s);
  }

  handleStatusChange = (ev) => {
    const { shipmentlist, tenantId, filters } = this.props;
    const tmp = Object.assign({}, filters);
    tmp.status = ev.target.value;

    this.props.loadTable(null, {
      tenantId,
      filters: JSON.stringify(tmp),
      pageSize: shipmentlist.pageSize,
      current: 1
    }).then(result => {
      this.handlePanelHeaderChange();

      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }

  handlePanelHeaderChange() {
    const { status } = this.props.filters;

    const panelHeader = [];
    if (status === 'waiting') {
      panelHeader.push((<Condition msg={this.msgWrapper} onConditionChange={this.handleConditionChange}/>),
      (<span className="ant-divider" style={{width: '0px'}}/>),
      (<Button onClick={this.handleOriginShipmts}><span>{this.msg('btnTextOriginShipments')}</span><Icon type="rollback" /></Button>));
    } else if (status === 'dispatched') {
      panelHeader.push((<Select defaultValue="0" style={{ width: 90 }} onChange={this.handleDayChange}>
        <Option value="0">最近七天</Option>
        <Option value="1">最近一月</Option>
      </Select>),
      (<span className="ant-divider" style={{width: '0px'}}/>),
      (<Button onClick={this.handleExportDispShipmts}><span>{this.msg('btnTextExport')}</span><Icon type="arrow-down" /></Button>));
    }

    this.setState({panelHeader, show: false, sshow: false, shipmts: []});
  }

  handleDispatchDockShow(shipmt) {
    this.setState({show: true, shipmts: [shipmt]});
  }

  handleDispatchDockClose = (reload) => {
    if (typeof reload === 'boolean') {
      this.handleStatusChange({target:{value: 'waiting'}});
    } else {
      this.setState({show: false, shipmts: []});
    }
  }

  handleSegmentDockShow(shipmt) {
    this.setState({sshow: true, shipmts: [shipmt]});
  }

  handleSegmentDockClose = (reload) => {
    if (typeof reload === 'boolean') {
      this.handleStatusChange({target:{value: 'waiting'}});
    } else {
      this.setState({sshow: false, shipmts: []});
    }
  }

  handleShipmtSend(shipmt) {
    Modal.confirm({
      content: `确定发送运单编号为【${shipmt.shipmt_no}】的运单给【${shipmt.sp_name}】承运商？`,
      okText: this.msg('btnTextOk'),
      cancelText: this.msg('btnTextCancel'),
      onOk: () => {
        const { tenantId } = this.props;
        this.props.doSend(null, {
          tenantId,
          dispId: shipmt.key,
          shipmtNo: shipmt.shipmt_no
        }).then(result => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.handleStatusChange({target:{value: 'dispatching'}});
          }
        });
      }
    });
  }

  handleShipmtReturn(shipmt) {
    Modal.confirm({
      content: `确定退回分配给【${shipmt.sp_name}】承运商的【${shipmt.shipmt_no}】的运单？`,
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
            message.error(result.error.message, 10);
          } else {
            this.handleStatusChange({target:{value: 'dispatching'}});
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
    console.log(condition);
  }

  handleOriginShipmts = () => {

  }

  renderConsignLoc(shipmt, field) {
    const province = `${field}_province`;
    const city = `${field}_city`;
    const county = `${field}_district`;
    const names = [];
    if (shipmt[city] && (shipmt[city] === '市辖区' || shipmt[city] === '县')) {
      if (shipmt[province]) {
        names.push(shipmt[province]);
      }
      if (shipmt[county]) {
        names.push(shipmt[county]);
      }
      return names.join('-');
    } else if (shipmt[county] && (shipmt[county] === '市辖区' || shipmt[county] === '县')) {
      return shipmt[city] || '';
    } else {
      if (shipmt[city]) {
        names.push(shipmt[city]);
      }
      if (shipmt[county]) {
        names.push(shipmt[county]);
      }
      return names.join('-');
    }
  }

  render() {
    const { shipmentlist, loading, intl } = this.props;
    this.dataSource.remotes = shipmentlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      }
    };
    const { status } = this.props.filters;

    const cols = this.buildCols();

    return (
      <div className="main-content">
        <div className="page-header">
          <RadioGroup onChange={this.handleStatusChange} value={status}>
            <RadioButton value="waiting">{this.msg('rdTextWaiting')}</RadioButton>
            <RadioButton value="dispatching">{this.msg('rdTextDispatching')}</RadioButton>
            <RadioButton value="dispatched">{this.msg('rdTextDispatched')}</RadioButton>
          </RadioGroup>
        </div>
        <div className="page-body fixed">
          <div className="panel-header">
            {this.state.panelHeader}
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={cols} loading={loading}
              dataSource={this.dataSource} useFixedHeader columnsPageRange={[7, 14]} columnsPageSize={4}
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={this.handleSelectionClear} className="pull-right">
            {formatContainerMsg(intl, 'clearSelection')}
            </Button>
          </div>
        </div>

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

export default DispatchList;
