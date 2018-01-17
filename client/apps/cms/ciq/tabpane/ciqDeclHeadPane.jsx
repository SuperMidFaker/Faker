import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Button, Card, DatePicker, Form, Icon, Input, Select, Row, Col, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import FormPane from 'client/components/FormPane';
import { loadCiqDeclHead, searchOrganizations, searchWorldPorts, searchChinaPorts, searchCountries,
  setFixedCountry, setFixedOrganizations, setFixedWorldPorts, updateCiqHeadField, loadCiqParams,
  searchCustoms, toggleEntQualifiModal, loadEntQualif, ciqHeadChange, toggleReqDocuModal,
  toggleAttDocuModal, searchCnCities } from 'common/reducers/cmsCiqDeclare';
import { loadCmsBrokers } from 'common/reducers/cmsBrokers';
import { loadBusinessUnits } from 'common/reducers/cmsResources';
import { CIQ_IN_DECL_TYPE, CIQ_OUT_DECL_TYPE, CIQ_SPECIAL_DECL_FLAG, CIQ_SPECIAL_PASS_FLAG,
  CIQ_TRANSPORTS_TYPE, CIQ_TRADE_MODE, CIQ_ENT_QUALIFY_TYPE, TRADE_ITEM_APPLY_CERTS } from 'common/constants';
import { FormRemoteSearchSelect } from '../../common/form/formSelect';
import { CiqCodeAutoCompSelect } from '../../common/form/headFormItems';
import EntQualifyModal from '../modal/entQualifyModal';
import RequiredDocuModal from '../modal/requiredDocuModal';
import AttachedDocuModal from '../modal/attachedDocuModal';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;
const { TextArea } = Input;
const ButtonGroup = Button.Group;

function unique(arr) {
  const hash = {};
  const newArr = arr.reduce((item, next) => {
    if (!hash[next.value]) {
      hash[next.value] = true;
      item.push(next);
    }
    return item;
  }, []);
  return newArr;
}

@injectIntl
@connect(
  state => ({
    organizations: state.cmsCiqDeclare.ciqParams.organizations.map(org => ({
      value: org.org_code,
      text: `${org.org_code} | ${org.org_name}`,
      search: `${org.org_code}${org.org_name}`,
    })),
    currencies: state.cmsCiqDeclare.ciqParams.currencies,
    worldPorts: state.cmsCiqDeclare.ciqParams.worldPorts.map(port => ({
      value: port.port_code,
      text: `${port.port_code} | ${port.port_cname}`,
      search: `${port.port_code}${port.port_cname}`,
    })),
    chinaPorts: state.cmsCiqDeclare.ciqParams.chinaPorts.map(port => ({
      value: port.port_code,
      text: `${port.port_code} | ${port.port_cname}`,
      search: `${port.port_code}${port.port_cname}`,
    })),
    countries: state.cmsCiqDeclare.ciqParams.countries.map(coun => ({
      value: coun.country_code,
      text: `${coun.country_code} | ${coun.country_cn_name}`,
      search: `${coun.country_code}${coun.country_cn_name}`,
    })),
    units: state.cmsCiqDeclare.ciqParams.units,
    customs: state.cmsCiqDeclare.ciqParams.customs,
    ciqDeclHead: state.cmsCiqDeclare.ciqDeclHead.head,
    brokers: state.cmsBrokers.brokers,
    businessUnits: state.cmsResources.businessUnits,
    fixedCountries: state.cmsCiqDeclare.ciqParams.fixedCountries.map(coun => ({
      value: coun.country_code,
      text: `${coun.country_code} | ${coun.country_cn_name}`,
      search: `${coun.country_code}${coun.country_cn_name}`,
    })),
    fixedOrganizations: state.cmsCiqDeclare.ciqParams.fixedOrganizations.map(org => ({
      value: org.org_code,
      text: `${org.org_code} | ${org.org_name}`,
      search: `${org.org_code}${org.org_name}`,
    })),
    fixedWorldPorts: state.cmsCiqDeclare.ciqParams.fixedWorldPorts.map(port => ({
      value: port.port_code,
      text: `${port.port_code} | ${port.port_cname}`,
      search: `${port.port_code}${port.port_cname}`,
    })),
    entQualifs: state.cmsCiqDeclare.entQualifs,
    cnCities: state.cmsCiqDeclare.ciqParams.cnCities.map(city => ({
      value: city.code,
      text: `${city.code} | ${city.cn_name}`,
      search: `${city.code}${city.cn_name}`,
    })),
  }),
  {
    loadCiqDeclHead,
    searchOrganizations,
    searchWorldPorts,
    searchChinaPorts,
    searchCountries,
    loadCmsBrokers,
    loadBusinessUnits,
    setFixedCountry,
    setFixedOrganizations,
    setFixedWorldPorts,
    updateCiqHeadField,
    loadCiqParams,
    searchCustoms,
    toggleEntQualifiModal,
    loadEntQualif,
    ciqHeadChange,
    toggleReqDocuModal,
    toggleAttDocuModal,
    searchCnCities,
  }
)

