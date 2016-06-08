import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Button, InputNumber, message, Row } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { setFormValue, setConsignFields, loadDraftForm, loadFormRequire }
  from 'common/reducers/shipment';
import { acceptDraft, loadTable, saveEdit } from 'common/reducers/transport-acceptance';
import InputItem from '../shipment/forms/input-item';
import AutoCompSelectItem from '../shipment/forms/autocomp-select-item';
import ConsignInfo from '../shipment/forms/consign-info';
import GoodsInfo from '../shipment/forms/goods-info';
import ScheduleInfo from '../shipment/forms/schedule-info';
import ModeInfo from '../shipment/forms/mode-info';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;

function fetchData({ state, dispatch, params, cookie }) {
  const promises = [];
  promises.push(dispatch(loadDraftForm(cookie, {
    shipmtno: params.shipmt
  })));
  promises.push(dispatch(loadFormRequire(
    cookie, state.account.tenantId
  )));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    transitModes: state.shipment.formRequire.transitModes,
    clients: state.shipment.formRequire.clients,
    formData: state.shipment.formData,
    submitting: state.transportAcceptance.submitting,
    filters: state.transportAcceptance.table.filters,
    sortField: state.transportAcceptance.table.sortField,
    sortOrder: state.transportAcceptance.table.sortOrder,
    pageSize: state.transportAcceptance.table.shipmentlist.pageSize,
    current: state.transportAcceptance.table.shipmentlist.current,
  }),
  { setFormValue, setConsignFields, acceptDraft, loadTable, saveEdit })
