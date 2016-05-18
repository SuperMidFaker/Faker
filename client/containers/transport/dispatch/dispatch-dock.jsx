import React, { PropTypes } from 'react';
import { Icon, QueueAnim, Tag, Collapse, InputNumber, Button, Table, message, Modal, Radio } from 'ant-ui';
import { connect } from 'react-redux';
import connectFetch from 'reusable/decorators/connect-fetch';
import { loadLsps, loadVehicles, doDispatch } from 'universal/redux/reducers/transportDispatch';

const Panel = Collapse.Panel;
const RadioGroup = Radio.Group;

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
export default class DispatchDock extends React.Component {
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
                render: (tid, record) => (<Button type={`${record.partner_tenant_id > 0 ? 'primary' : 'ghost'}`} shape="circle" size="small" style={{width: 15, height: 15}} />)
              }, {
                title: '承运商',
                dataIndex: 'partner_name',
                width: 200
              }, {
                title: '价格协议',
                dataIndex: 'quotation_promise',
                render: () => (<span></span>)
              }, {
                title: '运输时效',
                dataIndex: 'transit',
                render: () => (<span></span>)
              }, {
                title: '报价（元）',
                dataIndex: 'quotation',
                render: () => (<InputNumber min={1} onChange={this.handleQuotationChange} />)
              }, {
                title: this.msg('shipmtOP'),
                width: 60,
                render: (o, record) => {
                  return (<span>
                        <a role="button" onClick={this.showConfirm.bind(this, 'tenant', record)}>
                        {this.msg('btnTextDispatch')}
                        </a></span>);
                }
              }];
    this.vehicleCols = [{
                title: '车牌',
                dataIndex: 'plate_number'
              }, {
                title: '司机',
                dataIndex: 'name'
              }, {
                title: '车型',
                dataIndex: 'type'
              }, {
                title: '车长',
                dataIndex: 'length'
              }, {
                title: '载重',
                dataIndex: 'load_weight'
              }, {
                title: '已分配',
                dataIndex: 'dispatched',
                render: () => {
                  return (<span>否</span>);
                }
              }, {
                title: '在途',
                dataIndex: 'driving',
                render: () => {
                  return (<span>否</span>);
                }
              }, {
                title: this.msg('shipmtOP'),
                render: (o, record) => {
                  return (<span>
                        <a role="button" onClick={this.showConfirm.bind(this, 'vehicle', record)}>
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
    }
  }

  handleQuotationChange = val => {
    this.setState({
      quotation: val
    });
  }

  handlePanelChange = key => {
    if (key === '2' && !this.props.vehicleLoaded) {
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
    if (key === '1' && !this.props.lspLoaded) {
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

  handlePodTypeChange(e) {
    const podType = e.target.value;
    this.setState({podType});
  }

  showConfirm(type, target) {
    const [ shipmt ] = this.props.shipmts;
    let msg = `将运单编号【${shipmt.shipmt_no}】分配给【${target.partner_name}】承运商`;
    if (type === 'vehicle') {
      msg = `将运单编号【${shipmt.shipmt_no}】分配给【${target.plate_number}】`;
    }
    Modal.confirm({
      content: (
        <div className="dispatch-confirm">
          <div style={{ marginBottom: 10 }}>{msg}</div>
          <RadioGroup onChange={this.handlePodTypeChange.bind(this)} value={this.state.podType}>
            <Radio key="a" value="dreceipt"><Icon style={{fontSize: 18, top: -3, marginLeft: 5, marginRight: 3}} type="camera" />需要电子回单</Radio>
            <Radio key="b" value="none"><Icon style={{fontSize: 18, top: -3, marginLeft: 5, marginRight: 3}} type="camera-o" />不要电子回单</Radio>
            <Radio key="c" value="qrcode"><Icon style={{fontSize: 18, top: -3, marginLeft: 5, marginRight: 3}} type="qrcode" />扫描签收回单</Radio>
          </RadioGroup>
        </div>
        ),
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

      dock = (<div className="dock-container" key="dock1" onClick={(e) => {e.stopPropagation();}}>
                <div className="dock-content">
                  <div className="dock-sp-line"></div>
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
                        <Collapse defaultActiveKey={['1']} onChange={this.handlePanelChange} accordion>
                          <Panel header="选择承运商" key="1">
                            <Table size="middle" columns={this.consigneeCols} pagination={false} dataSource={this.lspsds} useFixedHeader />
                          </Panel>
                          <Panel header="选择车辆" key="2">
                            <Table size="middle" columns={this.vehicleCols} pagination={false} dataSource={this.vesds} useFixedHeader/>
                          </Panel>
                        </Collapse>
                      </div>
                    </div>
                  </div>
                </div>
              </div>);
    }

    return (
      <QueueAnim key="dockcontainer" animConfig={{translateX:[0, 600], opacity:[1, 1]}}>{dock}</QueueAnim>
    );
  }
}

export default DispatchDock;
