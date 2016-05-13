import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape } from 'react-intl';
import { Row, Col, Form } from 'ant-ui';
import RegionCascade from 'client/components/region-cascade';
import AutoCompSelectItem from './autocomp-select-item';
import InputItem from './input-item';
import { setFormValue, setConsignFields } from 'universal/redux/reducers/shipment';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import { format } from 'universal/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;

@connect(
  (state, props) => ({
    consignLocations: props.type === 'consignee' ?
      state.shipment.formRequire.consigneeLocations :
      state.shipment.formRequire.consignerLocations
  }),
  { setFormValue, setConsignFields }
)
export default class ConsignInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    consignLocations: PropTypes.array.isRequired,
    type: PropTypes.oneOf(['consignee', 'consigner']),
    outerColSpan: PropTypes.number.isRequired,
    labelColSpan: PropTypes.number.isRequired,
    setFormValue: PropTypes.func.isRequired,
    setConsignFields: PropTypes.func.isRequired,
    formhoc: PropTypes.object.isRequired
  }
  constructor(...args) {
    super(...args);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleItemSelect = (name) => {
    let selectConsignLoc;
    this.props.consignLocations.forEach(cl => {
      if (cl.name === name) {
        selectConsignLoc = cl;
        return;
      }
    });
    if (selectConsignLoc) {
      const consignKey = `${this.props.type}_id`;
      this.props.setFormValue(consignKey, selectConsignLoc.node_id);
      /*
      this.props.setConsignFields({
        [consignKey]: selectConsignLoc.node_id,
        [this.renderFields.addr]: selectConsignLoc.addr,
        [this.renderFields.province]: selectConsignLoc.province,
        [this.renderFields.city]: selectConsignLoc.city,
        [this.renderFields.district]: selectConsignLoc.district,
        [this.renderFields.contact]: selectConsignLoc.contact,
        [this.renderFields.mobile]: selectConsignLoc.mobile,
        [this.renderFields.email]: selectConsignLoc.email
      });
     */
      this.props.formhoc.setFieldsValue({
        [this.renderFields.addr]: selectConsignLoc.addr,
        [this.renderFields.province]: selectConsignLoc.province,
        [this.renderFields.city]: selectConsignLoc.city,
        [this.renderFields.district]: selectConsignLoc.district,
        [this.renderFields.contact]: selectConsignLoc.contact,
        [this.renderFields.mobile]: selectConsignLoc.mobile,
        [this.renderFields.email]: selectConsignLoc.email
      });
    }
  }
  handleRegionValue = (field, value) => {
    if (field === 'province') {
      this.props.setFormValue(this.renderFields.province, value);
    } else if (field === 'city') {
      this.props.setFormValue(this.renderFields.city, value);
    } else if (field === 'district') {
      this.props.setFormValue(this.renderFields.district, value);
    }
  }
  renderMsgKeys = this.props.type === 'consignee' ? {
    title: 'consigneeInfo',
    name: 'consignee',
    portal: 'arrivalPort',
    addr: 'deliveryAddr'
  } : {
    title: 'consignerInfo',
    name: 'consigner',
    portal: 'departurePort',
    addr: 'pickupAddr'
  }
  renderFields = this.props.type === 'consignee' ? {
    name: 'consignee_name',
    province: 'consignee_province',
    city: 'consignee_city',
    district: 'consignee_district',
    addr: 'consignee_addr',
    contact: 'consignee_contact',
    mobile: 'consignee_mobile',
    email: 'consignee_email'
  } : {
    name: 'consigner_name',
    province: 'consigner_province',
    city: 'consigner_city',
    district: 'consigner_district',
    addr: 'consigner_addr',
    contact: 'consigner_contact',
    mobile: 'consigner_mobile',
    email: 'consigner_email'
  }
  render() {
    const { outerColSpan, labelColSpan, formhoc, consignLocations } = this.props;
    const locOptions = consignLocations.map(cl => ({
      name: cl.name,
      key: `${cl.node_id}${cl.name}`,
    }));
    const region = {
      province: formhoc.getFieldValue(this.renderFields.province),
      city: formhoc.getFieldValue(this.renderFields.city),
      county: formhoc.getFieldValue(this.renderFields.district)
    };
    // todo replace selected consign remove consigne()_id
    return (
      <Row>
        <div className="subform-heading">
          <div className="subform-title">{this.msg(this.renderMsgKeys.title)}</div>
        </div>
        <Col span={`${outerColSpan}`} className="subform-body">
          <AutoCompSelectItem labelName={this.msg(this.renderMsgKeys.name)}
            field={this.renderFields.name} colSpan={3} required
            rules={[{
              required: true, message: this.msg('consignNameMessage')
            }]} optionField="name" optionKey="key" optionValue="name"
            formhoc={formhoc} optionData={locOptions} onSelect={this.handleItemSelect}
          />
          <FormItem label={this.msg(this.renderMsgKeys.portal)} labelCol={{span: 3}}
            wrapperCol={{span: 21}}
          >
            <RegionCascade withoutCountry region={region}
              setFormValue={this.handleRegionValue}
            />
          </FormItem>
          <InputItem formhoc={formhoc} labelName={this.msg(this.renderMsgKeys.addr)}
            field={this.renderFields.addr} colSpan={3} required
            rules={[{
              required: true, message: this.msg('addrMessage')
            }]}
          />
        </Col>
        <Col span={`${24 - outerColSpan}`} className="subform-body">
          <InputItem formhoc={formhoc} labelName={this.msg('contact')}
            field={this.renderFields.contact} colSpan={labelColSpan}
          />
          <InputItem formhoc={formhoc} labelName={this.msg('mobile')}
            field={this.renderFields.mobile} colSpan={labelColSpan}
          />
          <InputItem formhoc={formhoc} labelName={this.msg('email')}
            field={this.renderFields.email} colSpan={labelColSpan}
          />
        </Col>
      </Row>
    );
  }
}
