import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Input, Select } from 'antd';
import * as Location from 'client/util/location';
import { setConsignFields, loadTariffByQuoteNo } from 'common/reducers/shipment';
import { toggleAddLocationModal } from 'common/reducers/scofFlow';
import { format } from 'client/common/i18n/helpers';
import InputItem from './input-item';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { Option } = Select;

function getRenderFields(type) {
  return type === 'consignee' ? {
    name: 'consignee_name',
    byname: 'consignee_byname',
    province: 'consignee_province',
    city: 'consignee_city',
    district: 'consignee_district',
    street: 'consignee_street',
    regionCode: 'consignee_region_code',
    addr: 'consignee_addr',
    contact: 'consignee_contact',
    mobile: 'consignee_mobile',
    email: 'consignee_email',
  } : {
    name: 'consigner_name',
    byname: 'consigner_byname',
    province: 'consigner_province',
    city: 'consigner_city',
    district: 'consigner_district',
    street: 'consigner_street',
    regionCode: 'consigner_region_code',
    addr: 'consigner_addr',
    contact: 'consigner_contact',
    mobile: 'consigner_mobile',
    email: 'consigner_email',
  };
}

function getFieldDefaults(state, type) {
  const defaults = {};
  const fields = getRenderFields(type);
  Object.keys(fields).forEach((fd) => {
    defaults[fields[fd]] = state.shipment.formData[fields[fd]];
  });
  return defaults;
}

