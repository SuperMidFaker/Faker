import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Button, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'reusable/decorators/connect-fetch';
import connectNav from 'reusable/decorators/connect-nav';
import { setNavTitle } from 'universal/redux/reducers/navbar';
import { loadFormRequire, setFormValue, setConsignFields }
  from 'universal/redux/reducers/shipment';
import { saveAndAccept, loadTable, saveDraft }
  from 'universal/redux/reducers/transport-acceptance';
import InputItem from '../shipment/forms/input-item';
import AutoCompSelectItem from '../shipment/forms/autocomp-select-item';
import ConsignInfo from '../shipment/forms/consign-info';
import GoodsInfo from '../shipment/forms/goods-info';
import ScheduleInfo from '../shipment/forms/schedule-info';
import ModeInfo from '../shipment/forms/mode-info';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadFormRequire(cookie, state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    tenantName: state.corpDomain.name,
    formData: state.shipment.formData,
    transitModes: state.shipment.formRequire.transitModes,
    clients: state.shipment.formRequire.clients,
    submitting: state.transportAcceptance.submitting,
    filters: state.transportAcceptance.table.filters,
    sortField: state.transportAcceptance.table.sortField,
    sortOrder: state.transportAcceptance.table.sortOrder,
    pageSize: state.transportAcceptance.table.shipmentlist.pageSize,
    current: state.transportAcceptance.table.shipmentlist.current,
  }),
  { setFormValue, setConsignFields, loadTable, saveAndAccept, saveDraft })
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: formatMsg(props.intl, 'newTitle'),
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
      if (name === 'client') {
        const clientFieldId = fields[name].value;
        const selclients = props.clients.filter(
            cl => cl.tid === parseInt(clientFieldId, 10)
        );
        props.setConsignFields({
          client_id: selclients.length > 0 ? clientFieldId : 0,
          client_partner_id: selclients.length > 0 && selclients[0].partner_id,
          client: selclients.length > 0 ? selclients[0].name : clientFieldId,
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
export default class ShipmentCreate extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    transitModes: PropTypes.array.isRequired,
    clients: PropTypes.array.isRequired,
    submitting: PropTypes.bool.isRequired,
    setFormValue: PropTypes.func.isRequired,
    setConsignFields: PropTypes.func.isRequired,
    filters: PropTypes.array.isRequired,
    sortField: PropTypes.string.isRequired,
    sortOrder: PropTypes.string.isRequired,
    pageSize: PropTypes.number.isRequired,
    current: PropTypes.number.isRequired,
    loadTable: PropTypes.func.isRequired,
    saveAndAccept: PropTypes.func.isRequired,
    saveDraft: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleSaveAndAccept = (ev) => {
    ev.preventDefault();
    this.props.formhoc.validateFields(errors => {
      if (errors) {
        message.error(this.msg('formError'));
      } else {
        this.props.saveAndAccept(
          this.props.formData, {
            tid: this.props.tenantId,
            name: this.props.tenantName,
            login_id: this.props.loginId,
            login_name: this.props.loginName,
          }).then(
          result => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              this.context.router.goBack();
              this.props.loadTable(null, {
                tenantId: this.props.tenantId,
                filters: JSON.stringify(this.props.filters),
                pageSize: this.props.pageSize,
                currentPage: this.props.current,
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
    this.props.formhoc.validateFields(errors => {
      if (errors) {
        message.error(this.msg('formError'));
      } else {
        this.props.saveDraft(
          this.props.formData, {
            tid: this.props.tenantId,
            name: this.props.tenantName,
            login_id: this.props.loginId,
            login_name: this.props.loginName,
          }).then(
          result => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              this.context.router.goBack();
            }
          });
      }
    });
  }
  render() {
    const { intl, clients, submitting, tenantName, formhoc } = this.props;
    const clientOpts = clients.map(cl => ({
      key: `${cl.name}/${cl.tid}`,
      value: `${cl.tid}`,
      name: cl.name
    }));
    return (
      <div className="main-content">
        <Form form={formhoc} horizontal>
         <div className="page-body">
         <div className="panel-header"></div>
         <div className="panel-body body-responsive">
          <Col span="16" className="main-col">
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
                <AutoCompSelectItem formhoc={formhoc} colSpan={0} field="client"
                  optionData={clientOpts} required
                  optionField="name" optionKey="key" optionValue="value"
                  rules={[{
                    required: true, message: this.msg('clientNameMust')
                  }]}
                />
                <InputItem formhoc={formhoc} placeholder={this.msg('lsp')} colSpan={0}
                  fieldProps={{initialValue: tenantName}} disabled rules={[{
                    required: true, message: this.msg('lspNameMust')
                  }]}
                />
                <InputItem formhoc={formhoc} placeholder={this.msg('refExternalNo')} colSpan={0} field="ref_external_no"/>
                <InputItem formhoc={formhoc} placeholder={this.msg('refWaybillNo')} colSpan={0} field="ref_waybill_no"/>
                <InputItem formhoc={formhoc} placeholder={this.msg('refEntryNo')} colSpan={0} field="ref_entry_no"/>
                </div>
                <div className="subform-heading">
                    <div className="subform-title">{this.msg('freightCharge')}</div>
                </div>
              <div className="subform-body">
                <InputItem type="number" formhoc={formhoc} colSpan={0}
                  field="freight_charge" hasFeedback={false} rules={[{
                        type: 'number', transform: value => Number(value), min: 0, message: this.msg('freightChargeMustBeNumber')
                  }]}
                />
              </div>
          </Col>
          </div>
          </div>
          <div className="bottom-fixed-row">
              <Button size="large" htmlType="submit" type="primary" loading={submitting} onClick={this.handleSaveAndAccept}>
              {this.msg('saveAndAccept')}
              </Button>
              <Button size="large" onClick={this.handleDraftSave} loading={submitting}>
              {this.msg('saveAsDraft')}
              </Button>
            </div>
        </Form>
      </div>
    );
  }
}