@connectNav((props, dispatch, router) => {
  if (!props.formData.shipmt_no) {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: `${formatMsg(props.intl, 'draftShipmt')} ${props.formData.shipmt_no}`,
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: () => router.goBack()
  }));
})
@Form.formify({
  mapPropsToFields(props) {
    return props.formData;
  },
  onFieldsChange(props, fields) {
    Object.keys(fields).forEach(name => {
      if (name === 'customer_name') {
        const clientFieldId = parseInt(fields[name].value, 10);
        const selclients = props.clients.filter(
            cl => cl.partner_id === clientFieldId
        );
        props.setConsignFields({
          customer_tenant_id: selclients.length > 0 ? selclients[0].tid : -1,
          customer_partner_id: selclients.length > 0 ? clientFieldId : -1,
          customer_name: selclients.length > 0 ? selclients[0].name : fields[name].value,
        });
      } else if (name === 'transport_mode_code') {
        const code = fields[name].value;
        const modes = props.transitModes.filter(tm => tm.mode_code === code);
        props.setConsignFields({
          transport_mode_code: code,
          transport_mode: modes.length > 0 ? modes[0].mode_name : '',
        });
      } else {
        props.setFormValue(name, fields[name].value);
      }
    });
  },
  formPropName: 'formhoc'
})
export default class ShipmentDraftEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    transitModes: PropTypes.array.isRequired,
    clients: PropTypes.array.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    setFormValue: PropTypes.func.isRequired,
    setConsignFields: PropTypes.func.isRequired,
    filters: PropTypes.array.isRequired,
    sortField: PropTypes.string.isRequired,
    sortOrder: PropTypes.string.isRequired,
    pageSize: PropTypes.number.isRequired,
    current: PropTypes.number.isRequired,
    submitting: PropTypes.bool.isRequired,
    acceptDraft: PropTypes.func.isRequired,
    saveEdit: PropTypes.func.isRequired,
    loadTable: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleDraftAccept = (ev) => {
    ev.preventDefault();
    this.props.formhoc.validateFields(errors => {
      if (errors) {
        message.error(this.msg('formError'));
      } else {
        const { formData, loginId, loginName, tenantId } = this.props;
        this.props.acceptDraft(formData, loginId, loginName, tenantId)
        .then(result => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            this.context.router.goBack();
            this.props.loadTable(null, {
              tenantId: this.props.tenantId,
              pageSize: this.props.pageSize,
              currentPage: this.props.current,
              filters: JSON.stringify(this.props.filters),
              sortField: this.props.sortField,
              sortOrder: this.props.sortOrder,
            });
          }
        });
      }
    });
  }
  handleDraftSave = (ev) => {
    ev.preventDefault();
    if (!this.props.formData.consigner_name || !this.props.formData.consignee_name) {
      this.props.formhoc.validateFields([
        'consigner_name',
        'consignee_name',
      ]);
      return;
    }
    this.props.saveEdit(this.props.formData, this.props.tenantId, this.props.loginId)
      .then(result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.context.router.goBack();
          this.props.loadTable(null, {
            tenantId: this.props.tenantId,
            pageSize: this.props.pageSize,
            currentPage: this.props.current,
            filters: JSON.stringify(this.props.filters),
            sortField: this.props.sortField,
            sortOrder: this.props.sortOrder,
          });
        }
      });
  }
  render() {
    const { intl, clients, submitting, formhoc } = this.props;
    const clientOpts = clients.map(cl => ({
      key: `${cl.partner_id}/${cl.tid}`,
      value: `${cl.partner_id}`,
      code: cl.partner_code,
      name: cl.name,
    }));
    return (
      <div className="main-content">
        <Form form={formhoc} horizontal>
          <div className="page-body">
            <div className="panel-header"></div>
            <div className="panel-body body-responsive">
              <Col span="16" className="main-col">
                <Row>
                  <div className="subform-heading">
                    <div className="subform-title">{this.msg('customerInfo')}</div>
                  </div>
                  <Col span="16" className="subform-body">
                    <AutoCompSelectItem formhoc={formhoc} labelName={this.msg('client')} colSpan={3} field="customer_name"
                    required optionData={clientOpts} filterFields={[ 'code' ]}
                    optionField="name" optionKey="key" optionValue="value"
                    rules={[{
                      required: true, message: this.msg('clientNameMust')
                    }]} />
                  </Col>
                  <Col span="8" className="subform-body">
                    <InputItem formhoc={formhoc} labelName={this.msg('refExternalNo')} colSpan={6} field="ref_external_no"/>
                  </Col>
                </Row>
                <ConsignInfo type="consigner" intl={intl} outerColSpan={16} labelColSpan={6} formhoc={formhoc} />
                <ConsignInfo type="consignee" intl={intl} outerColSpan={16} labelColSpan={6} formhoc={formhoc} />
                <ScheduleInfo intl={intl} formhoc={formhoc} />
                <ModeInfo intl={intl} formhoc={formhoc} />
                <GoodsInfo intl={intl} labelColSpan={6} formhoc={formhoc}/>
                <InputItem type="textarea" formhoc={formhoc} placeholder={this.msg('remark')} colSpan={0} field="remark"/>
              </Col>
              <Col span="8" className="right-side-col">
                <div className="subform-heading">
                  <div className="subform-title">{this.msg('correlativeInfo')}</div>
                </div>
                <div className="subform-body">
                  <InputItem formhoc={formhoc} placeholder={this.msg('lsp')} colSpan={0} field="lsp_name" disabled />
                  <InputItem formhoc={formhoc} placeholder={this.msg('refWaybillNo')} colSpan={0} field="ref_waybill_no"/>
                  <InputItem formhoc={formhoc} placeholder={this.msg('refEntryNo')} colSpan={0} field="ref_entry_no"/>
                </div>
                <div className="subform-heading">
                  <div className="subform-title">{this.msg('freightCharge')}</div>
                </div>
                <div className="subform-body">
                  <FormItem labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
                    <InputNumber style={{ width: '100%' }} min={0} step={0.1}
                    { ...formhoc.getFieldProps('freight_charge') }
                    />
                  </FormItem>
                </div>
              </Col>
            </div>
          </div>
          <div className="bottom-fixed-row">
            <Button size="large" htmlType="submit" type="primary" loading={submitting} onClick={this.handleDraftAccept}>
            {this.msg('saveAndAccept')}
            </Button>
            <Button size="large" htmlType="submit" loading={submitting} onClick={this.handleDraftSave}>
            {this.msg('saveAsDraft')}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}
