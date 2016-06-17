import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Button, InputNumber, message, Popconfirm } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { loadFormRequire, setFormValue, setConsignFields }
  from 'common/reducers/shipment';
import { savePending, saveAndAccept, loadTable, saveDraft }
  from 'common/reducers/transport-acceptance';
import InputItem from '../shipment/forms/input-item';
import ClientInfo from '../shipment/forms/clientInfo';
import ConsignInfo from '../shipment/forms/consign-info';
import GoodsInfo from '../shipment/forms/goods-info';
import ScheduleInfo from '../shipment/forms/schedule-info';
import ModeInfo from '../shipment/forms/mode-info';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
const formatGlobalMsg = format(globalMessages);
const formatMsg = format(messages);
const FormItem = Form.Item;

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
    submitting: state.transportAcceptance.submitting,
    filters: state.transportAcceptance.table.filters,
    sortField: state.transportAcceptance.table.sortField,
    sortOrder: state.transportAcceptance.table.sortOrder,
    pageSize: state.transportAcceptance.table.shipmentlist.pageSize,
    current: state.transportAcceptance.table.shipmentlist.current,
  }),
  { setFormValue, setConsignFields, loadTable, savePending, saveAndAccept, saveDraft })
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
  onFieldsChange(props, fields) {
    Object.keys(fields).forEach(name => {
      if (name === 'transport_mode_code') {
        const code = fields[name].value;
        const modes = props.transitModes.filter(tm => tm.mode_code === code);
        props.setConsignFields({
          transport_mode_code: code,
          transport_mode: modes.length > 0 ? modes[0].mode_name : '',
        });
      } else if (name !== 'customer_name') {
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
    submitting: PropTypes.bool.isRequired,
    setFormValue: PropTypes.func.isRequired,
    setConsignFields: PropTypes.func.isRequired,
    filters: PropTypes.array.isRequired,
    sortField: PropTypes.string.isRequired,
    sortOrder: PropTypes.string.isRequired,
    pageSize: PropTypes.number.isRequired,
    current: PropTypes.number.isRequired,
    loadTable: PropTypes.func.isRequired,
    savePending: PropTypes.func.isRequired,
    saveAndAccept: PropTypes.func.isRequired,
    saveDraft: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleSavePending = (ev) => {
    ev.preventDefault();
    this.props.formhoc.validateFields(errors => {
      if (errors) {
        message.error(this.msg('formError'));
      } else {
        this.props.savePending(
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
              message.success(this.msg('shipmtOpSuccess'));
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
  handleSaveAndAccept = () => {
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
              message.success(this.msg('shipmtOpSuccess'));
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
          message.success(this.msg('shipmtOpSuccess'));
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
  render() {
    const { intl, submitting, tenantName, formhoc, formData: {
      ref_waybill_no, ref_entry_no, remark, freight_charge,
    }} = this.props;
    return (
      <div className="main-content">
        <Form form={formhoc} horizontal>
          <div className="page-body">
            <div className="panel-header" />
            <div className="panel-body body-responsive">
              <Col span="16" className="main-col">
                <ClientInfo outerColSpan={16} intl={intl} formhoc={formhoc} />
                <ConsignInfo type="consigner" intl={intl} outerColSpan={16}
                labelColSpan={8} formhoc={formhoc}
                />
                <ConsignInfo type="consignee" intl={intl} outerColSpan={16}
                labelColSpan={8} formhoc={formhoc}
                />
                <ScheduleInfo intl={intl} formhoc={formhoc} />
                <ModeInfo intl={intl} formhoc={formhoc} />
                <GoodsInfo intl={intl} labelColSpan={8} formhoc={formhoc}/>
              </Col>
              <Col span="8" className="right-side-col">
                <div className="subform-heading">
                  <div className="subform-title">{this.msg('correlativeInfo')}</div>
                </div>
                <div className="subform-body">
                  <InputItem formhoc={formhoc} placeholder={this.msg('lsp')} colSpan={0}
                    fieldProps={{initialValue: tenantName}} disabled rules={[{
                      required: true, message: this.msg('lspNameMust')
                    }]} field="lsp"
                  />
                  <InputItem formhoc={formhoc} placeholder={this.msg('refWaybillNo')}
                  colSpan={0} field="ref_waybill_no"
                  fieldProps={{initialValue: ref_waybill_no}}
                  />
                  <InputItem formhoc={formhoc} placeholder={this.msg('refEntryNo')}
                  colSpan={0} field="ref_entry_no"
                  fieldProps={{initialValue: ref_entry_no}}
                  />
                  <InputItem type="textarea" formhoc={formhoc} placeholder={this.msg('remark')}
                  colSpan={0} field="remark"
                  fieldProps={{initialValue: remark}}
                  />
                </div>
                <div className="subform-heading">
                  <div className="subform-title">{this.msg('freightCharge')}</div>
                </div>
                <div className="subform-body">
                  <FormItem labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
                    <InputNumber style={{ width: '100%' }} min={0} step={0.1}
                    { ...formhoc.getFieldProps('freight_charge', {
                      initialValue: freight_charge
                    }) }
                    />
                  </FormItem>
                </div>
              </Col>
            </div>
          </div>
          <div className="bottom-fixed-row">
            <Button size="large" type="primary" loading={submitting} onClick={this.handleSavePending}>
            {formatGlobalMsg(intl, 'save')}
            </Button>
            <Popconfirm placement="top" title={this.msg('saveAndAcceptConfirm')} onConfirm={this.handleSaveAndAccept}>
              <Button size="large" loading={submitting}>
              {this.msg('saveAndAccept')}
              </Button>
            </Popconfirm>
            <Button size="large" loading={submitting} onClick={this.handleDraftSave}>
            {this.msg('saveAsDraft')}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}
