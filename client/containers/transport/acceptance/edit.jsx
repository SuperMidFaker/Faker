import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Button, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'reusable/decorators/connect-fetch';
import connectNav from 'reusable/decorators/connect-nav';
import { setNavTitle } from 'universal/redux/reducers/navbar';
import { setFormValue, setConsignFields, loadForm, loadFormRequire }
  from 'universal/redux/reducers/shipment';
import { saveEdit } from '../../../../universal/redux/reducers/transport-acceptance';
import InputItem from '../shipment/forms/input-item';
import AutoCompSelectItem from '../shipment/forms/autocomp-select-item';
import ConsignInfo from '../shipment/forms/consign-info';
import GoodsInfo from '../shipment/forms/goods-info';
import ScheduleInfo from '../shipment/forms/schedule-info';
import ModeInfo from '../shipment/forms/mode-info';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

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
  { setFormValue, setConsignFields, saveEdit })
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
    saveEdit: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleEdit = (ev) => {
    const {formData, tenantId, loginId} = this.props
    ev.preventDefault();
    this.props.saveEdit(formData, tenantId, loginId)
      .then( result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.context.router.goBack();
          this.props.loadTable(null, {
            tenantId: this.props.tenantId,
            pageSize: this.props.pageSize,
            currentPage: this.props.current,
          });
        }
      });
  }
  handleCancel = () => {
    this.context.router.goBack();
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
                  <div className="subform-title">关联信息</div>
                </div>
                <div className="subform-body">
                  <AutoCompSelectItem placeholder={this.msg('client')} formhoc={formhoc}
                                      colSpan={0} field="client" optionData={clientOpts} required
                                      optionField="name" optionKey="key" optionValue="value"
                                      rules={[{
                required: true, message: this.msg('clientNameMust')
              }]}
                  />
                  <InputItem formhoc={formhoc} placeholder={this.msg('lsp')} colSpan={0} value={tenantName} disabled/>
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
            <Button size="large" htmlType="submit" type="primary" loading={submitting} onClick={this.handleEdit}>
              {this.msg('save')}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}
