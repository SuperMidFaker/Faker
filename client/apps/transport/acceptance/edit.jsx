import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Button, InputNumber, message, Row } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { setFormValue, setConsignFields, loadForm, loadFormRequire }
  from 'common/reducers/shipment';
import { loadTable, saveEdit } from 'common/reducers/transport-acceptance';
import InputItem from '../shipment/forms/input-item';
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
  { setFormValue, setConsignFields, loadTable, saveEdit })
@connectNav((props, dispatch, router) => {
  if (!props.formData.shipmt_no) {
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
@Form.formify({
  mapPropsToFields(props) {
    return props.formData;
  },
  onFieldsChange(props, fields) {
    Object.keys(fields).forEach(name => {
      if (name === 'transport_mode_code') {
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
export default class ShipmentEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    transitModes: PropTypes.array.isRequired,
    filters: PropTypes.array.isRequired,
    sortField: PropTypes.string.isRequired,
    sortOrder: PropTypes.string.isRequired,
    pageSize: PropTypes.number.isRequired,
    current: PropTypes.number.isRequired,
    submitting: PropTypes.bool.isRequired,
    setFormValue: PropTypes.func.isRequired,
    setConsignFields: PropTypes.func.isRequired,
    saveEdit: PropTypes.func.isRequired,
    loadTable: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleEdit = (ev) => {
    ev.preventDefault();
    this.props.formhoc.validateFields(errors => {
      if (errors) {
        message.error(this.msg('formError'));
      } else {
        const {formData, tenantId, loginId} = this.props;
        this.props.saveEdit(formData, tenantId, loginId)
        .then(result => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            message.success(this.msg('shipmtOpSuccess'));
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
  handleCancel = () => {
    this.context.router.goBack();
  }
  render() {
    const { intl, submitting, tenantName, formhoc } = this.props;
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
                    <InputItem formhoc={formhoc} labelName={this.msg('client')} colSpan={4} field="client" disabled/>
                  </Col>
                  <Col span="8" className="subform-body">
                    <InputItem formhoc={formhoc} labelName={this.msg('refExternalNo')} colSpan={8} field="ref_external_no"/>
                  </Col>
                </Row>
                <ConsignInfo type="consigner" intl={intl} outerColSpan={16} labelColSpan={8} formhoc={formhoc} />
                <ConsignInfo type="consignee" intl={intl} outerColSpan={16} labelColSpan={8} formhoc={formhoc} />
                <ScheduleInfo intl={intl} formhoc={formhoc} />
                <ModeInfo intl={intl} formhoc={formhoc} />
                <GoodsInfo intl={intl} labelColSpan={8} formhoc={formhoc}/>
              </Col>
              <Col span="8" className="right-side-col">
                <div className="subform-heading">
                  <div className="subform-title">关联信息</div>
                </div>
                <div className="subform-body">
                  <InputItem formhoc={formhoc} placeholder={this.msg('lsp')} colSpan={0}
                    fieldProps={{ initialValue: tenantName }} disabled
                  />
                  <InputItem formhoc={formhoc} placeholder={this.msg('refWaybillNo')} colSpan={0} field="ref_waybill_no"/>
                  <InputItem formhoc={formhoc} placeholder={this.msg('refEntryNo')} colSpan={0} field="ref_entry_no"/>
                  <InputItem type="textarea" formhoc={formhoc} placeholder={this.msg('remark')} colSpan={0} field="remark"/>
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
            <Button size="large" htmlType="submit" type="primary" loading={submitting} onClick={this.handleEdit}>
              {this.msg('save')}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}