@connect(
  (state, props) => ({
    fieldDefaults: getFieldDefaults(state, props.type),
    consignLocations: props.type === 'consignee' ?
      state.shipment.formRequire.consigneeLocations.filter(cl =>
        cl.ref_partner_id === state.shipment.formData.customer_partner_id
        || cl.ref_partner_id === -1) :
      state.shipment.formRequire.consignerLocations.filter(cl =>
        cl.ref_partner_id === state.shipment.formData.customer_partner_id
        || cl.ref_partner_id === -1),
    customerPartnerId: state.shipment.formData.customer_partner_id,
    customerName: state.shipment.formData.customer_name,
    quoteNo: state.shipment.formData.quote_no,
  }),
  { setConsignFields, loadTariffByQuoteNo, toggleAddLocationModal }
)
export default class ConsignInfo extends React.PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    type: PropTypes.oneOf(['consignee', 'consigner']),
    outerColSpan: PropTypes.number.isRequired,
    labelColSpan: PropTypes.number.isRequired,
    setConsignFields: PropTypes.func.isRequired,
    customerPartnerId: PropTypes.number.isRequired,
    customerName: PropTypes.string.isRequired,
    loadTariffByQuoteNo: PropTypes.func.isRequired,
    quoteNo: PropTypes.string.isRequired,
    toggleAddLocationModal: PropTypes.func.isRequired,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleAutoInputChange = (val) => {
    if (val === undefined || val === '') {
      const consignKey = `${this.props.type}_id`;
      this.props.setConsignFields({
        [consignKey]: undefined,
        [this.renderFields.name]: '',
        [this.renderFields.byname]: '',
        [this.renderFields.province]: '',
        [this.renderFields.city]: '',
        [this.renderFields.district]: '',
        [this.renderFields.street]: '',
        [this.renderFields.regionCode]: '',
      });
      this.props.formhoc.setFieldsValue({
        [this.renderFields.addr]: '',
        [this.renderFields.contact]: '',
        [this.renderFields.mobile]: '',
        [this.renderFields.email]: '',
      });
    }
  }
  handleConsignChange = (value) => {
    if (value === -1) {
      if (this.props.type === 'consigner') {
        this.handleShowAddLocationModal(0);
      } else if (this.props.type === 'consignee') {
        this.handleShowAddLocationModal(1);
      }
    } else if (value === undefined) {
      this.handleAutoInputChange(value);
    } else {
      const selectConsignLoc = this.props.consignLocations.find(cl => cl.node_id === value);
      if (selectConsignLoc) {
        const consignKey = `${this.props.type}_id`;
        this.props.setConsignFields({
          [consignKey]: selectConsignLoc.node_id,
          [this.renderFields.name]: selectConsignLoc.name,
          [this.renderFields.byname]: selectConsignLoc.byname,
          [this.renderFields.province]: selectConsignLoc.province,
          [this.renderFields.city]: selectConsignLoc.city,
          [this.renderFields.district]: selectConsignLoc.district,
          [this.renderFields.street]: selectConsignLoc.street,
          [this.renderFields.regionCode]: selectConsignLoc.region_code,
        });
        this.props.formhoc.setFieldsValue({
          [this.renderFields.addr]: selectConsignLoc.addr,
          [this.renderFields.contact]: selectConsignLoc.contact,
          [this.renderFields.mobile]: selectConsignLoc.mobile,
          [this.renderFields.email]: selectConsignLoc.email,
        });
      }
    }
  }
  handleShowAddLocationModal = (type) => {
    const { quoteNo } = this.props;
    if (quoteNo) {
      this.props.loadTariffByQuoteNo(quoteNo).then((result) => {
        if (result.data) {
          this.props.toggleAddLocationModal({
            visible: true,
            partnerId: this.props.customerPartnerId,
            partnerName: this.props.customerName,
            type,
            tariffId: result.data ? result.data._id : '',
          });
        }
      });
    } else {
      this.props.toggleAddLocationModal({
        visible: true,
        partnerId: this.props.customerPartnerId,
        partnerName: this.props.customerName,
        type,
        tariffId: '',
      });
    }
  }
  renderMsgKeys = this.props.type === 'consignee' ? {
    title: 'consigneeInfo',
    name: 'consignee',
    portal: 'arrivalPort',
    addr: 'deliveryAddr',
  } : {
    title: 'consignerInfo',
    name: 'consigner',
    portal: 'departurePort',
    addr: 'pickupAddr',
  }
  renderFields = getRenderFields(this.props.type)
  renderRules = this.props.type === 'consignee' ? {
    name: {
    },
    portal: {
      required: true,
    },
    addr: {
    },
  } : {
    name: {
      required: true,
      rules: [{
        required: true, message: this.msg('consignerNameMessage'),
      }],
    },
    portal: {
    },
    addr: {
      required: true,
      rules: [{
        required: true, message: this.msg('consignerAddrMessage'),
      }],
    },
  }
  renderConsign = consign => `${consign.name} | ${Location.renderLoc(consign)} | ${consign.byname || ''} | ${consign.contact || ''}`
  render() {
    const {
      formhoc, consignLocations, customerPartnerId,
      fieldDefaults, vertical, type,
    } = this.props;
    const {
      name, byname, addr, contact, mobile, email,
    } = this.renderFields;
    const consigLocation = (fieldDefaults && fieldDefaults[byname]) ? fieldDefaults[byname]
      : Location.renderConsignLocation(fieldDefaults, type);
    let content = '';
    if (vertical) {
      content = (
        <div>
          <FormItem label={this.msg(this.renderMsgKeys.name)}>
            <Select allowClear
              showArrow
              value={fieldDefaults[name]}
              optionLabelProp="name"
              onChange={this.handleConsignChange}
              onSearch={this.handleAutoInputChange}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 400 }}
              optionFilterProp="children"
              showSearch
              notFoundContent={<a onClick={() => this.handleShowAddLocationModal(this.props.type === 'consigner' ? 0 : 1)}>+ 添加地址</a>}
            >
              {consignLocations.filter(cl => cl.ref_partner_id === customerPartnerId
                  || cl.ref_partner_id === -1)
                  .map(dw =>
                    (<Option value={dw.node_id} key={dw.node_id} name={dw.name}>
                      {this.renderConsign(dw)}
                    </Option>))
            }
              <Option value={-1} key={-1}>+ 添加地址</Option>
            </Select>
          </FormItem>

          <FormItem label={this.msg(this.renderMsgKeys.portal)} {...this.renderRules.portal}>
            <Input value={consigLocation} />
          </FormItem>
          <InputItem formhoc={formhoc}
            labelName={this.msg(this.renderMsgKeys.addr)}
            field={this.renderFields.addr}
            {...this.renderRules.addr}
            fieldProps={{ initialValue: fieldDefaults[addr] }}
          />
          <InputItem formhoc={formhoc}
            labelName={this.msg('contact')}
            field={this.renderFields.contact}
            fieldProps={{ initialValue: fieldDefaults[contact] }}
          />
          <InputItem formhoc={formhoc}
            labelName={this.msg('mobile')}
            field={this.renderFields.mobile}
            fieldProps={{ initialValue: fieldDefaults[mobile] }}
          />
          <InputItem formhoc={formhoc}
            labelName={this.msg('email')}
            field={this.renderFields.email}
            fieldProps={{ initialValue: fieldDefaults[email] }}
          />
        </div>
      );
    } else {
      content = (
        <Row gutter={16}>
          <Col sm={24} md={16}>
            <FormItem label={this.msg(this.renderMsgKeys.name)}>
              <Select allowClear
                showArrow
                value={fieldDefaults[name]}
                optionLabelProp="name"
                onChange={this.handleConsignChange}
                onSearch={this.handleAutoInputChange}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 400 }}
                optionFilterProp="children"
                showSearch
                notFoundContent={<a onClick={() => this.handleShowAddLocationModal(this.props.type === 'consigner' ? 0 : 1)}>+ 添加地址</a>}
              >
                {consignLocations.filter(cl => cl.ref_partner_id === customerPartnerId
                    || cl.ref_partner_id === -1)
                    .map(dw => (<Option value={dw.node_id} key={dw.node_id} name={dw.name}>
                      {this.renderConsign(dw)}
                    </Option>))
              }
                <Option value={-1} key={-1}>+ 添加地址</Option>
              </Select>
            </FormItem>
            <FormItem label={this.msg(this.renderMsgKeys.portal)}
              {...this.renderRules.portal}
            >
              <Input value={consigLocation} />
            </FormItem>
            <InputItem formhoc={formhoc}
              labelName={this.msg(this.renderMsgKeys.addr)}
              field={this.renderFields.addr}
              {...this.renderRules.addr}
              fieldProps={{ initialValue: fieldDefaults[addr] }}
            />
          </Col>
          <Col sm={24} md={8}>
            <InputItem formhoc={formhoc}
              labelName={this.msg('contact')}
              field={this.renderFields.contact}
              fieldProps={{ initialValue: fieldDefaults[contact] }}
            />
            <InputItem formhoc={formhoc}
              labelName={this.msg('mobile')}
              field={this.renderFields.mobile}
              fieldProps={{ initialValue: fieldDefaults[mobile] }}
            />
            <InputItem formhoc={formhoc}
              labelName={this.msg('email')}
              field={this.renderFields.email}
              fieldProps={{ initialValue: fieldDefaults[email] }}
            />
          </Col>
        </Row>
      );
    }
    return (
      <div>
        {content}
      </div>
    );
  }
}
