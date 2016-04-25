import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import { Row, Col } from 'ant-ui';
import AutoCompSelectItem from './autocomp-select-item';
import InputItem from './input-item';
import { format } from 'universal/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

export default class ConsignInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    type: PropTypes.oneOf(['consignee', 'consigner']),
    outerColSpan: PropTypes.number.isRequired,
    labelColSpan: PropTypes.number.isRequired,
    formhoc: PropTypes.object.isRequired
  }

  msg = (key, values) => formatMsg(this.props.intl, key, values)
  renderMsgKeys = this.props.type === 'consignee' ? {
    title: 'pickupInfo',
    name: 'consignee',
    portal: 'arrivalPort',
    addr: 'pickupAddr'
  } : {
    title: 'deliveryInfo',
    name: 'consigner',
    portal: 'departurePort',
    addr: 'deliveryAddr'
  }
  renderFields = this.props.type === 'consignee' ? {
    name: 'consignee_name',
    portal: 'consignee_province',
    addr: 'consignee_addr',
    contact: 'consignee_contact',
    mobile: 'consignee_mobile',
    email: 'consignee_email'
  } : {
    name: 'consigner_name',
    portal: 'consigner_province',
    addr: 'consigner_addr',
    contact: 'consigner_contact',
    mobile: 'consigner_mobile',
    email: 'consigner_email'
  }
  render() {
    const {
      outerColSpan, labelColSpan, formhoc
    } = this.props;
    return (
      <Row>
        <div className="subform-heading">
          <div className="subform-title">{this.msg(this.renderMsgKeys.title)}</div>
        </div>
        <Col span={`${outerColSpan}`} className="subform-body">
          <AutoCompSelectItem labelName={this.msg(this.renderMsgKeys.name)}
            field={this.renderFields.name} colSpan={labelColSpan} required
            rules={[{
              required: true, message: this.msg('consignNameMessage')
            }]}
          />
          <InputItem formhoc={formhoc} labelName={this.msg(this.renderMsgKeys.portal)}
            field={this.renderFields.portal} colSpan={labelColSpan}
          />
          <InputItem formhoc={formhoc} labelName={this.msg(this.renderMsgKeys.addr)}
            field={this.renderFields.addr} colSpan={labelColSpan} required
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
