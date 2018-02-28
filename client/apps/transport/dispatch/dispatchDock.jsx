/* eslint no-loop-func: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Tag, Button, /* Popover, */ message, Row, Col, Tabs } from 'antd';
import DockPanel from 'client/components/DockPanel';
import DataTable from 'client/components/DataTable';
import InfoItem from 'client/components/InfoItem';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadLsps, loadVehicles, doDispatch, doDispatchAndSend, showDispatchConfirmModal, changeDockStatus } from 'common/reducers/transportDispatch';
import { addPartner } from 'common/reducers/partner';
import { computeCostCharges } from 'common/reducers/shipment';
// import ChargeSpecForm from '../shipment/forms/chargeSpec';
import SearchBox from 'client/components/SearchBox';
import DispatchConfirmModal from './DispatchConfirmModal';
import CarrierModal from '../resources/modals/carrierModal';
import VehicleFormMini from '../resources/components/VehicleForm-mini';
import { toggleCarrierModal } from 'common/reducers/transportResources';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const TabPane = Tabs.TabPane;
const formatMsg = format(messages);

export function RowClick(props) {
  const {
    text, onClick, row, index,
  } = props;
  function handleClick(ev) {
    onClick(ev, row, index);
  }
  return <a role="presentation" onClick={handleClick}>{text}</a>;
}

