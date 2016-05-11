import React, { PropTypes } from 'react';
import { Icon, QueueAnim, Tag, Collapse, InputNumber, Button, Table } from 'ant-ui';
import { connect } from 'react-redux';
import connectFetch from 'reusable/decorators/connect-fetch';
import { loadLsps, loadVehicles } from 'universal/redux/reducers/transportDispatch';

const Panel = Collapse.Panel;

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
  lsps: state.transportDispatch.lsps,
  vehicles: state.transportDispatch.vehicles
}), { loadLsps, loadVehicles })
export default class DispatchDock extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    msg: PropTypes.func.isRequired,
    shipmts: PropTypes.array.isRequired,
    lsps: PropTypes.array.isRequired,
    loadLsps: PropTypes.func.isRequired,
    vehicles: PropTypes.array.isRequired,
    loadVehicles: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.msg = this.props.msg || noop;
    this.onClose = this.props.onClose || noop;
    this.consigneeCols = [{
                title: '',
                dataIndex: 'partner_tenant_id',
                render: (tid, record) => (<Button type={`${record.partner_tenant_id > 0 ? 'primary' : 'ghost'}`} shape="circle" size="small" />)
              }, {
                title: '承运商',
                dataIndex: 'partner_name'
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
                render: () => (<InputNumber min={0} onChange={this.handleQuotationChange} />)
              }, {
                title: this.msg('shipmtOP'),
                width: 100,
                render: (o, record) => {
                  return (<span>
                        <a role="button" onClick={this.handleShipmtDispatch(record, 'tenant')}>
                        {this.msg('btnTextDispatch')}
                        </a></span>);
                }
              }];
    this.vehicleCols = [{
                title: '车牌',
                dataIndex: 'plate_number'
              }, {
                title: '司机',
                dataIndex: 'driver_name'
              }, {
                title: '车型',
                dataIndex: 'type'
              }, {
                title: '车长',
                dataIndex: 'length'
              }, {
                title: '载重',
                dataIndex: 'load'
              }, {
                title: '已分配',
                dataIndex: 'dispatched'
              }, {
                title: '在途',
                dataIndex: 'driving'
              }, {
                title: this.msg('shipmtOP'),
                render: (o, record) => {
                  return (<span>
                        <a role="button" onClick={this.handleShipmtDispatch(record, 'vehicle')}>
                        {this.msg('btnTextDispatch')}
                        </a></span>);
                }
              }];
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

  handleShipmtDispatch = (tid, type) => {
    if (type === 'tenant') {

    } else if (type === 'vehicle') {

    }
  }

  handleQuotationChange() {

  }

  handlePanelChange(key) {
    console.log(key);
  }

  render() {
    const { show, shipmts, lsps } = this.props;
    this.lspsds.remotes = lsps;
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

      dock = (<div className="dock-container" key="dock1">
                <div className="dock-content">
                  <div className="dock-sp-line"></div>
                  <div className="dock-sp">
                    <div className="dock-sp-body">
                      <div className="dock-sp-toolbar">
                        <a onClick={ this.onClose }><Icon type="cross" className="closable"/></a>
                        <div className="shipno-container">
                          <span className="detail-title">共 {shipmts.length} 订单，{totalCount}件，{totalWeight}公斤，{totalVolume}立方</span>
                          {arr}
                        </div>
                      </div>
                      <div className="dock-sp-content">
                        <Collapse defaultActiveKey={['1']} onChange={this.handlePanelChange}>
                          <Panel header="选择承运商" key="1">
                            <Table columns={this.consigneeCols} dataSource={this.lspsds} />
                          </Panel>
                          <Panel header="选择车辆" key="2">
                            <Table columns={this.vehicleCols} dataSource={this.vesds} />
                          </Panel>
                          <Panel header="询价" key="3">
                            <div></div>
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
