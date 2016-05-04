import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Form, Button, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'reusable/decorators/connect-fetch';
import connectNav from 'reusable/decorators/connect-nav';
import { setNavTitle } from 'universal/redux/reducers/navbar';
import { setFormValue, setConsignFields, loadForm, loadFormRequire }
  from 'universal/redux/reducers/shipment';
import InputItem from '../shipment/forms/input-item';
import AutoCompSelectItem from '../shipment/forms/autocomp-select-item';
import ConsignInfo from '../shipment/forms/consign-info';
import GoodsInfo from '../shipment/forms/goods-info';
import ScheduleInfo from '../shipment/forms/schedule-info';
import ModeInfo from '../shipment/forms/mode-info';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/root.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);

function fetchData({ state, dispatch, params, cookie }) {
  const promises = [];
  const shipmtNo = params.shipmt;
  promises.push(dispatch(loadForm(cookie, {
    tenantId: state.account.tenantId,
    shipmtNo
  })));
  promises.push(dispatch(loadFormRequire(
    cookie, state.account.tenantId
  )));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connectNav((props, dispatch, router) => {
  if (!props.formData) {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: props.formData.shipmt_no,
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: () => router.goBack()
  }));
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    tenantName: state.corpDomain.name,
    formData: state.shipment.formData,
    clients: state.shipment.formRequire.clients,
    submitting: state.transportAcceptance.submitting,
  }),
  { setFormValue, setConsignFields, })
@Form.formify({
  mapPropsToFields(props) {
    return props.formData;
  },
  onFieldsChange(props, fields) {
    if (Object.keys(fields).length === 1) {
      const name = Object.keys(fields)[0];
      if (name === 'client') {
        const clientFieldId = fields[name].value;
        const selclients = props.clients.filter(
            cl => cl.tid === parseInt(clientFieldId, 10)
        );
        props.setConsignFields({
          client_id: selclients.length > 0 ? clientFieldId : 0,
          client: selclients.length > 0 ? selclients[0].name : clientFieldId,
        });
      } else {
        props.setFormValue(name, fields[name].value || '');
      }
    }
  },
  formPropName: 'formhoc'
})
export default class ShipmentEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    clients: PropTypes.array.isRequired,
    setFormValue: PropTypes.func.isRequired,
    setConsignFields: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleEdit = (ev) => {
    message.info(ev.target.value);
  }
  handleCancel = (ev) => {
    message.info(ev.target.value);
  }
  render() {
    const { intl, clients, submitting, tenantName, formhoc } = this.props;
    const clientOpts = clients.map(cl => ({
      key: `${cl.name}/${cl.tid}`,
      value: `${cl.tid}`,
      name: cl.name
    }));
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
              colSpan={4} field="client" optionData={clientOpts} required
              optionField="name" optionKey="key" optionValue="value"
              rules={[{
                required: true, message: this.msg('clientNameMust')
              }]}
            />
            <InputItem formhoc={formhoc} labelName={this.msg('lsp')} colSpan={4}
              value={tenantName} disabled
            />
            <InputItem formhoc={formhoc} labelName={this.msg('shipNo')} colSpan={4}
              value={this.props.formData.shipmt_no} disabled
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
                type: 'number', transform: value => Number(value), min: 0, message: this.msg('freightChargeMustBeNumber')
              }]}
            />
          </Row>
          <Row className="subform-buton-row">
            <Button htmlType="submit" type="primary" loading={submitting}
            onClick={this.handleEdit}
            >
            {formatGlobalMsg(intl, 'ok')}
            </Button>
          </Row>
          <Row className="subform-buton-row">
            <Button onClick={this.handleCancel} loading={submitting}>
            {formatGlobalMsg(intl, 'cancel')}
            </Button>
          </Row>
        </Col>
      </Form>
    );
  }
}