RowClick.propTypes = {
  row: PropTypes.object.isRequired,
  index: PropTypes.number,
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

function fetch({ state, dispatch, cookie }) {
  return dispatch(loadLsps(cookie, {
    tenantId: state.account.tenantId,
    pageSize: state.transportDispatch.lsps.pageSize,
    currentPage: state.transportDispatch.lsps.current,
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
    lsps: state.transportDispatch.lsps,
    vehicles: state.transportDispatch.vehicles,
    vehicleLoaded: state.transportDispatch.vehicleLoaded,
    lspLoaded: state.transportDispatch.lspLoaded,
    dispatched: state.transportDispatch.dispatched,
    vehicleTypes: state.transportDispatch.vehicleTypes,
    vehicleLengths: state.transportDispatch.vehicleLengths,
    shipmts: state.transportDispatch.shipmts,
    dispatchConfirmModal: state.transportDispatch.dispatchConfirmModal,
    visible: state.transportDispatch.dispDockShow,
  }),
  {
    loadLsps,
    loadVehicles,
    doDispatch,
    doDispatchAndSend,
    addPartner,
    computeCostCharges,
    toggleCarrierModal,
    showDispatchConfirmModal,
    changeDockStatus,
  }
)
export default class DispatchDock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    shipmts: PropTypes.array.isRequired,
    lsps: PropTypes.object.isRequired,
    loadLsps: PropTypes.func.isRequired,
    vehicles: PropTypes.object.isRequired,
    loadVehicles: PropTypes.func.isRequired,
    vehicleLoaded: PropTypes.bool.isRequired,
    lspLoaded: PropTypes.bool.isRequired,
    doDispatch: PropTypes.func.isRequired,
    dispatched: PropTypes.bool.isRequired,
    vehicleTypes: PropTypes.array.isRequired,
    vehicleLengths: PropTypes.array.isRequired,
    computeCostCharges: PropTypes.func.isRequired,
    doDispatchAndSend: PropTypes.func.isRequired,
    toggleCarrierModal: PropTypes.func.isRequired,
    showDispatchConfirmModal: PropTypes.func.isRequired,
    dispatchConfirmModal: PropTypes.object.isRequired,
    changeDockStatus: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.onClose = () => {
      this.props.changeDockStatus({ dispDockShow: false, shipmts: [] });
    };
    this.onCloseWrapper = (reload) => {
      this.setState({ quotation: 0, podType: 'ePOD' });
      this.onClose(reload);
    };
    this.consigneeCols = [{
      title: '承运商',
      dataIndex: 'partner_name',
      render: (o, record) => (
        <span>
          {record.partner_tenant_id > 0 ? <Badge status="success" /> : <Badge status="default" />}
          {record.partner_name}
        </span>
      ),
    }, {
      title: '成本价（元）',
      dataIndex: 'charge',
      width: 120,
      render: (o, record, index) => {
        if (o) {
          const charge = o.reduce((a, b) => ({
            freight_charge: a.freight_charge + b.freight_charge,
            pickup_charge: a.pickup_charge + b.pickup_charge,
            deliver_charge: a.deliver_charge + b.deliver_charge,
            total_charge: a.total_charge + b.total_charge,
          }), {
            freight_charge: 0,
            pickup_charge: 0,
            deliver_charge: 0,
            total_charge: 0,
          });
          return <span>{charge.total_charge.toFixed(2)}</span>;
          { /*
            <Popover placement="rightBottom" title={`${record.partner_name} 价格明细`} content={
              <ChargeSpecForm charges={o} onChange={this.handleChargeChange} index={index} />
              }
            >
              <span>{charge.total_charge.toFixed(2)}</span>
            </Popover> */ }
        }
        return '';
      },
    }, {
      title: this.msg('shipmtOP'),
      width: 60,
      dataIndex: 'OPS_COL',
      render: (o, record) => (
        <span>
          <a role="presentation" onClick={() => this.showConfirm('tenant', record)}>
            {this.msg('btnTextDispatch')}
          </a>
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
        if (this.props.vehicleTypes && this.props.vehicleTypes[t]) {
          return this.props.vehicleTypes[t].text;
        }
        return '';
      },
    }, {
      title: '车长',
      dataIndex: 'length',
      width: 30,
      render: (l) => {
        for (let i = 0; i < this.props.vehicleLengths.length; i++) {
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
      render: () => (<span>否</span>),
    }, {
      title: '在途',
      dataIndex: 'driving',
      width: 20,
      render: () => (<span>否</span>),
    }, {
      title: this.msg('shipmtOP'),
      width: 50,
      dataIndex: 'OPS_COL',
      render: (o, record) => (
        <span>
          <a role="presentation" onClick={() => this.showConfirm('vehicle', record)}>
            {this.msg('btnTextDispatch')}
          </a>
        </span>
      ),
    }];
  }

  state = {
    lspsVar: { data: [] },
    quotation: 0,
    podType: 'ePOD', // none, qrPOD, ePOD
    carrierSearch: '',
    plateSearch: '',
    newVehicleVisible: false,
    lspLoading: true,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.shipmts.length > 0 && nextProps.shipmts !== this.props.shipmts || (nextProps.lsps.pageSize !== this.state.lspsVar.pageSize
      || nextProps.lsps.current !== this.state.lspsVar.current
      || nextProps.lsps.data.length !== this.state.lspsVar.data.length)) {
      this.setState({ lspLoading: true });
      const lspsVar = { ...nextProps.lsps };

      const shs = nextProps.shipmts.map((item) => {
        const {
          shipmt_no,
          consigner_region_code,
          consigner_byname,
          consigner_province,
          consigner_city,
          consigner_district,
          consigner_street,
          consignee_region_code,
          consignee_byname,
          consignee_province,
          consignee_city,
          consignee_district,
          consignee_street,
          transport_mode_code, container: ctn, created_date: created, goods_type,
          vehicle_type_id, vehicle_length_id, total_weight, total_volume,
          pickup_est_date, deliver_est_date,
        } = item;
        return {
          shipmt_no,
          tenant_id: this.props.tenantId,
          created_date: created,
          // partner_id: row.partner_id,
          consigner_region_code,
          consigner_byname,
          consigner_province,
          consigner_city,
          consigner_district,
          consigner_street,
          consignee_region_code,
          consignee_byname,
          consignee_province,
          consignee_city,
          consignee_district,
          consignee_street,
          goods_type,
          transport_mode_code,
          ctn,
          vehicle_type_id,
          vehicle_length_id,
          total_weight,
          total_volume,
          pickup_est_date,
          deliver_est_date,
          tariffType: 'all',
        };
      });
      const lsps = lspsVar.data.map(item => item.partner_id);
      this.props.computeCostCharges({ shipmts: shs, lsps }).then((result) => {
        for (let i = 0; i < lspsVar.data.length; i++) {
          lspsVar.data[i].charge = result.data[i].charge;
        }
        this.setState({ lspsVar, lspLoading: false });
      });
      if (lspsVar.data.length === 0) {
        this.setState({ lspsVar, lspLoading: false });
      }
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values);
  lspsds = new DataTable.DataSource({
    fetcher: params => this.props.loadLsps(null, params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
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

  vesds = new DataTable.DataSource({
    fetcher: (params) => {
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
      showTotal: total => `共 ${total} 条`,
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

  handleShipmtDispatch() {
    // TODO multi shipments dispatch
    const { type, target } = this.props.dispatchConfirmModal;
    const { tenantId, loginId, shipmts } = this.props;
    const podType = this.state.podType;
    const shipmtNos = shipmts.map(s => ({ shipmtNo: s.shipmt_no, dispId: s.key, deliverPrmDate: s.deliver_prm_date }));
    if (type === 'tenant') {
      this.props.doDispatch({
        tenantId,
        loginId,
        shipmtNos,
        charge: target.charge,
        partnerId: target.partner_id,
        partnerName: target.partner_name,
        partnerTenantId: target.partner_tenant_id,
        podType,
        type,
      }).then((result) => {
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
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.onCloseWrapper(true);
        }
      });
    }
  }

  handleShipmtDispatchAndSend = () => {
    // TODO multi shipments dispatch
    const { type, target } = this.props.dispatchConfirmModal;
    const {
      tenantId, loginId, loginName, shipmts,
    } = this.props;
    const podType = this.state.podType;
    const shipmtNos = shipmts.map(s => ({ shipmtNo: s.shipmt_no, dispId: s.key, deliverPrmDate: s.deliver_prm_date }));
    if (type === 'tenant') {
      this.props.doDispatchAndSend({
        tenantId,
        loginId,
        loginName,
        shipmtNos,
        charge: target.charge,
        partnerId: target.partner_id,
        partnerName: target.partner_name,
        partnerTenantId: target.partner_tenant_id,
        podType,
        type,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.onCloseWrapper(true);
        }
      });
    } else if (type === 'vehicle') {
      this.props.doDispatchAndSend({
        tenantId,
        loginId,
        loginName,
        shipmtNos,
        connectType: target.connect_type,
        taskId: target.vehicle_id,
        taskVehicle: target.plate_number,
        taskDriverId: target.driver_id,
        taskDriverName: target.name,
        podType,
        type,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.onCloseWrapper(true);
        }
      });
    }
  }

  handleQuotationChange = (val) => {
    this.setState({
      quotation: val,
      newVehicleVisible: false,
    });
  }

  handleTabChange = (key) => {
    this.setState({
      newVehicleVisible: false,
    });
    if (key === 'vehicle' && !this.props.vehicleLoaded) {
      const { vehicles, tenantId } = this.props;
      this.props.loadVehicles(null, {
        tenantId,
        pageSize: vehicles.pageSize,
        current: 1,
      }).then((result) => {
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
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
      });
    }
  }

  handlePodTypeChange = (podType) => {
    this.setState({ podType, newVehicleVisible: false });
  }
  handleCarrierSearch = (value) => {
    const { lsps, tenantId } = this.props;
    this.props.loadLsps(null, {
      tenantId,
      pageSize: lsps.pageSize,
      current: 1,
      carrier: value,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
    this.setState({
      carrierSearch: value,
      newVehicleVisible: false,
    });
  }
  handlePlateSearch = (value) => {
    const { vehicles, tenantId } = this.props;
    this.props.loadVehicles(null, {
      tenantId,
      pageSize: vehicles.pageSize,
      current: 1,
      plate: value,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
    this.setState({
      plateSearch: value,
      newVehicleVisible: false,
    });
  }
  handleCarrierLoad = () => {
    const { lsps, tenantId } = this.props;
    this.props.loadLsps(null, {
      tenantId,
      pageSize: lsps.pageSize,
      current: 1,
      carrier: '',
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleChargeChange = (charges, index) => {
    const state = update(this.state, {
      lspsVar: {
        data:
      { [index]: { charge: { $set: charges } } },
      },
    });
    this.setState(state);
  }
  showConfirm(type, target) {
    this.props.showDispatchConfirmModal(true, type, target);
  }
  handleNewCarrierClick = () => {
    this.props.toggleCarrierModal(true, 'add');
  }
  handleNewVehicleClick = () => {
    this.setState({ newVehicleVisible: true });
  }
  handleTagClose = (shipmtNo) => {
    const shipmts = [...this.props.shipmts];
    const index = shipmts.findIndex(item => item.shipmt_no === shipmtNo);
    shipmts.splice(index, 1);
    this.props.changeDockStatus({ shipmts });
  }
  renderTabs() {
    const { vehicles } = this.props;
    this.lspsds.remotes = this.state.lspsVar;
    this.vesds.remotes = vehicles;
    const toolbarActionsConsignee = (
      <span>
        <SearchBox
          placeholder={this.msg('carrierSearchPlaceholder')}
          onSearch={this.handleCarrierSearch}
        />
        <Button onClick={this.handleNewCarrierClick}>新增承运商</Button>
      </span>
    );
    const toolbarActionsVehicle = (
      <span>
        <SearchBox
          placeholder={this.msg('vehicleSearchPlaceholder')}
          onSearch={this.handlePlateSearch}
        />
        <Button onClick={this.handleNewVehicleClick}>新增车辆</Button>
      </span>
    );
    return (<Tabs defaultActiveKey="carrier" onChange={this.handleTabChange}>
      <TabPane tab={this.msg('tabTextCarrier')} key="carrier">
        <div className="pane-content tab-pane">
          <DataTable toolbarActions={toolbarActionsConsignee} size="middle" columns={this.consigneeCols} dataSource={this.lspsds} loading={this.state.lspLoading} />
        </div>
      </TabPane>
      <TabPane tab={this.msg('tabTextVehicle')} key="vehicle">
        <div className="pane-content tab-pane">
          <DataTable toolbarActions={toolbarActionsVehicle} size="middle" columns={this.vehicleCols} dataSource={this.vesds} />
        </div>
        <VehicleFormMini visible={this.state.newVehicleVisible} />
      </TabPane>
    </Tabs>);
  }
  renderExtra() {
    const { shipmts, visible } = this.props;
    let totalCount = 0;
    let totalWeight = 0;
    let totalVolume = 0;
    const arr = [];
    if (visible && shipmts.length > 0) {
      let close = true;

      if (shipmts.length === 1) {
        close = false;
      }
      shipmts.forEach((v) => {
        arr.push((<Tag closable={close} color="blue" onClose={() => this.handleTagClose(v.shipmt_no)}>{v.shipmt_no}</Tag>));
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
    }
    return (<Row>
      <Col span="12">
        {arr}
      </Col>
      <Col span="4">
        <InfoItem
          label="总件数"
          field={totalCount}
        />
      </Col>
      <Col span="4">
        <InfoItem
          label="总重量"
          field={totalWeight}
        />
      </Col>
      <Col span="4">
        <InfoItem
          label="总体积"
          field={totalVolume}
        />
      </Col>
    </Row>);
  }
  render() {
    const { shipmts, visible } = this.props;
    return (
      <DockPanel
        visible={visible}
        onClose={this.onClose}
        title={`分配 ${shipmts.length}个运单`}
        extra={this.renderExtra()}
      >
        {this.renderTabs()}
        <DispatchConfirmModal
          shipmts={shipmts}
          onChange={this.handlePodTypeChange}
          onDispatchAndSend={() => this.handleShipmtDispatchAndSend()}
          onDispatch={() => this.handleShipmtDispatch()}
        />
        <CarrierModal onOk={this.handleCarrierLoad} />
      </DockPanel>
    );
  }
}
