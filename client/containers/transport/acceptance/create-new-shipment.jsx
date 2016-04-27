import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Form, Button } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'reusable/decorators/connect-fetch';
import connectNav from 'reusable/decorators/connect-nav';
import { setNavTitle } from 'universal/redux/reducers/navbar';
import { loadFormRequire, setFormValue } from 'universal/redux/reducers/shipment';
import InputItem from '../shipment/forms/input-item';
import AutoCompSelectItem from '../shipment/forms/autocomp-select-item';
import ConsignInfo from '../shipment/forms/consign-info';
import GoodsInfo from '../shipment/forms/goods-info';
import ScheduleInfo from '../shipment/forms/schedule-info';
import ModeInfo from '../shipment/forms/mode-info';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
// import globalMessages from 'client/root.i18n';
const formatMsg = format(messages);
// const formatGlobalMsg = format(globalMessages);

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadFormRequire(cookie, state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: formatMsg(props.intl, 'newTitle'),
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: () => router.goBack()
  }));
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    formData: state.shipment.formData,
    submitting: state.shipment.submitting
  }),
  { setFormValue })
@Form.formify({
  mapPropsToFields(props) {
    return props.formData;
  },
  onFieldsChange(props, fields) {
    if (Object.keys(fields).length === 1) {
      const name = Object.keys(fields)[0];
      props.setFormValue(name, fields[name].value || '');
    }
  },
  formPropName: 'formhoc'
})
export default class ShipmentCreate extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
    setFormValue: PropTypes.func.isRequired
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  render() {
    const { intl, formhoc } = this.props;
    return (
      <Form form={formhoc} horizontal className="form-edit-content offset-mid-col">
        <Col span="14" className="subform">
          <ConsignInfo type="consigner" intl={intl} outerColSpan={14} labelColSpan={4} formhoc={formhoc} />
          <ConsignInfo type="consignee" intl={intl} outerColSpan={14} labelColSpan={4} formhoc={formhoc} />
          <ScheduleInfo intl={intl} formhoc={formhoc} />
          <ModeInfo intl={intl} formhoc={formhoc} />
          <GoodsInfo intl={intl} labelColSpan={6} formhoc={formhoc}/>
        </Col>
        <Col span="8">
          <Row className="subform">
            <AutoCompSelectItem labelName={this.msg('client')} formhoc={formhoc}
              colSpan={4} field="client" optionData={[]} required
            />
            <InputItem formhoc={formhoc} labelName={this.msg('lsp')} colSpan={4}
              field="tenant_name" disabled
            />
            <InputItem formhoc={formhoc} labelName={this.msg('refExternalNo')} colSpan={4}
              field="ref_external_no"
            />
            <InputItem formhoc={formhoc} labelName={this.msg('refWaybillNo')} colSpan={4}
              field="ref_waybill_no"
            />
            <InputItem formhoc={formhoc} labelName={this.msg('refEntryNo')} colSpan={4}
              field="ref_entry_no"
            />
            <InputItem formhoc={formhoc} labelName={this.msg('remark')} colSpan={4}
              field="remark"
            />
            <InputItem type="number" formhoc={formhoc} labelName={this.msg('freightCharge')} colSpan={4}
              field="freight_charge" hasFeedback={false} rules={[{
                type: 'integer', transform: (value) => value >= 0 ? +value : null,
                  message: this.msg('freightChargeMustBeNumber')
              }]}
            />
          </Row>
          <Row className="subform-buton-row">
            <Button htmlType="submit" type="primary">{this.msg('saveAndAccept')}</Button>
          </Row>
          <Row className="subform-buton-row">
            <Button>{this.msg('saveAsDraft')}</Button>
          </Row>
        </Col>
      </Form>
    );
  }
}
