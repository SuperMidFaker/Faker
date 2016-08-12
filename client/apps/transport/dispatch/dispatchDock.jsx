import React, { PropTypes, Component } from 'react';
import update from 'react/lib/update';
import { Icon, Tag, InputNumber, Button, Popover, message, Modal, Tabs }
  from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadLsps, loadVehicles, doDispatch } from 'common/reducers/transportDispatch';
import { addPartner } from 'common/reducers/partner';
import { computeCostCharge } from 'common/reducers/shipment';
import { getChargeAmountExpression } from '../common/charge';
import ChargeSpecForm from '../shipment/forms/chargeSpec';
import SearchBar from 'client/components/search-bar';
import MContent from './MContent';
import partnerModal from '../../corp/cooperation/components/partnerModal';
import VehicleFormMini from '../resources/components/VehicleForm-mini';

const TabPane = Tabs.TabPane;

export function RowClick(props) {
  const { text, onHit, row, index } = props;
  function handleClick(ev) {
    onHit(ev, row, index);
  }
  return <a role="button" onClick={handleClick}>{text}</a>;
}

RowClick.propTypes = {
  row: PropTypes.object.isRequired,
  index: PropTypes.number,
  text: PropTypes.string.isRequired,
  onHit: PropTypes.func.isRequired,
};
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
  vehicleTypes: state.transportDispatch.vehicleTypes,
  vehicleLengths: state.transportDispatch.vehicleLengths,
}),
  { loadLsps, loadVehicles, doDispatch, addPartner, computeCostCharge }
)
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
    loginId: PropTypes.number.isRequired,
    vehicleTypes: PropTypes.array.isRequired,
    vehicleLengths: PropTypes.array.isRequired,
    computeCostCharge: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.msg = this.props.msg || noop;
    this.onClose = this.props.onClose || noop;
    this.onCloseWrapper = (reload) => {
      this.setState({ quotation: 0, podType: 'ePOD' });
      this.onClose(reload);
    };
    this.consigneeCols = [{
      title: '承运商',
      dataIndex: 'partner_name',
      width: 180,
      render: (o, record) => (
        <span>
          <i className={`zmdi zmdi-circle ${record.partner_tenant_id > 0 ? 'mdc-text-green' : 'mdc-text-grey'}`} />
          {record.partner_name}
        </span>
      ),
    }, {
      title: '成本价（元）',
      dataIndex: 'charge',
      width: 120,
      render: (o, record, index) => {
        if (o) {
          return (
            <Popover placement="rightBottom" overlayStyle={{ width: 360 }} title="价格明细" content={
              <ChargeSpecForm charge={o} onChange={this.handleChargeChange} index={index} />
            } placement="bottom"
            >
              <span>{o.total_charge}</span>
            </Popover>
          );
        } else if (this.props.shipmts.length > 1) {
          return <InputNumber min={1} onChange={this.handleQuotationChange} />;
        } else {
          return '';
        }
      },
    }, {
      title: this.msg('shipmtOP'),
      width: 100,
      render: (o, record, idx) => (
        <span>
          <a role="button" onClick={() => this.showConfirm('tenant', record)}>
          {this.msg('btnTextDispatch')}
          </a>
          {
            this.props.shipmts.length === 1 &&
            <span className="ant-divider" />
          }
          {
            this.props.shipmts.length === 1 && (
            <RowClick row={record} text={this.msg('btnChargeCompute')}
              index={idx} onHit={this.handleCostCompute}
            />)
          }
        </span>
      ),
    }];
    this.vehicleCols = [{
      title: '车牌',
      dataIndex: 'plate_number',
      width: 50,
    }, {
      title: '司机',
      dataIndex: 'name',
      width: 50,
    }, {
      title: '车型',
      dataIndex: 'type',
      width: 50,
      render: (t) => {
        if (this.props.vehicleTypes) {
          return this.props.vehicleTypes[t].text;
        }
        return '';
      },
    }, {
      title: '车长',
      dataIndex: 'length',
      width: 30,
      render: (l) => {
        for (let i = 0; i < this.props.vehicleLengths.length; i ++) {
          if (this.props.vehicleLengths[i].value === l) {
            return this.props.vehicleLengths[i].text;
          }
        }
        return '';
      },
    }, {
      title: '载重',
      width: 30,
      dataIndex: 'load_weight',
    }, {
      title: '已分配',
      dataIndex: 'dispatched',
      width: 20,
      render: () => {
        return (<span>否</span>);
      },
    }, {
      title: '在途',
      dataIndex: 'driving',
      width: 20,
      render: () => {
        return (<span>否</span>);
      },
    }, {
      title: this.msg('shipmtOP'),
      width: 50,
      render: (o, record) => (
        <span>
          <a role="button" onClick={() => this.showConfirm('vehicle', record)}>
          {this.msg('btnTextDispatch')}
          </a>
        </span>
      ),
    }];
  }

  state = {
    lspsVar: null,
    quotation: 0,
    podType: 'ePOD', // none, qrPOD, ePOD
    carrierSearch: '',
    plateSearch: '',
    newVehicleVisible: false,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.lsps !== this.props.lsps) {
      this.setState({ lspsVar: nextProps.lsps });
    }
  }

  lspsds = new Table.DataSource({
    fetcher: params => this.props.loadLsps(null, params),
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
        currentPage: pagination.current,
        carrier: this.state.carrierSearch,
        sortField: sorter.field,
        sortOrder: sorter.order,
      };
      return params;
    },
    remotes: this.props.lsps,
  })

  vesds = new Table.DataSource({
    fetcher: params => {
      this.setState({
        newVehicleVisible: false,
      });
      return this.props.loadVehicles(null, params);
    },
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
        currentPage: pagination.current,
        plate: this.state.plateSearch,
        sortField: sorter.field,
        sortOrder: sorter.order,
      };
      return params;
    },
    remotes: this.props.vehicles,
  })

  handleShipmtDispatch(type, target) {
    // TODO multi shipments dispatch
    const { tenantId, loginId, shipmts } = this.props;
    const podType = this.state.podType;
    const shipmtNos = shipmts.map(s => {
      return { shipmtNo: s.shipmt_no, dispId: s.key };
    });
    if (type === 'tenant') {
      this.props.doDispatch({
        tenantId,
        loginId,
        shipmtNos,
        charge: target.charge || { total_charge: this.state.quotation },
        partnerId: target.partner_id,
        partnerName: target.partner_name,
        partnerTenantId: target.partner_tenant_id,
        podType,
        type,
      }).then(result => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.onCloseWrapper(true);
        }
      });
    } else if (type === 'vehicle') {
      this.props.doDispatch({
        tenantId,
        loginId,
        shipmtNos,
        connectType: target.connect_type,
        taskId: target.vehicle_id,
        taskVehicle: target.plate_number,
        taskDriverId: target.driver_id,
        taskDriverName: target.name,
        podType,
        type,
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
      quotation: val,
      newVehicleVisible: false,
    });
  }

  handleTabChange = key => {
    this.setState({
      newVehicleVisible: false,
    });
    if (key === 'vehicle' && !this.props.vehicleLoaded) {
      const { vehicles, tenantId } = this.props;
      this.props.loadVehicles(null, {
        tenantId,
        pageSize: vehicles.pageSize,
        current: 1,
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
        current: 1,
      }).then(result => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
      });
    }
  }

  handlePodTypeChange = podType => {
    this.setState({ podType, newVehicleVisible: false });
  }
  handleCarrierSearch = value => {
    const { lsps, tenantId } = this.props;
    this.props.loadLsps(null, {
      tenantId,
      pageSize: lsps.pageSize,
      current: 1,
      carrier: value,
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
    this.setState({
      carrierSearch: value,
      newVehicleVisible: false,
    });
  }
  handlePlateSearch = value => {
    const { vehicles, tenantId } = this.props;
    this.props.loadVehicles(null, {
      tenantId,
      pageSize: vehicles.pageSize,
      current: 1,
      plate: value,
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
    this.setState({
      plateSearch: value,
      newVehicleVisible: false,
    });
  }
  handleChargeChange = (charge, index) => {
    const state = update(this.state, { lspsVar: { data:
      { [index]: { charge: { $set: charge } } } } });
    this.setState(state);
  }
  handleCostCompute = (ev, row, index) => {
    const {
      consigner_region_code, consignee_region_code, transport_mode_code,
      package: ctn, created_date: created, goods_type,
      vehicle_type, vehicle_length, total_weight, total_volume,
    } = this.props.shipmts[0];
    this.props.computeCostCharge({
      tenant_id: this.props.tenantId, created_date: created,
      partner_id: row.partner_id, consigner_region_code, consignee_region_code,
      goods_type, trans_mode: transport_mode_code, ctn,
      vehicle_type, vehicle_length, total_weight, total_volume,
    }).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else if (result.data.freight === -1) {
        message.error('未找到适合计算的价格协议');
      } else {
        const { freight, pickup, deliver, meter, quantity,
          unitRatio, gradient, miles } = result.data;
        const charge = {
          freight_charge: freight,
          pickup_charge: pickup,
          deliver_charge: deliver,
          total_charge: freight + pickup + deliver,
          charge_gradient: gradient,
          charge_amount: getChargeAmountExpression(meter, miles, quantity,
              unitRatio),
        };
        const state = update(this.state, { lspsVar: { data: {
          [index]: { charge: { $set: charge } } } } });
        this.setState(state);
      }
    });
  }
  showConfirm(type, target) {
    const [shipmt] = this.props.shipmts;
    let msg = `即将【${shipmt.shipmt_no}】分配给【${target.partner_name}】承运，请选择对回单的要求：`;
    if (type === 'vehicle') {
      msg = `将【${shipmt.shipmt_no}】分配给【${target.plate_number}】承运，请选择对回单的要求：`;
    }
    Modal.confirm({
      title: '确认回单要求',
      content: (<MContent msg={msg} onChange={this.handlePodTypeChange} />),
      okText: this.msg('btnTextOk'),
      cancelText: this.msg('btnTextCancel'),
      onOk: () => {
        this.handleShipmtDispatch(type, target);
      },
    });
  }
  handleNewCarrierClick = () => {
    const { tenantId } = this.props;
    partnerModal({
      isProvider: true,
      partnerships: ['TRS'],
      onOk: (partnerInfo) => {
        this.props.addPartner({ tenantId, partnerInfo, partnerships: partnerInfo.partnerships }).then(() => {
          message.success('合作伙伴已添加');
          const { lsps } = this.props;
          this.props.loadLsps(null, {
            tenantId,
            pageSize: lsps.pageSize,
            current: 1,
            carrier: '',
          });
        });
      },
    });
  }
  handleNewVehicleClick = () => {
    this.setState({ newVehicleVisible: true });
  }
  render() {
    const { show, shipmts, vehicles } = this.props;
    this.lspsds.remotes = this.state.lspsVar;
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
      dock = (
          <div className="dock-panel inside">
            <div className="panel-content">
              <div className="header">
                <span className="title">分配 {shipmts.length}个运单</span>
                <Tag>共{totalCount}件/{totalWeight}公斤/{totalVolume}立方</Tag>
                <div className="pull-right">
                  <Button type="ghost" shape="circle-outline" onClick={this.onCloseWrapper}>
                    <Icon type="cross" />
                  </Button>
                </div>
              </div>
              <div className="body">
                <Tabs defaultActiveKey="carrier" onChange={this.handleTabChange}>
                  <TabPane tab={this.msg('tabTextCarrier')} key="carrier">
                    <div className="pane-header">
                      <div className="tools"><Button onClick={this.handleNewCarrierClick}>新增承运商</Button></div>
                      <SearchBar placeholder={this.msg('carrierSearchPlaceholder')}
                        onInputSearch={this.handleCarrierSearch} value={this.state.carrierSearch}
                      />
                    </div>
                    <div className="pane-content tab-pane">
                      <Table size="middle" columns={this.consigneeCols} dataSource={this.lspsds} />
                    </div>
                  </TabPane>
                  <TabPane tab={this.msg('tabTextVehicle')} key="vehicle">
                    <div className="pane-header">
                      <div className="tools"><Button onClick={this.handleNewVehicleClick}>新增车辆</Button></div>
                      <SearchBar placeholder={this.msg('vehicleSearchPlaceholder')}
                        onInputSearch={this.handlePlateSearch} value={this.state.plateSearch}
                      />
                    </div>
                    <div className="pane-content tab-pane">
                      <Table size="middle" columns={this.vehicleCols} dataSource={this.vesds} />
                    </div>
                    <VehicleFormMini visible={this.state.newVehicleVisible} />
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </div>
        );
    }

    return (
      <QueueAnim key="dockcontainer" animConfig={{ translateX: [0, 600], opacity: [1, 1] }}>{dock}</QueueAnim>
    );
  }
}
