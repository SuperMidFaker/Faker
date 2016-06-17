import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AutoCompSelectItem from './autocomp-select-item';
import InputItem from './input-item';
import { setConsignFields } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);


@connect(
  state => ({
    clients: state.shipment.formRequire.clients,
    customer_name: state.shipment.formData.customer_name,
    ref_external_no: state.shipment.formData.ref_external_no,
  }),
  { setConsignFields }
)
export default class ClientInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    formhoc: fieldProps.object.isRequired,
    clients: PropTypes.array.isRequired,
    customer_name: PropTypes.string,
    ref_external_no: PropTypes.string,
    outerColSpan: PropTypes.number.isRequired,
    setConsignFields: PropTypes.func.isRequired,
  }
 
  handleClientChange = (value) => {
    const clientFieldId = parseInt(value, 10);
    const selclients = props.clients.filter(
        cl => cl.partner_id === clientFieldId
    );
    props.setConsignFields({
      customer_tenant_id: selclients.length > 0 ? selclients[0].tid : -1,
      customer_partner_id: selclients.length > 0 ? clientFieldId : -1,
      customer_name: selclients.length > 0 ? selclients[0].name : value,
    });
  }
  render() {
    const { formhoc, outerColSpan, clients, customer_name, ref_external_no } = this.props;
    const clientOpts = clients.map(cl => ({
      key: `${cl.partner_id}/${cl.tid}`,
      value: `${cl.partner_id}`,
      code: cl.partner_code,
      name: cl.name,
    }));
    return (
      <Row>
        <div className="subform-heading">
          <div className="subform-title">{this.msg('customerInfo')}</div>
        </div>
        <Col span={outerColSpan} className="subform-body">
          <Tooltip placement="top" title={this.msg('customerTooltipTitle')}>
            <div>
              <AutoCompSelectItem formhoc={formhoc} labelName={this.msg('client')} colSpan={3}
              field="customer_name"
              required optionData={clientOpts} filterFields={[ 'code' ]}
              optionField="name" optionKey="key" optionValue="value"
              rules={[{
                required: true, message: this.msg('clientNameMust')
              }]}
              initialValue={customer_name} onChange={this.handleClientChange}
              />
            </div>
          </Tooltip>
        </Col>
        <Col span={24 - outerColSpan} className="subform-body">
          <InputItem formhoc={formhoc} labelName={this.msg('refExternalNo')} colSpan={6}
          field="ref_external_no" fieldProps={ initialValue: ref_external_no }
          />
        </Col>
      </Row>
    );
  }
}
