import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { DatePicker, InputNumber, Form, Row, Col, Card, Input, Switch, Select, Icon } from 'antd';
import RegionCascader from 'client/components/chinaRegionCascader';
import { setClientForm, loadFlowNodeData } from 'common/reducers/crmOrders';
import { loadTariffsByTransportInfo, loadRatesSources, loadRateEnds, toggleAddLineModal } from 'common/reducers/scofFlow';
import { uuidWithoutDash } from 'client/common/uuid';
import { GOODS_TYPES, PRESET_TRANSMODES, CONTAINER_PACKAGE_TYPE, COURIERS, TARIFF_METER_METHODS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import * as Location from 'client/util/location';
import messages from '../message.i18n';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const InputGroup = Input.Group;

@injectIntl
@connect(
  state => ({
    formRequires: state.crmOrders.formRequires,
    customerPartnerId: state.crmOrders.formData.customer_partner_id,
    serviceTeam: state.crmCustomers.operators,
    needLoadTariff: state.scofFlow.needLoadTariff,
  }),
  { setClientForm, loadFlowNodeData, loadTariffsByTransportInfo, loadRatesSources, loadRateEnds, toggleAddLineModal }
)
export default class TransportForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    index: PropTypes.number.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
    formData: PropTypes.object.isRequired,
    setClientForm: PropTypes.func.isRequired,
    customerPartnerId: PropTypes.number,
    serviceTeam: PropTypes.arrayOf(PropTypes.shape({
      lid: PropTypes.number.isRequired, name: PropTypes.string.isRequired,
    })),
    shipment: PropTypes.shape({
      cust_shipmt_pieces: PropTypes.string,
      cust_shipmt_weight: PropTypes.string,
      cust_shipmt_goods_type: PropTypes.string,
      cust_shipmt_wrap_type: PropTypes.string,
    }),
    loadTariffsByTransportInfo: PropTypes.func.isRequired,
    loadRatesSources: PropTypes.func.isRequired,
    loadRateEnds: PropTypes.func.isRequired,
    needLoadTariff: PropTypes.bool.isRequired,
    toggleAddLineModal: PropTypes.func.isRequired,
  }
  state = {
    tariffs: [],
    rateSources: [],
    rateEnds: [],
  }
  componentDidMount() {
    const { formData, formRequires, customerPartnerId } = this.props;
    const node = formData.node;
    if (!node.uuid && node.node_uuid) {
      this.props.loadFlowNodeData(node.node_uuid, node.kind).then((result) => {
        if (!result.error) {
          const nodedata = result.data;
          const consigner = formRequires.consignerLocations.filter(cl => cl.node_id === nodedata.consigner_id)[0];
          const consignee = formRequires.consigneeLocations.filter(cl => cl.node_id === nodedata.consignee_id)[0];
          const transitMode = formRequires.transitModes.filter(tm => tm.mode_code === nodedata.transit_mode)[0];
          this.handleSetClientForm({
            consigner_id: nodedata.consigner_id,
            consigner_name: consigner && consigner.name,
            consigner_province: consigner && consigner.province,
            consigner_city: consigner && consigner.city,
            consigner_district: consigner && consigner.district,
            consigner_street: consigner && consigner.street,
            consigner_region_code: consigner && consigner.region_code,
            consigner_addr: consigner && consigner.addr,
            consigner_email: consigner && consigner.email,
            consigner_contact: consigner && consigner.contact,
            consigner_mobile: consigner && consigner.mobile,
            consignee_id: nodedata.consignee_id,
            consignee_name: consignee && consignee.name,
            consignee_province: consignee && consignee.province,
            consignee_city: consignee && consignee.city,
            consignee_district: consignee && consignee.district,
            consignee_street: consignee && consignee.street,
            consignee_region_code: consignee && consignee.region_code,
            consignee_addr: consignee && consignee.addr,
            consignee_email: consignee && consignee.email,
            consignee_contact: consignee && consignee.contact,
            consignee_mobile: consignee && consignee.mobile,
            pack_count: null,
            gross_wt: null,
            goods_type: nodedata.goods_type,
            trs_mode_id: transitMode && transitMode.id,
            trs_mode_code: nodedata.transit_mode,
            trs_mode: transitMode && transitMode.mode_name,
            pod: nodedata.pod,
            quote_no: nodedata.quote_no,
            remark: '',
            package: '',
            uuid: uuidWithoutDash() });
          this.props.loadTariffsByTransportInfo(customerPartnerId, transitMode.id, nodedata.goods_type).then((result1) => {
            this.setState({
              tariffs: result1.data || [],
            });
            if (result1.data) {
              const tariff = result1.data.find(item => item.quoteNo === nodedata.quote_no);
              if (tariff) {
                this.props.loadRatesSources({
                  tariffId: tariff._id,
                  pageSize: 999999,
                  currentPage: 1,
                }).then((result2) => {
                  this.setState({ rateSources: result2.data.data || [] });
                  if (result2.data.data && consigner) {
                    const rss = result2.data.data.filter(item => item.source.province === consigner.province);
                    const promises = rss.map(item => this.props.loadRateEnds({ rateId: item._id, pageSize: 99999999, current: 1 }));
                    Promise.all(promises).then((results) => {
                      let rateEnds = [];
                      results.forEach((item) => {
                        rateEnds = rateEnds.concat(item.data.data);
                      });
                      this.setState({ rateEnds });
                    });
                  }
                });
              }
            }
          });
        }
      });
    } else {
      this.props.loadTariffsByTransportInfo(customerPartnerId, node.trs_mode_id, node.goods_type).then((result1) => {
        this.setState({
          tariffs: result1.data || [],
        });
        if (result1.data) {
          const tariff = result1.data.find(item => item.quoteNo === node.quote_no);
          if (tariff) {
            this.props.loadRatesSources({
              tariffId: tariff._id,
              pageSize: 999999,
              currentPage: 1,
            }).then((result2) => {
              this.setState({ rateSources: result2.data.data || [] });
              const consigner = formRequires.consignerLocations.find(cl => cl.node_id === node.consigner_id);
              if (result2.data.data && consigner) {
                const rss = result2.data.data.filter(item => item.source.province === consigner.province);
                const promises = rss.map(item => this.props.loadRateEnds({ rateId: item._id, pageSize: 99999999, current: 1 }));
                Promise.all(promises).then((results) => {
                  let rateEnds = [];
                  results.forEach((item) => {
                    rateEnds = rateEnds.concat(item.data.data);
                  });
                  this.setState({ rateEnds });
                });
              }
            });
          }
        }
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.needLoadTariff) {
      this.handleLoadTariffs(nextProps);
    }
  }
  handleLoadTariffs = (props) => {
    const { formData, formRequires, customerPartnerId } = props;
    const node = formData.node;
    props.loadTariffsByTransportInfo(customerPartnerId, node.trs_mode_id, node.goods_type).then((result1) => {
      this.setState({
        tariffs: result1.data || [],
      });
      if (result1.data) {
        const tariff = result1.data.find(item => item.quoteNo === node.quote_no);
        if (tariff) {
          props.loadRatesSources({
            tariffId: tariff._id,
            pageSize: 999999,
            currentPage: 1,
          }).then((result2) => {
            this.setState({ rateSources: result2.data.data || [] });
            const consigner = formRequires.consignerLocations.find(cl => cl.node_id === node.consigner_id);
            if (result2.data.data && consigner) {
              const rss = result2.data.data.filter(item => item.source.province === consigner.province);
              const promises = rss.map(item => props.loadRateEnds({ rateId: item._id, pageSize: 99999999, current: 1 }));
              Promise.all(promises).then((results) => {
                let rateEnds = [];
                results.forEach((item) => {
                  rateEnds = rateEnds.concat(item.data.data);
                });
                this.setState({ rateEnds });
              });
            }
          });
        }
      }
    });
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSetClientForm = (data) => {
    const { index, formData } = this.props;
    const newData = { ...formData, node: { ...formData.node, ...data } };
    this.props.setClientForm(index, newData);
  }
  handleChange = (key, value) => {
    this.handleSetClientForm({ [key]: value });
    if (key === 'quote_no') {
      if (value) {
        const { formRequires: { consignerLocations } } = this.props;
        const consigner = consignerLocations.find(item => item.node_id === this.props.formData.node.consigner_id);
        const tariff = this.state.tariffs.find(item => item.quoteNo === value);
        if (tariff) {
          this.props.loadRatesSources({
            tariffId: tariff._id,
            pageSize: 999999,
            currentPage: 1,
          }).then((result1) => {
            this.setState({ rateSources: result1.data.data || [] });
            if (result1.data.data) {
              const rss = result1.data.data.filter(item => item.source.province === consigner.province);
              const promises = rss.map(item => this.props.loadRateEnds({ rateId: item._id, pageSize: 99999999, current: 1 }));
              Promise.all(promises).then((results) => {
                let rateEnds = [];
                results.forEach((item) => {
                  rateEnds = rateEnds.concat(item.data.data);
                });
                this.setState({ rateEnds });
              });
            }
          });
        }
      } else {
        this.setState({
          rateSources: [],
          rateEnds: [],
        });
      }
    }
  }
  handleConsignChange = (key, value) => {
    if (typeof value !== 'string') {
      return;
    }
    const { formRequires } = this.props;
    const consignForm = {};
    if (key === 'consigner_name') {
      consignForm.consigner_name = value;
      const consign = formRequires.consignerLocations.find(item => item.name === value);
      if (consign) {
        consignForm.consigner_id = consign.node_id;
        consignForm.consigner_province = consign.province;
        consignForm.consigner_city = consign.city;
        consignForm.consigner_district = consign.district;
        consignForm.consigner_street = consign.street;
        consignForm.consigner_region_code = consign.region_code;
        consignForm.consigner_addr = consign.addr;
        consignForm.consigner_email = consign.email;
        consignForm.consigner_contact = consign.contact;
        consignForm.consigner_mobile = consign.mobile;
      } else if (!value) {
        consignForm.consigner_id = null;
        consignForm.consigner_name = null;
        consignForm.consigner_province = null;
        consignForm.consigner_city = null;
        consignForm.consigner_district = null;
        consignForm.consigner_street = null;
        consignForm.consigner_region_code = null;
        consignForm.consigner_addr = null;
        consignForm.consigner_email = null;
        consignForm.consigner_contact = null;
        consignForm.consigner_mobile = null;
      } else {
        consignForm.consigner_id = null;
      }
    } else if (key === 'consignee_name') {
      consignForm.consignee_name = value;
      const consign = formRequires.consigneeLocations.find(item => item.name === value);
      const rateEnd = this.state.rateEnds.find(rs => rs.end.code === consign.region_code);
      if (rateEnd) {
        consignForm.transit_time = rateEnd.time;
      }
      if (consign) {
        consignForm.consignee_id = consign.node_id;
        consignForm.consignee_province = consign.province;
        consignForm.consignee_city = consign.city;
        consignForm.consignee_district = consign.district;
        consignForm.consignee_street = consign.street;
        consignForm.consignee_region_code = consign.region_code;
        consignForm.consignee_addr = consign.addr;
        consignForm.consignee_email = consign.email;
        consignForm.consignee_contact = consign.contact;
        consignForm.consignee_mobile = consign.mobile;
      } else if (!value) {
        consignForm.consignee_id = null;
        consignForm.consignee_name = null;
        consignForm.consignee_province = null;
        consignForm.consignee_city = null;
        consignForm.consignee_district = null;
        consignForm.consignee_street = null;
        consignForm.consignee_region_code = null;
        consignForm.consignee_addr = null;
        consignForm.consignee_email = null;
        consignForm.consignee_contact = null;
        consignForm.consignee_mobile = null;
      } else {
        consignForm.consignee_id = null;
      }
    }
    this.handleSetClientForm(consignForm);
  }
  handleShowAddLineModal = () => {
    const { customerPartnerId, formRequires } = this.props;
    const { formData } = this.props;
    this.props.toggleAddLineModal({
      visible: true,
      quoteNo: formData.node.quote_no,
      partnerId: customerPartnerId,
      partnerName: formRequires.clients.find(item => item.partner_id === customerPartnerId).name,
      startLocation: {
        code: formData.node.consigner_region_code,
        province: formData.node.consigner_province,
        city: formData.node.consigner_city,
        district: formData.node.consigner_district,
        street: formData.node.consigner_street,
      },
    });
  }
  handleConsignSelect = (key, value) => {
    if (value === -1) {
      const { customerPartnerId, formRequires } = this.props;
      const { formData } = this.props;
      this.props.toggleAddLineModal({
        visible: true,
        quoteNo: formData.node.quote_no,
        partnerId: customerPartnerId,
        partnerName: formRequires.clients.find(item => item.partner_id === customerPartnerId).name,
        startLocation: {
          code: formData.node.consigner_region_code,
          province: formData.node.consigner_province,
          city: formData.node.consigner_city,
          district: formData.node.consigner_district,
          street: formData.node.consigner_street,
        },
      });
      return;
    }
    const consignForm = {};
    const formRequires = this.props.formRequires;
    if (key === 'consigner_name') {
      const consign = formRequires.consignerLocations.find(item => item.node_id === value);
      if (consign) {
        consignForm.consigner_id = consign.node_id;
        consignForm.consigner_name = consign.name;
        consignForm.consigner_province = consign.province;
        consignForm.consigner_city = consign.city;
        consignForm.consigner_district = consign.district;
        consignForm.consigner_street = consign.street;
        consignForm.consigner_region_code = consign.region_code;
        consignForm.consigner_addr = consign.addr;
        consignForm.consigner_email = consign.email;
        consignForm.consigner_contact = consign.contact;
        consignForm.consigner_mobile = consign.mobile;

        const { rateSources } = this.state;
        const rss = rateSources.filter(item => item.source.province === consign.province);
        const promises = rss.map(item => this.props.loadRateEnds({ rateId: item._id, pageSize: 99999999, current: 1 }));
        Promise.all(promises).then((results) => {
          let rateEnds = [];
          results.forEach((item) => {
            rateEnds = rateEnds.concat(item.data.data);
          });
          this.setState({ rateEnds });
        });
      }
    } else if (key === 'consignee_name') {
      const consign = formRequires.consigneeLocations.find(item => item.node_id === value);
      const rateEnd = this.state.rateEnds.find(rs => rs.end.code === consign.region_code);
      if (rateEnd) {
        consignForm.transit_time = rateEnd.time;
      }
      if (consign) {
        consignForm.consignee_id = consign.node_id;
        consignForm.consignee_name = consign.name;
        consignForm.consignee_province = consign.province;
        consignForm.consignee_city = consign.city;
        consignForm.consignee_district = consign.district;
        consignForm.consignee_street = consign.street;
        consignForm.consignee_region_code = consign.region_code;
        consignForm.consignee_addr = consign.addr;
        consignForm.consignee_email = consign.email;
        consignForm.consignee_contact = consign.contact;
        consignForm.consignee_mobile = consign.mobile;
      }
    }
    this.handleSetClientForm(consignForm);
  }
  handleRegionValueChange = (consignType, region) => {
    const [code, province, city, district, street] = region;
    const consign = {};
    consign[`${consignType}_region_code`] = code;
    consign[`${consignType}_province`] = province;
    consign[`${consignType}_city`] = city;
    consign[`${consignType}_district`] = district;
    consign[`${consignType}_street`] = street;
    this.handleSetClientForm(consign);
  }
  handleTransmodeChange = (value) => {
    const transportMode = this.props.formRequires.transitModes.find(item => item.id === value);
    this.handleSetClientForm({
      trs_mode_id: transportMode.id,
      trs_mode_code: transportMode.mode_code,
      trs_mode: transportMode.mode_name,
    });
    const { formData, customerPartnerId } = this.props;
    this.props.loadTariffsByTransportInfo(customerPartnerId, transportMode.id, formData.node.goods_type).then((result) => {
      this.setState({ tariffs: result.data });
    });
  }
  handlePickupChange = (pickupDt) => {
    if (pickupDt) {
      const transitTime = this.props.formData.node.transit_time || 0;
      const deliverDate = new Date(
        pickupDt.valueOf() + transitTime * ONE_DAY_MS
      );
      this.handleSetClientForm({
        pickup_est_date: pickupDt,
        deliver_est_date: moment(deliverDate),
      });
    }
  }
  handleTransitChange = (value) => {
    const pickupDt = this.props.formData.node.pickup_est_date;
    if (typeof value === 'number') {
      if (pickupDt) {
        const deliverDate = new Date(
          pickupDt.valueOf() + value * ONE_DAY_MS
        );
        this.handleSetClientForm({
          deliver_est_date: moment(deliverDate),
          transit_time: value,
        });
      } else {
        this.handleSetClientForm({
          transit_time: value,
        });
      }
    }
  }
  handleDeliveryChange = (deliverDt) => {
    if (deliverDt) {
      const transitTime = this.props.formData.node.transit_time || 0;
      const pickupDt = new Date(
        deliverDt.valueOf() - transitTime * ONE_DAY_MS
      );
      this.handleSetClientForm({
        deliver_est_date: deliverDt,
        pickup_est_date: moment(pickupDt, 'YYYY-MM-DD'),
      });
    }
  }
  handelVehicleTypeSelect = (value) => {
    const vt = this.props.formRequires.vehicleTypes.filter(vht => vht.value === value)[0];
    if (vt) {
      this.handleSetClientForm({
        vehicle_type_id: vt.value,
        vehicle_type: vt.text,
      });
    }
  }
  handelVehicleLengthSelect = (value) => {
    const vl = this.props.formRequires.vehicleLengths.filter(vhl => vhl.value === value)[0];
    if (vl) {
      this.handleSetClientForm({
        vehicle_length_id: vl.value,
        vehicle_length: vl.text,
      });
    }
  }
  handleExpressChange = (value) => {
    const exp = COURIERS.filter(cur => cur.code === value)[0];
    if (exp) {
      this.handleSetClientForm({
        express_code: exp.code,
        express_vendor: exp.name,
      });
    }
  }
  handlePersonChange = (value) => {
    const person = this.props.serviceTeam.filter(st => st.lid === value)[0];
    if (person) {
      this.handleSetClientForm({ person_id: value, person: person.name });
    }
  }
  handleCommonFieldChange = (filed, value) => {
    this.handleSetClientForm({ [filed]: value });
    if (filed === 'goods_type') {
      const { formData, customerPartnerId } = this.props;
      this.props.loadTariffsByTransportInfo(customerPartnerId, formData.node.trs_mode_id, value).then((result) => {
        this.setState({ tariffs: result.data });
      });
    }
  }
  handleShipmentRelate = () => {
    const { shipment } = this.props;
    const related = {
      goods_type: shipment.cust_shipmt_goods_type,
      gross_wt: shipment.cust_shipmt_weight,
      package: shipment.cust_shipmt_wrap_type,
      pack_count: shipment.cust_shipmt_pieces,
    };
    this.handleSetClientForm(related);
  }
  renderConsign = consign => `${consign.name} | ${Location.renderLoc(consign)} | ${consign.contact || ''}`
  renderTmsTariff = (row) => {
    let text = row.quoteNo;
    const tms = this.props.formRequires.transitModes.find(tm => tm.id === Number(row.transModeCode));
    const meter = TARIFF_METER_METHODS.find(m => m.value === row.meter);
    const goodType = GOODS_TYPES.find(m => m.value === row.goodsType);
    if (tms) text = `${text}-${tms.mode_name}`;
    if (meter) text = `${text}/${meter.text}`;
    if (goodType) text = `${text}/${goodType.text}`;
    return text;
  }
  render() {
    const { formData, serviceTeam, formRequires: { consignerLocations, consigneeLocations,
      transitModes, packagings, vehicleTypes, vehicleLengths }, customerPartnerId } = this.props;
    // todo consigner consignee by customer partner id
    const node = formData.node;
    const consignerRegion = [
      node.consigner_province, node.consigner_city,
      node.consigner_district, node.consigner_street,
    ];
    const consigneeRegion = [
      node.consignee_province, node.consignee_city,
      node.consignee_district, node.consignee_street,
    ];
    const transModeExtras = [];
    const modeCode = node.trs_mode_code;
    if (modeCode === PRESET_TRANSMODES.ftl) {
      // 整车,修改车型,车长
      transModeExtras.push(
        <Col key="vehicle_type" sm={24} md={8}>
          <FormItem label={this.msg('vehicleType')}>
            <Select onSelect={this.handelVehicleTypeSelect} value={node.vehicle_type_id}>
              {vehicleTypes.map(
                vt => <Option value={vt.value} key={`${vt.text}${vt.value}`}>{vt.text}</Option>
              )}
            </Select>
          </FormItem>
        </Col>,
        <Col key="vehicle_length" sm={24} md={8}>
          <FormItem label={this.msg('vehicleLength')}>
            <Select onSelect={this.handelVehicleLengthSelect} value={node.vehicle_length_id}>
              {vehicleLengths.map(
                vl => <Option value={vl.value} key={`${vl.text}${vl.value}`}>{vl.text}</Option>
              )}
            </Select>
          </FormItem>
        </Col>
      );
    } else if (modeCode === PRESET_TRANSMODES.ctn) {
      // 集装箱,修改箱号
      transModeExtras.push(
        <Col key="container" sm={24} md={8} >
          <FormItem label={this.msg('containerPack')}>
            <Select onSelect={value => this.handleCommonFieldChange('container', value)} value={node.container}>
              {CONTAINER_PACKAGE_TYPE.map(
                ct => <Option value={ct.key} key={ct.key}>{ct.value}</Option>
              )}
            </Select>
          </FormItem>
        </Col>,
        <Col key="container_no" sm={24} md={8}>
          <FormItem label={this.msg('containerNo')}>
            <Input value={node.container_no} onChange={ev => this.handleCommonFieldChange('container_no', ev.target.value)} />
          </FormItem>
        </Col>
      );
    } else if (modeCode === PRESET_TRANSMODES.exp) {
      // 快递公司
      transModeExtras.push(
        <Col key="courier_code" sm={24} md={8}>
          <FormItem label={this.msg('expressVendor')}>
            <Select onSelect={this.handleExpressChange} value={node.express_code}>
              {COURIERS.map(cr => <Option value={cr.code} key={cr.code}>{cr.name}</Option>)}
            </Select>
          </FormItem>
        </Col>,
        <Col key="courier_no" sm={24} md={8}>
          <FormItem label={this.msg('expressNo')}>
            <Input value={node.express_no} onChange={ev => this.handleCommonFieldChange('express_no', ev.target.value)} />
          </FormItem>
        </Col>
      );
    }
    return (
      <Card extra={<a role="presentation" onClick={this.handleShipmentRelate}><Icon type="sync" /> 提取货运信息</a>} bodyStyle={{ paddingTop: 40 }}>
        <Row gutter={20}>
          <Col sm={24} md={8}>
            <FormItem label="运输模式" required="true">
              <Select value={node.trs_mode_id} onChange={this.handleTransmodeChange}>
                {transitModes.map(
                  tm => <Option value={tm.id} key={`${tm.mode_code}${tm.id}`}>{tm.mode_name}</Option>
                )}
              </Select>
            </FormItem>
          </Col>
          {transModeExtras}
        </Row>
        <Row gutter={20}>
          <Col sm={24} md={8}>
            <FormItem label="货物类型">
              <Select value={node.goods_type} onChange={value => this.handleCommonFieldChange('goods_type', value)}>
                {GOODS_TYPES.map(gt => <Option value={gt.value} key={gt.value}>{gt.text}</Option>)}
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label={this.msg('quoteNo')}>
              <Select allowClear value={node.quote_no} onChange={value => this.handleChange('quote_no', value)}>
                {
                  this.state.tariffs.map(t => <Option value={t.quoteNo} key={t._id}>{this.renderTmsTariff(t)}</Option>)
                }
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label={this.msg('personResponsible')}>
              <Select size="large" value={node.person_id} onChange={this.handlePersonChange}>
                {serviceTeam.map(st => <Option value={st.lid} key={st.lid}>{st.name}</Option>)}
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col sm={24} md={8}>
            <FormItem label={this.msg('packageNum')}>
              <InputGroup compact>
                <Input type="number" style={{ width: '50%' }} value={node.pack_count} onChange={e => this.handleChange('pack_count', e.target.value)} />
                <Select size="large" style={{ width: '50%' }} placeholder="选择包装方式"
                  value={node.package} onChange={value => this.handleCommonFieldChange('package', value)}
                >
                  {packagings.map(
                    pk => <Option value={pk.package_code} key={pk.package_code}>{pk.package_name}</Option>
                  )}
                </Select>
              </InputGroup>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label={this.msg('delgGrossWt')}>
              <Input value={node.gross_wt} addonAfter="千克" type="number"
                onChange={e => this.handleCommonFieldChange('gross_wt', e.target.value)}
              />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col sm={12}>
            <FormItem label="发货方">
              <Row style={{ paddingRight: 8 }}>
                <Select allowClear size="large" showArrow value={node.consigner_id} optionLabelProp="children"
                  onChange={value => this.handleConsignChange('consigner_name', value)}
                  onSelect={value => this.handleConsignSelect('consigner_name', value)}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 400 }}
                  optionFilterProp="children"
                  showSearch
                  notFoundContent={<a onClick={this.handleShowAddLineModal}>+ 添加地址</a>}
                >
                  {consignerLocations.filter(cl => cl.ref_partner_id === customerPartnerId || cl.ref_partner_id === -1)
                    .map(dw => <Option value={dw.node_id} key={dw.node_id}>{this.renderConsign(dw)}</Option>)
                }
                  <Option value={-1} key={-1}>+ 添加地址</Option>
                </Select>
              </Row>
              <Row style={{ marginTop: 10 }}>
                <InputGroup size="large">
                  <Col span="12">
                    <RegionCascader defaultRegion={consignerRegion} region={consignerRegion}
                      onChange={region => this.handleRegionValueChange('consigner', region)}
                    />
                  </Col>
                  <Col span="12">
                    <Input prefix={<Icon type="environment-o" />} value={node.consigner_addr}
                      onChange={e => this.handleChange('consigner_addr', e.target.value)}
                      placeholder="详细地址"
                    />
                  </Col>
                </InputGroup>
              </Row>
              <Row>
                <InputGroup size="large">
                  <Input style={{ width: '33.33%' }} prefix={<Icon type="user" />} value={node.consigner_contact}
                    onChange={e => this.handleChange('consigner_contact', e.target.value)}
                    placeholder="联系人"
                  />
                  <Input style={{ width: '33.33%' }} prefix={<Icon type="mobile" />} value={node.consigner_mobile} type="tel"
                    onChange={e => this.handleChange('consigner_mobile', e.target.value)}
                    placeholder="电话"
                  />
                  <Input style={{ width: '33.33%' }} prefix={<Icon type="mail" />} value={node.consigner_email} type="email"
                    onChange={e => this.handleChange('consigner_email', e.target.value)}
                    placeholder="邮箱"
                  />
                </InputGroup>
              </Row>
            </FormItem>
          </Col>
          <Col sm={12}>
            <FormItem label="收货方">
              <Row style={{ paddingRight: 8 }}>
                <Select allowClear size="large" showArrow value={node.consignee_id} optionLabelProp="children"
                  onChange={value => this.handleConsignChange('consignee_name', value)}
                  onSelect={value => this.handleConsignSelect('consignee_name', value)}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 400 }}
                  optionFilterProp="children"
                  showSearch
                  notFoundContent={<a onClick={this.handleShowAddLineModal}>+ 添加地址</a>}
                >
                  {consigneeLocations.filter(cl => cl.ref_partner_id === customerPartnerId || cl.ref_partner_id === -1)
                    .map(dw => <Option value={dw.node_id} key={dw.node_id}>{this.renderConsign(dw)}</Option>)
                }
                  <Option value={-1} key={-1}>+ 添加地址</Option>
                </Select>
              </Row>
              <Row style={{ marginTop: 10 }}>
                <InputGroup size="large">
                  <Col span="12">
                    <RegionCascader defaultRegion={consigneeRegion} region={consigneeRegion}
                      onChange={region => this.handleRegionValueChange('consignee', region)}
                    />
                  </Col>
                  <Col span="12">
                    <Input prefix={<Icon type="environment-o" />} value={node.consignee_addr}
                      onChange={e => this.handleChange('consignee_addr', e.target.value)}
                      placeholder="详细地址"
                    />
                  </Col>
                </InputGroup>
              </Row>
              <Row>
                <InputGroup size="large">
                  <Input style={{ width: '33.33%' }} prefix={<Icon type="user" />} value={node.consignee_contact}
                    onChange={e => this.handleChange('consignee_contact', e.target.value)}
                    placeholder="联系人"
                  />
                  <Input style={{ width: '33.33%' }} prefix={<Icon type="mobile" />} value={node.consignee_mobile} type="tel"
                    onChange={e => this.handleChange('consignee_mobile', e.target.value)}
                    placeholder="电话"
                  />
                  <Input style={{ width: '33.33%' }} prefix={<Icon type="mail" />} value={node.consignee_email} type="email"
                    onChange={e => this.handleChange('consignee_email', e.target.value)}
                    placeholder="邮箱"
                  />
                </InputGroup>
              </Row>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col sm={24} md={8}>
            <FormItem label={this.msg('pickupEstDate')}>
              <DatePicker style={{ width: '100%' }} value={node.pickup_est_date && moment(new Date(node.pickup_est_date), 'YYYY-MM-DD')}
                onChange={this.handlePickupChange}
              />
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label={this.msg('shipmtTransit')}>
              <InputNumber style={{ width: '100%' }} min={0} value={node.transit_time}
                onChange={this.handleTransitChange}
              />
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label={this.msg('deliveryEstDate')}>
              <DatePicker style={{ width: '100%' }} value={node.deliver_est_date && moment(new Date(node.deliver_est_date), 'YYYY-MM-DD')}
                onChange={this.handleDeliveryChange}
              />
            </FormItem>
          </Col>
        </Row>

        <Row gutter={20}>
          <Col sm={24} md={8}>
            <FormItem label="备注">
              <Input value={node.remark} onChange={e => this.handleCommonFieldChange('remark', e.target.value)} />
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label="回单">
              <Switch checked={node.pod} onChange={checked => this.handleCommonFieldChange('pod', checked)} />
            </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
