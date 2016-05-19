import React, { PropTypes, Component } from 'react';
import { Icon, QueueAnim, Tag, InputNumber, Button, Table, message, Modal, Tabs } from 'ant-ui';
import { connect } from 'react-redux';
import connectFetch from 'reusable/decorators/connect-fetch';
import { loadLsps, loadVehicles, doDispatch } from 'universal/redux/reducers/transportDispatch';
import MContent from './MContent';

const TabPane = Tabs.TabPane;

function noop() {}

function fetch({ state, dispatch, cookie }) {
  return dispatch(loadLsps(cookie, {
    tenantId: state.account.tenantId,
    pageSize: state.transportDispatch.lsps.pageSize,
    currentPage: state.transportDispatch.lsps.current,
  }));
}

@connectFetch()(fetch)
@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  lsps: state.transportDispatch.lsps,
  vehicles: state.transportDispatch.vehicles,
  vehicleLoaded: state.transportDispatch.vehicleLoaded,
  lspLoaded: state.transportDispatch.lspLoaded,
  dispatched: state.transportDispatch.dispatched,
}), { loadLsps, loadVehicles, doDispatch })
export default class DispatchDock extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    msg: PropTypes.func.isRequired,
    shipmts: PropTypes.array.isRequired,
    lsps: PropTypes.object.isRequired,
    loadLsps: PropTypes.func.isRequired,
    vehicles: PropTypes.object.isRequired,
    loadVehicles: PropTypes.func.isRequired,
    vehicleLoaded: PropTypes.bool.isRequired,
    lspLoaded: PropTypes.bool.isRequired,
    doDispatch: PropTypes.func.isRequired,
    dispatched: PropTypes.bool.isRequired,
    loginId: PropTypes.number.isRequired
  }

  constructor(props) {
    super(props);

    this.msg = this.props.msg || noop;
    this.onClose = this.props.onClose || noop;
    this.onCloseWrapper = (reload) => {
      this.setState({quotation: 0, podType: 'dreceipt'});
      this.onClose(reload);
    };
    this.consigneeCols = [{
                title: '',
                dataIndex: 'partner_tenant_id',
                width: 30,
                render: (tid, record) => (<Button type={`${record.partner_tenant_id > 0 ? 'primary' : 'ghost'}`} shape="circle" size="small" style={{width: 15, height: 15}} />)
              }, {
                title: '承运商',
                dataIndex: 'partner_name',
                width: 180
              }, {
                title: '价格协议',
                dataIndex: 'quotation_promise',
                width: 100,
                render: () => (<span></span>)
              }, {
                title: '运输时效',
                dataIndex: 'transit',
                width: 80,
                render: () => (<span></span>)
              }, {
                title: '报价（元）',
                dataIndex: 'quotation',
                width: 120,
                render: () => (<InputNumber min={1} onChange={this.handleQuotationChange} />)
              }, {
                title: this.msg('shipmtOP'),
                width: 50,
                render: (o, record) => {
                  return (<span>
                        <a role="button" onClick={() => this.showConfirm('tenant', record)}>
                        {this.msg('btnTextDispatch')}
                        </a></span>);
                }
              }];
    this.vehicleCols = [{
                title: '车牌',
                dataIndex: 'plate_number',
                width: 50
              }, {
                title: '司机',
                dataIndex: 'name',
                width: 50
              }, {
                title: '车型',
                dataIndex: 'type',
                width: 50
              }, {
                title: '车长',
                dataIndex: 'length',
                width: 30
              }, {
                title: '载重',
                width: 30,
                dataIndex: 'load_weight'
              }, {
                title: '已分配',
                dataIndex: 'dispatched',
                width: 20,
                render: () => {
                  return (<span>否</span>);
                }
              }, {
                title: '在途',
                dataIndex: 'driving',
                width: 20,
                render: () => {
                  return (<span>否</span>);
                }
              }, {
                title: this.msg('shipmtOP'),
                width: 50,
                render: (o, record) => {
                  return (<span>
                        <a role="button" onClick={() => this.showConfirm('vehicle', record)}>
                        {this.msg('btnTextDispatch')}
                        </a></span>);
                }
              }];
  }

  state = {
    quotation: 0,
    podType: 'dreceipt', // none, qrcode, dreceipt
  }

  lspsds = new Table.DataSource({
    fetcher: params => this.props.loadLsps(null, params),
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
        currentPage: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
      };
      return params;
    },
    remotes: this.props.lsps
  })

  vesds = new Table.DataSource({
    fetcher: params => this.props.loadVehicles(null, params),
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
        currentPage: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
      };
      return params;
    },
    remotes: this.props.vehicles
  })

  handleShipmtDispatch(type, target) {
    // TODO multi shipments dispatch
    const { tenantId, loginId, shipmts } = this.props;
    const podType = this.state.podType;
    const shipmtNos = shipmts.map(s => {
      return {shipmtNo: s.shipmt_no, dispId: s.key};
    });
    if (type === 'tenant') {
      this.props.doDispatch(null, {
        tenantId,
        loginId,
        shipmtNos,
        partnerId: target.partner_id,
        partnerName: target.partner_name,
        partnerTenantId: target.partner_tenant_id,
        freightCharge: this.state.quotation,
        podType,
        type
      }).then(result => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.onCloseWrapper(true);
        }
      });
    } else if (type === 'vehicle') {
      this.props.doDispatch(null, {
        tenantId,
        loginId,
        shipmtNos,
        taskId: target.vehicle_id,
        taskVehicle: target.plate_number,
        taskDriverId: target.driver_id,
        taskDriverName: target.name,
        freightCharge: this.state.quotation,
        podType,
        type
      }).then(result => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.onCloseWrapper(true);
        }
      });
    }
  }

  handleQuotationChange = val => {
    this.setState({
      quotation: val
    });
  }

  handleTabChange = key => {
    if (key === 'vehicle' && !this.props.vehicleLoaded) {
      const { vehicles, tenantId } = this.props;
      this.props.loadVehicles(null, {
        tenantId,
        pageSize: vehicles.pageSize,
        current: 1
      }).then(result => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
      });
    }
    if (key === 'carrier' && !this.props.lspLoaded) {
      const { lsps, tenantId } = this.props;
      this.props.loadLsps(null, {
        tenantId,
        pageSize: lsps.pageSize,
        current: 1
      }).then(result => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
      });
    }
  }

  handlePodTypeChange = podType => {
    this.setState({podType});
  }

  showConfirm(type, target) {
    const [ shipmt ] = this.props.shipmts;
    let msg = `将运单编号【${shipmt.shipmt_no}】分配给【${target.partner_name}】承运商`;
    if (type === 'vehicle') {
      msg = `将运单编号【${shipmt.shipmt_no}】分配给【${target.plate_number}】`;
    }
    Modal.confirm({
      content: (<MContent msg={msg} onChange={this.handlePodTypeChange} />),
      okText: this.msg('btnTextOk'),
      cancelText: this.msg('btnTextCancel'),
      onOk: () => {
        this.handleShipmtDispatch(type, target);
      }
    });
  }

  render() {
    const { show, shipmts, lsps, vehicles } = this.props;
    this.lspsds.remotes = lsps;
    this.vesds.remotes = vehicles;
    let dock = '';
    if (show) {
      const arr = [];
      let close = true;
      let totalCount = 0;
      let totalWeight = 0;
      let totalVolume = 0;
      if (shipmts.length === 1) {
        close = false;
      }
      shipmts.forEach(v => {
        arr.push((<Tag closable={close} color="blue">{v.shipmt_no}</Tag>));
        if (!isNaN(v.total_count)) {
          totalCount += v.total_count;
        }
        if (!isNaN(v.total_weight)) {
          totalWeight += v.total_weight;
        }
        if (!isNaN(v.total_volume)) {
          totalVolume += v.total_volume;
        }
      });

/*
      dock = (<div className="dock-container" key="dock1" onClick={(e) => {e.stopPropagation();}}>

                <div className="dock-content">
                  <div className="dock-sp">
                    <div className="dock-sp-body">
                      <div className="dock-sp-toolbar">
                        <a onClick={ this.onCloseWrapper }><Icon type="cross" className="closable"/></a>
                        <div className="shipno-container">
                          <span className="detail-title">共 {shipmts.length} 订单，{totalCount}件，{totalWeight}公斤，{totalVolume}立方</span>
                          {arr}
                        </div>
                      </div>
                      <div className="dock-sp-content">
                        <Tabs defaultActiveKey="carrier" onChange={this.handleTabChange}>
                          <TabPane tab={this.msg('tabTextCarrier')} key="carrier">
                            <Table columns={this.consigneeCols} dataSource={this.lspsds} pagination={false} />
                          </TabPane>
                          <TabPane tab={this.msg('tabTextVehicle')} key="vehicle">
                            <Table columns={this.vehicleCols} dataSource={this.vesds} pagination={false} />
                          </TabPane>
                        </Tabs>
                      </div>
                    </div>
                  </div>
                </div>
              </div>);*/
        dock = (
          <div className="dock-panel inside">
            <div className="panel-content">
              <div className="header">
                <span className="title">分配 {shipmts.length}个运单</span>
                <Tag>共{totalCount}件/{totalWeight}公斤/{totalVolume}立方</Tag>
                <div className="pull-right">
                  <Button type="ghost" shape="circle-outline" onClick={ this.onCloseWrapper }>
                    <Icon type="cross" />
                  </Button>
                </div>
              </div>
              <div className="body">
                <Tabs defaultActiveKey="carrier" onChange={this.handleTabChange}>
                  <TabPane tab={this.msg('tabTextCarrier')} key="carrier">
                    <div className="pane-content tab-pane">
                      <Table size="middle" columns={this.consigneeCols} dataSource={this.lspsds} pagination={false} />
                    </div>
                  </TabPane>
                  <TabPane tab={this.msg('tabTextVehicle')} key="vehicle">
                    <div className="pane-content tab-pane">
                      <Table size="middle" columns={this.vehicleCols} dataSource={this.vesds} pagination={false} />
                    </div>
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </div>
        );
    }

    return (
      <QueueAnim key="dockcontainer" animConfig={{translateX:[0, 600], opacity:[1, 1]}}>{dock}</QueueAnim>
    );
  }
}
