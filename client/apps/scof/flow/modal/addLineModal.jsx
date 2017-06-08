/* eslint react/no-multi-comp: 0 */
import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Card, Radio, Input, Select, Row, Col, Button, Steps, message } from 'antd';
import RegionCascade from 'client/components/region-cascade';
import { TARIFF_METER_METHODS, GOODS_TYPES } from 'common/constants';
import { toggleAddLineModal, loadTariffsByTransportInfo, loadRatesSources, addLinesAndPublish,
loadScvTrackings, loadTmsBizParams, setNeedLoadTariff } from 'common/reducers/scofFlow';
import { loadFormRequires } from 'common/reducers/crmOrders';
import { getEndTableVarColumns } from 'client/apps/transport/tariff/forms/commodity';
import { addNode } from 'common/reducers/transportResources';
import * as Location from 'client/util/location';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;

const InputGroup = Input.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Step = Steps.Step;

@injectIntl
class Node extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    index: PropTypes.number.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleRemove: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleChange = (field, value) => {
    const { index } = this.props;
    if (field === 'region') {
      const [code, province, city, district, street] = value;
      const region = Object.assign({}, { region_code: code, province, city, district, street });
      this.props.handleChange(index, region);
    } else {
      this.props.handleChange(index, { [field]: value });
    }
  }
  render() {
    const { index, node } = this.props;
    return (
      <Card>
        <Row gutter={10}>
          <Col span="12">
            <FormItem label={this.msg('locationType')}>
              <RadioGroup value={node.type} size="large" onChange={e => this.handleChange('type', e.target.value)}>
                <RadioButton value={0}>发货地</RadioButton>
                <RadioButton value={1}>收货地</RadioButton>
                <RadioButton value={2}>中转地</RadioButton>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label={this.msg('locationName')}>
              <Input value={node.name} onChange={e => this.handleChange('name', e.target.value)} />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span="12">
            <FormItem label={this.msg('locationProvince')}>
              <RegionCascade
                defaultRegion={[node.province, node.city, node.district, node.street]}
                onChange={value => this.handleChange('region', value)}
              />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label={this.msg('locationAddress')}>
              <Input value={node.addr} onChange={e => this.handleChange('addr', e.target.value)} />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span="24">
            <FormItem label={this.msg('locationContact')}>
              <InputGroup>
                <Input value={node.contact} style={{ width: '33.33%' }} placeholder="联系人" onChange={e => this.handleChange('contact', e.target.value)} />
                <Input value={node.mobile} style={{ width: '33.33%' }} placeholder="电话" onChange={e => this.handleChange('mobile', e.target.value)} />
                <Input value={node.email} style={{ width: '33.33%' }} placeholder="邮箱" onChange={e => this.handleChange('email', e.target.value)} />
              </InputGroup>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Button size="large" style={{ float: 'right', width: 100 }} icon="delete" onClick={() => this.props.handleRemove(index)} />
        </Row>
      </Card>
    );
  }
}

