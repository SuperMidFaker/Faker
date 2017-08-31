/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Col, Row, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { loadCarriers } from 'common/reducers/cwmWarehouse';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    defaultWhse: state.cwmContext.defaultWhse,
    carriers: state.cwmWarehouse.carriers,
  }),
  { loadCarriers }
)
export default class CarrierPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    soHead: PropTypes.object,
    editable: PropTypes.bool,
    detailEnable: PropTypes.bool.isRequired,
    selectedOwner: PropTypes.number.isRequired,
  }
  componentWillMount() {
    this.props.loadCarriers(this.props.defaultWhse.code, this.props.defaultWhse.wh_ent_tenant_id);
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator }, soHead, carriers, selectedOwner } = this.props;
    const crs = carriers.filter(item => item.owner_partner_id === selectedOwner);
    return (
      <div style={{ padding: 24 }}>
        <Row>
          <Col span={6}>
            <FormItem label="承运人" >
              {getFieldDecorator('carrier_code', {
                rules: [{ message: 'Please select customer!' }],
                initialValue: soHead && soHead.carrier_code,
              })(
                <Select placeholder="选择承运人" onSelect={() => {}}>
                  {crs.map(item => (<Option value={item.code}>{item.name}</Option>))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}
