import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape } from 'react-intl';
import { Row, Col, Tooltip } from 'antd';
import InputItem from './input-item';
import AutoCompSelectItem from './autocomp-select-item';
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
    formhoc: PropTypes.object.isRequired,
    clients: PropTypes.array.isRequired,
    customer_name: PropTypes.string,
    ref_external_no: PropTypes.string,
    outerColSpan: PropTypes.number.isRequired,
    mode: PropTypes.string,
    setConsignFields: PropTypes.func.isRequired,
    vertical: PropTypes.bool,
  }

  msg = descriptor => formatMsg(this.props.intl, descriptor)
  findClientValue = (evalue) => {
    const clientFieldId = Number(evalue);
    // console.log(typeof clientFieldId, evalue);
    if (isNaN(clientFieldId) && typeof clientFieldId !== 'number') {
      // 手工输入名称直接返回
      return evalue;
    }
    const selclients = this.props.clients.filter(cl => cl.partner_id === clientFieldId);
    this.props.setConsignFields({
      customer_tenant_id: selclients.length > 0 ? selclients[0].tid : -1,
      customer_partner_id: selclients.length > 0 ? clientFieldId : -1,
    });
    return selclients.length > 0 ? selclients[0].name : evalue;
  }
  render() {
    const {
      formhoc, mode, clients, customer_name: name, ref_external_no, vertical,
    } = this.props;
    const clientOpts = clients.map(cl => ({
      key: `${cl.partner_id}/${cl.tid}`,
      value: `${cl.partner_id}`,
      code: cl.partner_code,
      name: cl.partner_code ? `${cl.partner_code} | ${cl.name}` : cl.name,
    }));
    let content = '';
    if (vertical) {
      content = (
        <div>
          <InputItem formhoc={formhoc} labelName={this.msg('refExternalNo')}
            field="ref_external_no" fieldProps={{ initialValue: ref_external_no }}
          />
        </div>
      );
    } else {
      content = (
        <Row gutter={16}>
          <Col sm={24} md={12}>
            {
            mode === 'edit' ?
              <InputItem formhoc={formhoc} labelName={this.msg('client')}

                field="customer_name" disabled fieldProps={{ initialValue: name }}
              /> :
              <Tooltip placement="top" title={this.msg('customerTooltipTitle')}>
                <div>
                  <AutoCompSelectItem formhoc={formhoc} labelName={this.msg('client')}

                    field="customer_name"
                    required optionData={clientOpts} filterFields={['code']}
                    optionField="name" optionKey="key" optionValue="value"
                    rules={[{
                      required: true, message: this.msg('clientNameMust'),
                    }]}
                    initialValue={name} getValueFromEvent={this.findClientValue}
                  />
                </div>
              </Tooltip>
          }
          </Col>
          <Col sm={24} md={12}>
            <InputItem formhoc={formhoc} labelName={this.msg('refExternalNo')}
              colSpan={8}
              field="ref_external_no" fieldProps={{ initialValue: ref_external_no }}
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