@injectIntl
@connect(
  state => ({
    formRequires: state.crmOrders.formRequires,
  }),
  { }
)
class End extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    index: PropTypes.number.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleRemove: PropTypes.func.isRequired,
    startLocations: PropTypes.array.isRequired,
    tariff: PropTypes.object.isRequired,
    line: PropTypes.object.isRequired,
    formRequires: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleChange = (field, value) => {
    const { index, startLocations } = this.props;
    if (field === 'source') {
      const region = Object.assign({}, startLocations[value]);
      this.props.handleChange(index, { source: region });
    } else {
      this.props.handleChange(index, { [field]: value });
    }
  }
  render() {
    const { index, tariff, formRequires: { transitModes, vehicleTypes, vehicleLengths }, startLocations, line } = this.props;
    let varColumns = [];
    if (tariff) varColumns = getEndTableVarColumns(tariff, transitModes, vehicleTypes, vehicleLengths);
    const style = { width: '33.33%', display: 'inline-block', paddingLeft: 5, paddingRight: 5 };
    return (
      <Card>
        <FormItem label="起始地" style={style}>
          <Select value={line.source ? startLocations.findIndex(item => item.code === line.source.code) : null} onChange={value => this.handleChange('source', value)} style={{ width: '100%' }}>
            {startLocations.map((item, i) =>
              (<Option key={item.code} value={i}>
                {Location.renderLoc(item)}
              </Option>))}
          </Select>
        </FormItem>
        <FormItem label="目的地" style={style}>
          <Input disabled value={Location.renderLoc(line)} />
        </FormItem>
        <FormItem label="目的地别名" style={style}>
          <Input value={line.name} onChange={e => this.handleChange('name', e.target.value)} />
        </FormItem>
        <FormItem label="运输时间" style={style}>
          <Input type="number" value={line.time} onChange={e => this.handleChange('time', Number(e.target.value))} />
        </FormItem>
        <FormItem label="公里数" style={style}>
          <Input type="number" value={line.km} onChange={e => this.handleChange('km', Number(e.target.value))} />
        </FormItem>
        <FormItem label="起步价" style={style}>
          <Input type="number" value={line.flare} onChange={e => this.handleChange('flare', Number(e.target.value))} />
        </FormItem>
        {varColumns.map(item =>
          (<FormItem label={item.title} style={style}>
            <Input type="number" value={line[`gradients${item.index}`]} onChange={e => this.handleChange(`gradients${item.index}`, Number(e.target.value))} />
          </FormItem>))}
        <Row>
          <Button size="large" style={{ float: 'right', width: 100 }} icon="delete" onClick={() => this.props.handleRemove(index)} />
        </Row>
      </Card>
    );
  }
}

@injectIntl
@connect(
  state => ({
    visible: state.scofFlow.addLineModal.visible,
    quoteNo: state.scofFlow.addLineModal.quoteNo,
    partnerId: state.scofFlow.addLineModal.partnerId,
    partnerName: state.scofFlow.addLineModal.partnerName,
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    customerPartners: state.partner.partners,
    tmsParams: state.scofFlow.tmsParams,
  }),
  { toggleAddLineModal,
    loadTariffsByTransportInfo,
    loadRatesSources,
    addNode,
    addLinesAndPublish,
    loadScvTrackings,
    loadTmsBizParams,
    loadFormRequires,
    setNeedLoadTariff }
)