export default class CiqDeclHeadPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ioType: PropTypes.string.isRequired,
    form: PropTypes.shape({
      getFieldDecorator: PropTypes.func,
    }).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    entQualif: {},
  }
  componentWillMount() {
    const { ioType } = this.props;
    this.props.loadCiqDeclHead(this.context.router.params.declNo).then((result) => {
      if (!result.error) {
        this.props.loadBusinessUnits({
          customerPartnerId: this.props.ciqDeclHead.owner_cuspartner_id,
        });
        this.props.loadEntQualif(
          this.props.ciqDeclHead.owner_cuspartner_id,
          ioType === 'in' ? this.props.ciqDeclHead.ciq_consignee_code : this.props.ciqDeclHead.ciq_consignor_code
        ).then((re) => {
          if (!re.error) {
            if (this.props.ciqDeclHead.ent_qualif_type_code) {
              const entQualif = re.data.find(item =>
                item.ent_qualif_type_code === this.props.ciqDeclHead.ent_qualif_type_code);
              this.setState({
                entQualif,
              });
            } else {
              this.setState({
                entQualif: re.data.length > 0 ? re.data[0] : {},
              });
            }
          }
        });
      }
    });
    this.props.loadCmsBrokers();
    this.props.loadCiqParams();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.entQualifs !== this.props.entQualifs) {
      this.setState({
        entQualif: nextProps.entQualifs.length > 0 ? nextProps.entQualifs[0] : {},
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handleSearchOrg = (field, value) => {
    if (value) {
      this.props.searchOrganizations(value);
    }
  }
  handleSearchWorldPorts = (field, value) => {
    if (value) {
      this.props.searchWorldPorts(value);
    }
  }
  handleSearchChinaPorts = (field, value) => {
    if (value) {
      this.props.searchChinaPorts(value);
    }
  }
  handleSearchCountries = (field, value) => {
    if (value) {
      this.props.searchCountries(value);
    }
  }
  handleSearchCnCities = (field, value) => {
    if (value) {
      this.props.searchCnCities(value);
    }
  }
  handleSearchCus = (field, value) => {
    if (value) {
      this.props.searchCustoms(value);
    }
  }
  handleAgentSelect = (value) => {
    const { form, brokers } = this.props;
    const broker = brokers.find(bk => bk.ciq_code === value);
    form.setFieldsValue({ agent_name: broker.comp_name });
  };
  handleConsigneeSelect = (codeField, cnameField, enameField, value) => {
    const { businessUnits, form, ioType } = this.props;
    const consignee = businessUnits.find(unit => unit.ciq_code === value);
    form.setFieldsValue({
      [cnameField]: consignee.comp_name,
    });
    if (ioType === 'in') {
      this.props.loadEntQualif(this.props.ciqDeclHead.owner_cuspartner_id, value);
      this.props.ciqHeadChange();
    }
  }
  handleConsignorSelect = (codeField, cnameField, enameField, value) => {
    const { businessUnits, form, ioType } = this.props;
    const consignor = businessUnits.find(unit => unit.ciq_code === value);
    form.setFieldsValue({
      [cnameField]: consignor.comp_name,
    });
    if (ioType === 'out') {
      this.props.loadEntQualif(this.props.ciqDeclHead.owner_cuspartner_id, value);
      this.props.ciqHeadChange();
    }
  }
  handleCountrySelect = (value) => {
    const { fixedCountries, countries } = this.props;
    const country = countries.find(coun => coun.value === value);
    if (!(fixedCountries.find(coun => coun.value === country.value))) {
      fixedCountries.push(country);
    }
    this.props.setFixedCountry(fixedCountries.map(coun => ({
      country_code: coun.value,
      country_cn_name: coun.text.split(' | ')[1],
    })));
  }
  handleOrganizationSelect = (value) => {
    const { fixedOrganizations, organizations } = this.props;
    const organization = organizations.find(org => org.value === value);
    if (!(fixedOrganizations.find(org => org.value === organization.value))) {
      fixedOrganizations.push(organization);
    }
    this.props.setFixedOrganizations(fixedOrganizations.map(org => ({
      org_code: org.value,
      org_name: org.text.split(' | ')[1],
    })));
  }
  handleWorldPortsSelect = (value) => {
    const { fixedWorldPorts, worldPorts } = this.props;
    const port = worldPorts.find(po => po.value === value);
    if (!(fixedWorldPorts.find(po => po.value === port.value))) {
      fixedWorldPorts.push(port);
    }
    this.props.setFixedWorldPorts(fixedWorldPorts.map(po => ({
      port_code: po.value,
      port_cname: po.text.split(' | ')[1],
    })));
  }
  handleEdit = (field, value) => {
    if (field === 'ciq_decl_no' && value.length !== 15) {
      message.error('报检号不为15位');
      return;
    }
    if (field === 'ciq_cl_no' && value.length !== 18) {
      message.error('通关单号不为18位');
      return;
    }
    this.props.updateCiqHeadField(field, value, this.props.ciqDeclHead.pre_entry_seq_no);
  }
  toggleEntQualifiModal = () => {
    this.props.toggleEntQualifiModal(true);
  }
  changeEntQualif = (type) => {
    const { entQualifs } = this.props;
    const { entQualif } = this.state;
    if (entQualifs.length > 1) {
      const index = entQualifs.findIndex(qualif =>
        qualif.ent_qualif_type_code === entQualif.ent_qualif_type_code);
      if (type) {
        if (index === entQualifs.length - 1) {
          this.setState({
            entQualif: entQualifs[0],
          });
        } else {
          this.setState({
            entQualif: entQualifs[index + 1],
          });
        }
      } else if (index === 0) {
        this.setState({
          entQualif: entQualifs[entQualifs.length - 1],
        });
      } else {
        this.setState({
          entQualif: entQualifs[index - 1],
        });
      }
    }
  }
  handleToggleInspQuarDocuReModal = () => {
    this.props.toggleReqDocuModal(true);
  }
  toggleAttDocuModal = () => {
    this.props.toggleAttDocuModal(true);
  }
  render() {
    const {
      ioType, organizations, countries, worldPorts, chinaPorts, ciqDeclHead, form, cnCities,
      form: { getFieldDecorator }, brokers, intl, businessUnits, customs,
    } = this.props;
    if (ciqDeclHead.app_cert_code) {
      const codes = ciqDeclHead.app_cert_code.split(',');
      let names = '';
      codes.forEach((code) => {
        const cert = TRADE_ITEM_APPLY_CERTS.find(ce => ce.app_cert_code === code);
        if (!names) {
          names += cert.app_cert_name;
        } else {
          names += `,${cert.app_cert_name}`;
        }
      });
      ciqDeclHead.app_cert_name = names;
    }
    const { entQualif } = this.state;
    const uniqueCout = unique(countries);
    const uniqueOrg = unique(organizations);
    const uniquePorts = unique(worldPorts);
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      colon: false,
    };
    const formItemSpan2Layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
      colon: false,
    };
    const addonAfter = (<ButtonGroup size="small">
      <Button type="primary" ghost onClick={() => this.changeEntQualif(false)}><Icon type="left" /></Button>
      <Button type="primary" ghost onClick={() => this.changeEntQualif(true)}><Icon type="right" /></Button>
      <Button type="primary" ghost onClick={this.toggleEntQualifiModal}><Icon type="ellipsis" /></Button>
    </ButtonGroup>);
    const header = (<Row>
      <Col span="6">
        <InfoItem
          size="small"
          field={ciqDeclHead.ciq_decl_no}
          placeholder={this.msg('pressIn')}
          addonBefore={this.msg('ciqNo')}
          editable={!ciqDeclHead.ciq_decl_no}
          onEdit={value => this.handleEdit('ciq_decl_no', value)}
        />
      </Col>
      <Col span="6">
        <InfoItem
          size="small"
          field={ciqDeclHead.ciq_cl_no}
          placeholder={this.msg('pressIn')}
          addonBefore={this.msg('ciqClNo')}
          editable={!ciqDeclHead.ciq_cl_no}
          onEdit={value => this.handleEdit('ciq_cl_no', value)}
        />
      </Col>
    </Row>);
    return (
      <FormPane header={header} fullscreen={this.props.fullscreen} hideRequiredMark>
        <Card >
          <Row>
            <Col span="6">
              {ioType === 'in' && <FormItem {...formItemLayout} label={this.msg('ciqDeclType')} required >
                  {getFieldDecorator('ciq_decl_type', {
                    initialValue: ciqDeclHead.ciq_decl_type,
                  })(<Select>
                    {CIQ_IN_DECL_TYPE.map(type =>
                      <Option key={type.value}>{type.value} | {type.text}</Option>)}
                  </Select>)}
              </FormItem>}
              {ioType === 'out' && <FormItem {...formItemLayout} label={this.msg('ciqDeclType')} required >
                  {getFieldDecorator('ciq_decl_type', {
                    initialValue: ciqDeclHead.ciq_decl_type,
                  })(<Select>
                    {CIQ_OUT_DECL_TYPE.map(type =>
                      <Option key={type.value}>{type.value} | {type.text}</Option>)}
                  </Select>)}
              </FormItem>}
            </Col>
            <FormRemoteSearchSelect
              outercol={6}
              label={<span><Icon type="safety" />{this.msg('orgCode')}</span>}
              col={8}
              field="ciq_org_code"
              getFieldDecorator={form.getFieldDecorator}
              formData={ciqDeclHead}
              required
              options={uniqueOrg}
              onSearch={this.handleSearchOrg}
              onSelect={this.handleOrganizationSelect}
            />
            <FormRemoteSearchSelect
              outercol={6}
              label={<span><Icon type="safety" />{this.msg('ciqInspOrg')}</span>}
              col={8}
              field="ciq_insp_orgcode"
              getFieldDecorator={form.getFieldDecorator}
              formData={ciqDeclHead}
              required
              options={uniqueOrg}
              onSearch={this.handleSearchOrg}
              onSelect={this.handleOrganizationSelect}
            />
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('ciqDeclDate')} required >
                {getFieldDecorator('ciq_decl_date', {
                  initialValue: ciqDeclHead.ciq_decl_date && moment(ciqDeclHead.ciq_decl_date),
                })(<DatePicker style={{ width: '100%' }} format="YYYY/MM/DD" />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={this.msg('declRegNo')} required >
                <InputGroup compact>
                  {getFieldDecorator('agent_ciq_code', {
                    initialValue: ciqDeclHead.agent_ciq_code,
                  })(<Select style={{ width: '30%' }} onSelect={this.handleAgentSelect}>
                    {brokers.map(bk => (<Option key={bk.ciq_code} value={bk.ciq_code}>
                      {bk.ciq_code}
                    </Option>))}
                  </Select>)}
                  {getFieldDecorator('agent_name', {
                    initialValue: ciqDeclHead.agent_name,
                  })(<Input style={{ width: '70%' }} />)}
                </InputGroup>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('agentPerson')} >
                <InputGroup compact>
                  {getFieldDecorator('agent_ciq_person_certno', {
                    initialValue: ciqDeclHead.agent_ciq_person_certno,
                  })(<Input placeholder={this.msg('code')} style={{ width: '50%' }} />)}
                  {getFieldDecorator('agent_ciq_person', {
                    initialValue: ciqDeclHead.agent_ciq_person,
                  })(<Input prefix={<Icon type="user" />} placeholder={this.msg('name')} style={{ width: '50%' }} />)}
                </InputGroup>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('contact')} >
                <InputGroup compact>
                  {getFieldDecorator('agent_ciq_contact', {
                    initialValue: ciqDeclHead.agent_ciq_contact,
                  })(<Input prefix={<Icon type="user" />} placeholder={this.msg('name')} style={{ width: '50%' }} />)}
                  {getFieldDecorator('agent_ciq_tel', {
                    initialValue: ciqDeclHead.agent_ciq_tel,
                  })(<Input prefix={<Icon type="phone" />} placeholder={this.msg('phone')} style={{ width: '50%' }} />)}
                </InputGroup>
              </FormItem>
            </Col>
          </Row>
          {ioType === 'in' && <Row>
            <Col span="18">
              <CiqCodeAutoCompSelect
                labelCol="3"
                label={this.msg('consigneeCname')}
                formData={ciqDeclHead}
                codeField="ciq_consignee_code"
                cnameField="ciq_consignee_name_cn"
                enameField="ciq_consignee_name_en"
                getFieldDecorator={form.getFieldDecorator}
                getFieldValue={form.getFieldValue}
                options={businessUnits.map(bu => ({
                  ciqcode: bu.ciq_code,
                  name: bu.comp_name,
                  code: bu.customs_code,
                }))}
                intl={intl}
                onSelect={this.handleConsigneeSelect}
              />
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('entQualif')} >
                {getFieldDecorator('ent_qualif_type_code', {
                  initialValue: entQualif.ent_qualif_type_code ? `${entQualif.ent_qualif_type_code}|${CIQ_ENT_QUALIFY_TYPE.find(type => type.value === Number(entQualif.ent_qualif_type_code)) && CIQ_ENT_QUALIFY_TYPE.find(type => type.value === Number(entQualif.ent_qualif_type_code)).text}` : '',
                })(<Input addonAfter={addonAfter} />)}
              </FormItem>
            </Col>
          </Row>}
          {ioType === 'in' && <Row>
            <Col span="18">
              <CiqCodeAutoCompSelect
                labelCol="3"
                label={this.msg('consignorCname')}
                formData={ciqDeclHead}
                codeField="ciq_consignor_code"
                cnameField="ciq_consignor_name_cn"
                enameField="ciq_consignor_name_en"
                getFieldDecorator={form.getFieldDecorator}
                getFieldValue={form.getFieldValue}
                options={businessUnits.map(bu => ({
                  ciqcode: bu.ciq_code,
                  name: bu.comp_name,
                  code: bu.customs_code,
                }))}
                intl={intl}
                onSelect={this.handleConsignorSelect}
              />
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('consignorAddress')} >
                {getFieldDecorator('ciq_consignor_addr', {
                  initialValue: ciqDeclHead.ciq_consignor_addr,
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>}
          {ioType === 'out' && <Row>
            <Col span="18">
              <CiqCodeAutoCompSelect
                labelCol="3"
                label={this.msg('consignorCname')}
                formData={ciqDeclHead}
                codeField="ciq_consignor_code"
                cnameField="ciq_consignor_name_cn"
                enameField="ciq_consignor_name_en"
                getFieldDecorator={form.getFieldDecorator}
                getFieldValue={form.getFieldValue}
                options={businessUnits.map(bu => ({
                  ciqcode: bu.ciq_code,
                  name: bu.comp_name,
                  code: bu.customs_code,
                }))}
                intl={intl}
                onSelect={this.handleConsignorSelect}
              />
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('entQualif')} >
                {getFieldDecorator('ent_qualif_type_code', {
                  initialValue: entQualif.ent_qualif_type_code ?
                  `${entQualif.ent_qualif_type_code}|${CIQ_ENT_QUALIFY_TYPE.find(type =>
                    type.value === Number(entQualif.ent_qualif_type_code)) &&
                    CIQ_ENT_QUALIFY_TYPE.find(type => type.value === Number(entQualif.ent_qualif_type_code)).text}` : '',
                })(<Input addonAfter={addonAfter} />)}
              </FormItem>
            </Col>
          </Row>}
          {ioType === 'out' && <Row>
            <Col span="18">
              <CiqCodeAutoCompSelect
                labelCol="3"
                label={this.msg('consigneeCname')}
                formData={ciqDeclHead}
                codeField="ciq_consignee_code"
                cnameField="ciq_consignee_name_cn"
                enameField="ciq_consignee_name_en"
                getFieldDecorator={form.getFieldDecorator}
                getFieldValue={form.getFieldValue}
                options={businessUnits.map(bu => ({
                  ciqcode: bu.ciq_code,
                  name: bu.comp_name,
                  code: bu.customs_code,
                }))}
                intl={intl}
                onSelect={this.handleConsigneeSelect}
              />
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('consigneeAddress')} >
                {getFieldDecorator('ciq_consignee_addr', {
                  initialValue: ciqDeclHead.ciq_consignee_addr,
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>}
        </Card>
        <Card >
          <Row>
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('trafMode')} required >
                {getFieldDecorator('traf_mode', {
                  initialValue: ciqDeclHead.traf_mode && Number(ciqDeclHead.traf_mode),
                })(<Select>
                  {CIQ_TRANSPORTS_TYPE.map(tran =>
                    (<Option value={tran.value} key={tran.value}>
                      {tran.value} | {tran.text}</Option>))}
                </Select>)}
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('trafName')} >
                {getFieldDecorator('traf_name', {
                  initialValue: ciqDeclHead.traf_name,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('trafMeanNo')} >
                {getFieldDecorator('traf_mean_no', {
                  initialValue: ciqDeclHead.traf_mean_no,
                })(<Input />)}
              </FormItem>
            </Col>
            {ioType === 'in' && <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('deliveryOrder')} >
                {getFieldDecorator('delivery_order', {
                  initialValue: ciqDeclHead.delivery_order,
                })(<Input />)}
              </FormItem>
            </Col>}
            {ioType === 'in' && <Col span="6">
              <FormItem {...formItemLayout} label="提/运单号" required >
                <InputGroup compact>
                  {getFieldDecorator('bill_lad_no', {
                  initialValue: ciqDeclHead.bill_lad_no,
                })(<Input style={{ width: '60%' }} />)}
                  {getFieldDecorator('split_bill_lad_no', {
                  initialValue: ciqDeclHead.split_bill_lad_no,
                })(<Input placeholder={this.msg('splitBillLadNo')} style={{ width: '40%' }} />)}
                </InputGroup>
              </FormItem>
            </Col>}
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('contrNo')} required >
                {getFieldDecorator('contr_no', {
                  initialValue: ciqDeclHead.contr_no,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('tradeMode')} required >
                {getFieldDecorator('ciq_trade_mode', {
                  initialValue: ciqDeclHead.ciq_trade_mode && Number(ciqDeclHead.ciq_trade_mode),
                })(<Select>
                  {CIQ_TRADE_MODE.map(mode =>
                    (<Option key={mode.value} value={mode.value}>
                      {mode.value} | {mode.text}</Option>))}
                </Select>)}
              </FormItem>
            </Col>
            {ioType === 'in' &&
            <FormRemoteSearchSelect
              outercol={6}
              label={this.msg('tradeCountry')}
              col={8}
              field="ciq_trade_country"
              getFieldDecorator={form.getFieldDecorator}
              formData={ciqDeclHead}
              options={uniqueCout}
              onSearch={this.handleSearchCountries}
              onSelect={this.handleCountrySelect}
            />}
            {ioType === 'in' &&
            <FormRemoteSearchSelect
              outercol={6}
              label={this.msg('despPort')}
              col={8}
              field="ciq_desp_dest_port"
              getFieldDecorator={form.getFieldDecorator}
              formData={ciqDeclHead}
              options={uniquePorts}
              onSearch={this.handleSearchWorldPorts}
              onSelect={this.handleWorldPortsSelect}
            />}
            {ioType === 'in' &&
            <FormRemoteSearchSelect
              outercol={6}
              label={this.msg('despCountry')}
              col={8}
              field="ciq_desp_dest_country"
              getFieldDecorator={form.getFieldDecorator}
              formData={ciqDeclHead}
              options={uniqueCout}
              onSearch={this.handleSearchCountries}
              onSelect={this.handleCountrySelect}
            />}
            {ioType === 'out' &&
            <FormRemoteSearchSelect
              outercol={6}
              label={<span><Icon type="safety" />{this.msg('ciqInspPlaceOrg')}</span>}
              col={8}
              field="ciq_insp_place_orgcode"
              getFieldDecorator={form.getFieldDecorator}
              formData={ciqDeclHead}
              options={uniqueOrg}
              onSearch={this.handleSearchOrg}
              onSelect={this.handleOrganizationSelect}
            />}
            {ioType === 'out' &&
              <FormRemoteSearchSelect
                outercol={6}
                label={this.msg('destCountry')}
                col={8}
                field="ciq_desp_dest_country"
                getFieldDecorator={form.getFieldDecorator}
                formData={ciqDeclHead}
                options={uniqueCout}
                onSearch={this.handleSearchCountries}
                onSelect={this.handleCountrySelect}
              />}
            {ioType === 'in' &&
            <FormRemoteSearchSelect
              outercol={6}
              label={this.msg('stopPort')}
              col={8}
              field="ciq_stop_port"
              getFieldDecorator={form.getFieldDecorator}
              formData={ciqDeclHead}
              options={uniquePorts}
              onSearch={this.handleSearchWorldPorts}
              onSelect={this.handleWorldPortsSelect}
            />}
            <FormRemoteSearchSelect
              outercol={6}
              label={ioType === 'in' ? this.msg('entryPort') : this.msg('exitPort')}
              col={8}
              field="ciq_entry_exit_port"
              getFieldDecorator={form.getFieldDecorator}
              formData={ciqDeclHead}
              options={chinaPorts}
              onSearch={this.handleSearchChinaPorts}
            />
            {ioType === 'in' &&
              <FormRemoteSearchSelect
                outercol={6}
                label={this.msg('dest')}
                col={8}
                field="dest_code"
                getFieldDecorator={form.getFieldDecorator}
                formData={ciqDeclHead}
                options={cnCities}
                onSearch={this.handleSearchCnCities}
              />}
            {ioType === 'in' &&
            <FormRemoteSearchSelect
              outercol={6}
              label={<span><Icon type="safety" />{this.msg('purpOrg')}</span>}
              col={8}
              field="ciq_purp_orgcode"
              getFieldDecorator={form.getFieldDecorator}
              formData={ciqDeclHead}
              required
              options={uniqueOrg}
              onSearch={this.handleSearchOrg}
              onSelect={this.handleOrganizationSelect}
            />}
            {ioType === 'out' &&
            <FormRemoteSearchSelect
              outercol={6}
              label={this.msg('destPort')}
              col={8}
              field="ciq_desp_dest_port"
              getFieldDecorator={form.getFieldDecorator}
              formData={ciqDeclHead}
              options={uniquePorts}
              onSearch={this.handleSearchWorldPorts}
              onSelect={this.handleWorldPortsSelect}
            />}
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('goodsPlace')} required >
                {getFieldDecorator('goods_place', {
                  initialValue: ciqDeclHead.goods_place,
                })(<Input />)}
              </FormItem>
            </Col>
            <FormRemoteSearchSelect
              outercol={6}
              label={<span><Icon type="safety" />{this.msg('vsaOrg')}</span>}
              col={8}
              field="ciq_vsa_orgcode"
              getFieldDecorator={form.getFieldDecorator}
              formData={ciqDeclHead}
              required
              options={uniqueOrg}
              onSearch={this.handleSearchOrg}
              onSelect={this.handleOrganizationSelect}
            />
            {ioType === 'in' && <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('despDate')} required >
                {getFieldDecorator('desp_date', {
                  initialValue: ciqDeclHead.desp_date && moment(ciqDeclHead.desp_date),
                })(<DatePicker style={{ width: '100%' }} format="YYYY/MM/DD" />)}
              </FormItem>
            </Col>}
            {ioType === 'in' && <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('arrivalDate')} required >
                {getFieldDecorator('arrival_date', {
                  initialValue: ciqDeclHead.arrival_date && moment(ciqDeclHead.arrival_date),
                })(<DatePicker style={{ width: '100%' }} format="YYYY/MM/DD" />)}
              </FormItem>
            </Col>}
            {ioType === 'in' && <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('cmplDschrgDate')} >
                {getFieldDecorator('cmpl_dschrg_date', {
                  initialValue: ciqDeclHead.cmpl_dschrg_date &&
                  moment(ciqDeclHead.cmpl_dschrg_date),
                })(<DatePicker style={{ width: '100%' }} format="YYYY/MM/DD" />)}
              </FormItem>
            </Col>}
            {ioType === 'in' && <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('counterClaimDate')} >
                {getFieldDecorator('counter_claim_date', {
                  initialValue: ciqDeclHead.counter_claim_date &&
                  moment(ciqDeclHead.counter_claim_date),
                })(<DatePicker style={{ width: '100%' }} format="YYYY/MM/DD" />)}
              </FormItem>
            </Col>}
            {ioType === 'out' && <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('deliveryDate')} >
                <DatePicker style={{ width: '100%' }} />
              </FormItem>
            </Col>}
            <FormRemoteSearchSelect
              outercol={6}
              label={this.msg('declPort')}
              col={8}
              field="decl_port"
              getFieldDecorator={form.getFieldDecorator}
              formData={ciqDeclHead}
              options={customs.map(cus => ({
                value: cus.customs_code,
                text: `${cus.customs_code} | ${cus.customs_name}`,
                search: `${cus.customs_code}${cus.customs_name}`,
              }))}
              onSearch={this.handleSearchCus}
              onSelect={this.handleCustomsSelect}
            />
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('customsRegNo')} >
                {getFieldDecorator('customs_reg_no', {
                  initialValue: ciqDeclHead.customs_reg_no,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('correlCiqDeclNo')} >
                {getFieldDecorator('correl_ciq_decl_no', {
                  initialValue: ciqDeclHead.correl_ciq_decl_no,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem {...formItemLayout} label={this.msg('correlReasonFlag')} >
                {getFieldDecorator('correl_reason_flag', {
                  initialValue: ciqDeclHead.correl_reason_flag,
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={this.msg('specialDeclFlag')} >
                {getFieldDecorator('special_decl_flag', {
                  initialValue: ciqDeclHead.special_decl_flag ? ciqDeclHead.special_decl_flag.split(',') : [],
                })(<Select mode="multiple">
                  {CIQ_SPECIAL_DECL_FLAG.map(type =>
                    <Option key={type.value} value={type.value}>{type.text}</Option>)}
                </Select>)}
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={this.msg('specPassFlag')} >
                {getFieldDecorator('spec_pass_flag', {
                  initialValue: ciqDeclHead.spec_pass_flag ? ciqDeclHead.spec_pass_flag.split(',') : [],
                })(<Select mode="multiple">
                  {CIQ_SPECIAL_PASS_FLAG.map(type =>
                    <Option key={type.value} vlaue={type.value}>{type.text}</Option>)}
                </Select>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={this.msg('certNeeded')} >
                {getFieldDecorator('app_cert_name', {
                    initialValue: ciqDeclHead.app_cert_name,
                  })(<Input
                    addonAfter={<Button type="primary" ghost size="small" onClick={this.handleToggleInspQuarDocuReModal}>
                      <Icon type="ellipsis" />
                    </Button>}
                  />)}
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={this.msg('attaCollectName')} >
                {getFieldDecorator('atta_collect_name', {
                    initialValue: ciqDeclHead.atta_collect_name,
                  })(<Input
                    addonAfter={<Button type="primary" ghost size="small" onClick={this.toggleAttDocuModal}>
                      <Icon type="ellipsis" />
                    </Button>}
                  />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={this.msg('speclInspQuraRe')} >
                {getFieldDecorator('specl_insp_qura_re', {
                  initialValue: ciqDeclHead.specl_insp_qura_re,
                })(<TextArea autosize />)}
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem {...formItemSpan2Layout} label={this.msg('markNo')} >
                {getFieldDecorator('mark_no', {
                  initialValue: ciqDeclHead.mark_no,
                })(<TextArea autosize />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <EntQualifyModal
          ciqCode={ioType === 'in' ? ciqDeclHead.ciq_consignee_code : ciqDeclHead.ciq_consignor_code}
          customerPartnerId={ciqDeclHead.owner_cuspartner_id}
        />
        <RequiredDocuModal
          selectedRowKeys={ciqDeclHead.app_cert_code}
          preEntrySeqNo={ciqDeclHead.pre_entry_seq_no}
          applOris={ciqDeclHead.appl_ori}
          applCopyQuans={ciqDeclHead.appl_copy_quan}
        />
        <AttachedDocuModal preEntrySeqNo={ciqDeclHead.pre_entry_seq_no} />
      </FormPane>
    );
  }
}