export default class AddLineModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    quoteNo: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    loadTariffsByTransportInfo: PropTypes.func.isRequired,
    toggleAddLineModal: PropTypes.func.isRequired,
    partnerId: PropTypes.number.isRequired,
    partnerName: PropTypes.number.isRequired,
    tmsParams: PropTypes.object.isRequired,
    loadRatesSources: PropTypes.func.isRequired,
    addNode: PropTypes.func.isRequired,
    addLinesAndPublish: PropTypes.func.isRequired,
    loadTmsBizParams: PropTypes.func.isRequired,
    loadFormRequires: PropTypes.func.isRequired,
    setNeedLoadTariff: PropTypes.bool.isRequired,
  }
  state = {
    nodes: [{ type: 0 }],
    lines: [{ }],
    tariffs: [],
    quoteNo: '',
    step: 0,
    rateSources: [],
  }
  componentWillMount() {
    this.props.loadTariffsByTransportInfo(this.props.partnerId, -1, -1).then((result) => {
      this.setState({
        tariffs: result.data || [],
      });
    });
  }
  componentWillReceiveProps(nextProps) {
    const { quoteNo } = nextProps;
    if (this.props.partnerId !== nextProps.partnerId || (this.props.visible !== nextProps.visible && nextProps.partnerId)) {
      this.props.loadTariffsByTransportInfo(nextProps.partnerId, -1, -1).then((result) => {
        this.setState({
          tariffs: result.data || [],
        });
        if (quoteNo) {
          this.setState({ quoteNo });
          const tariff = result.data.find(item => item.quoteNo === quoteNo);
          if (tariff) {
            this.props.loadRatesSources({
              tariffId: tariff._id,
              pageSize: 999999,
              currentPage: 1,
            }).then((result1) => {
              this.setState({ rateSources: result1.data.data || [] });
            });
          }
        }
      });
    }
    if (quoteNo) {
      this.setState({ quoteNo });
      const tariff = this.state.tariffs.find(item => item.quoteNo === quoteNo);
      if (tariff) {
        this.props.loadRatesSources({
          tariffId: tariff._id,
          pageSize: 999999,
          currentPage: 1,
        }).then((result1) => {
          this.setState({ rateSources: result1.data.data || [] });
        });
      }
    }
  }
  validateNodes = () => {
    const { nodes } = this.state;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node.region_code) {
        message.error(`请选择第${i + 1}个地点的地址`);
        return false;
      }
    }
    return true;
  }
  validateEnds = () => {
    const { lines } = this.state;
    const tariff = this.state.tariffs.find(item => item.quoteNo === this.props.quoteNo);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.source || !line.source.code) {
        message.error(`报价协议第${i + 1}条线路的起始地未选择`);
        return false;
      }
      if (!line.km) {
        message.error(`报价协议第${i + 1}条线路的公里数未填写`);
      }
      if (!line.flare) {
        message.error(`报价协议第${i + 1}条线路的起步价未填写`);
      }
      if (tariff && tariff.intervals) {
        for (let j = 0; j < tariff.intervals.length; j++) {
          if (!line[`gradients${j}`]) {
            message.error(`报价协议第${i + 1}条线路的费率不完整`);
            return false;
          }
        }
      }
    }
    return true;
  }
  handleSaveLocations = () => {
    const { partnerId, tenantId, partnerName } = this.props;
    if (this.validateNodes()) {
      const promises = this.state.nodes.map(node => this.props.addNode({
        ...node,
        ref_partner_id: partnerId,
        ref_partner_name: partnerName,
        tenant_id: tenantId,
      }));
      Promise.all(promises).then(() => {
        this.handleCancel();
        message.info('保存成功');
      });
    }
  }
  handleSaveLocationsAndTariff = () => {
    const { nodes, lines } = this.state;
    const { partnerId, tenantId, partnerName, quoteNo, loginName } = this.props;
    if (this.validateEnds()) {
      const promises = nodes.map(node => this.props.addNode({
        ...node,
        ref_partner_id: partnerId,
        ref_partner_name: partnerName,
        tenant_id: tenantId,
      }));
      promises.push(this.props.addLinesAndPublish({
        sources: nodes.filter(item => item.type === 0).map(item => ({
          code: item.region_code,
          province: item.province,
          city: item.city,
          district: item.district,
          street: item.street,
        })),
        lines,
        quoteNo,
        loginName,
      }));
      Promise.all(promises).then(() => {
        this.handleCancel();
        this.props.loadFormRequires({ tenantId });
        this.props.loadTmsBizParams(tenantId);
        this.props.setNeedLoadTariff(true);
        message.info('保存成功');
        this.setState({
          step: 0,
          nodes: [{ type: 0 }],
          lines: [{ }],
        });
      });
    }
  }
  handleBindTariff = () => {
    if (this.validateNodes()) {
      this.setState({ step: this.state.step + 1 });
    }
  }
  handleCancel = () => {
    this.props.toggleAddLineModal({ visible: false });
  }
  handleAddNode = () => {
    this.setState({ nodes: [...this.state.nodes, { type: 0 }] });
  }
  handleRemoveNode = (index) => {
    const nodes = [...this.state.nodes];
    nodes.splice(index - 1, 1);
    this.setState({ nodes });
  }
  handleNodeChange = (index, data) => {
    const node = { ...this.state.nodes[index], ...data };
    const nodes = [...this.state.nodes];
    nodes.splice(index, 1, node);
    const lines = nodes.filter(item => item.type === 1)
    .map(item => ({ code: item.region_code, province: item.province, city: item.city, district: item.district, street: item.street }));
    this.setState({ nodes, lines });
  }
  handleRemoveEnd = (index) => {
    const lines = [...this.state.lines];
    lines.splice(index - 1, 1);
    this.setState({ lines });
  }
  handleEndChange = (index, data) => {
    const node = { ...this.state.lines[index], ...data };
    const lines = [...this.state.lines];
    lines.splice(index, 1, node);
    this.setState({ lines });
  }
  handleTariffSelect = (value) => {
    const tariff = this.state.tariffs.find(item => item.quoteNo === value);
    if (tariff) {
      this.setState({ quoteNo: value, tariff });
      this.props.loadRatesSources({
        tariffId: tariff._id,
        pageSize: 999999,
        currentPage: 1,
      }).then((result1) => {
        this.setState({ rateSources: result1.data.data || [] });
      });
    }
  }
  msg = formatMsg(this.props.intl)
  renderTmsTariff = (row) => {
    let text = row.quoteNo;
    const tms = this.props.tmsParams.transitModes.find(tm => tm.id === Number(row.transModeCode));
    const meter = TARIFF_METER_METHODS.find(m => m.value === row.meter);
    const goodType = GOODS_TYPES.find(m => m.value === row.goodsType);
    if (tms) text = `${text}-${tms.mode_name}`;
    if (meter) text = `${text}/${meter.text}`;
    if (goodType) text = `${text}/${goodType.text}`;
    return text;
  }
  render() {
    const { visible } = this.props;
    const { step, tariffs, quoteNo, lines, rateSources } = this.state;
    const startLocations = this.state.nodes.filter(item => item.type === 0);
    let startLocationsForSelect = this.state.nodes.filter(item => item.type === 0)
    .map(item => ({ code: item.region_code, province: item.province, city: item.city, district: item.district, street: item.street }));
    rateSources.forEach((item) => {
      if (!startLocationsForSelect.find(item1 => item1.code === item.source.code)) {
        startLocationsForSelect = startLocationsForSelect.concat([item.source]);
      }
    });

    let footer = null;
    if (step === 0) {
      footer = (<div>
        <Button style={{ float: 'left' }} onClick={this.handleCancel}>取消</Button>
        <Button onClick={this.handleSaveLocations}>仅保存地址</Button>
        <Button type="primary" onClick={this.handleBindTariff} >绑定报价</Button>
      </div>);
    } else if (step === 1) {
      footer = (<div>
        <Button style={{ float: 'left' }} onClick={() => this.setState({ step: step - 1 })}>上一步</Button>
        <Button type="primary" onClick={this.handleSaveLocationsAndTariff}>保存地址并发布报价</Button>
      </div>);
    }
    return (
      <Modal visible={visible} maskClosable={false} width={700} title={
        <Steps current={step} style={{ paddingRight: 50 }}>
          <Step key={0} title="添加地址" />
          <Step key={1} title="绑定报价" />
        </Steps>}
        onCancel={this.handleCancel}
        footer={footer}
      >

        {step === 0 && (
          <div>
            {this.state.nodes.map((item, index) =>
              <Node index={index} handleChange={this.handleNodeChange} handleRemove={this.handleRemoveNode} node={item} />)}
            <Button style={{ width: '100%' }} size="large" icon="plus" onClick={this.handleAddNode} />
          </div>
          )}
        {step === 1 && (
          <div>
            <Row>
              <FormItem label={this.msg('quoteNo')}>
                <Select style={{ width: '100%' }} value={quoteNo}
                  onChange={this.handleTariffSelect}
                >
                  {tariffs.map(t => <Option value={t.quoteNo} key={t.quoteNo}>{this.renderTmsTariff(t)}</Option>) }
                </Select>
              </FormItem>
            </Row>
            {startLocations.length > 0 && startLocations.map(item => (
              <Card bodyStyle={{ padding: 10 }}>
                <FormItem label={this.msg('newStartLocation')}>
                  <Input disabled value={Location.renderLoc(item)} />
                </FormItem>
              </Card>))}
            {lines.map((item, index) =>
              (<End index={index}
                handleChange={this.handleEndChange}
                handleRemove={this.handleRemoveEnd}
                startLocations={startLocationsForSelect}
                line={item}
                tariff={tariffs.find(item1 => item1.quoteNo === quoteNo)}
              />))}
          </div>
          )}
      </Modal>
    );
  }
}
