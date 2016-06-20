import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Button, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { loadForm, loadFormRequire }
  from 'common/reducers/shipment';
import { loadTable, saveEdit } from 'common/reducers/transport-acceptance';
import ClientInfo from '../shipment/forms/clientInfo';
import ConsignInfo from '../shipment/forms/consign-info';
import GoodsInfo from '../shipment/forms/goods-info';
import ScheduleInfo from '../shipment/forms/schedule-info';
import ModeInfo from '../shipment/forms/mode-info';
import CorrelInfo from '../shipment/forms/correlInfo';
import { format } from 'client/common/i18n/helpers';
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
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    formData: state.shipment.formData,
    submitting: state.transportAcceptance.submitting,
    filters: state.transportAcceptance.table.filters,
    sortField: state.transportAcceptance.table.sortField,
    sortOrder: state.transportAcceptance.table.sortOrder,
    pageSize: state.transportAcceptance.table.shipmentlist.pageSize,
    current: state.transportAcceptance.table.shipmentlist.current,
  }),
  { loadTable, saveEdit })
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
@Form.create({
  formPropName: 'formhoc'
})
export default class ShipmentEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    filters: PropTypes.array.isRequired,
    sortField: PropTypes.string.isRequired,
    sortOrder: PropTypes.string.isRequired,
    pageSize: PropTypes.number.isRequired,
    current: PropTypes.number.isRequired,
    submitting: PropTypes.bool.isRequired,
    saveEdit: PropTypes.func.isRequired,
    loadTable: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleEdit = (ev) => {
    ev.preventDefault();
    this.props.formhoc.validateFields(errors => {
      if (errors) {
        message.error(this.msg('formError'));
      } else {
        const { formData, tenantId, loginId } = this.props;
        const form = { ...formData, ...this.props.formhoc.getFieldsValue() };
        this.props.saveEdit(form, tenantId, loginId)
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
    const { intl, submitting, formhoc } = this.props;
    return (
      <div className="main-content">
        <Form form={formhoc} horizontal>
          <div className="page-body">
            <div className="panel-header"></div>
            <div className="panel-body body-responsive">
              <Col span="16" className="main-col">
                <ClientInfo outerColSpan={16} intl={intl} formhoc={formhoc} mode="edit" />
                <ConsignInfo type="consigner" intl={intl} outerColSpan={16} labelColSpan={8} formhoc={formhoc} />
                <ConsignInfo type="consignee" intl={intl} outerColSpan={16} labelColSpan={8} formhoc={formhoc} />
                <ScheduleInfo intl={intl} formhoc={formhoc} />
                <ModeInfo intl={intl} formhoc={formhoc} />
                <GoodsInfo intl={intl} labelColSpan={8} formhoc={formhoc}/>
              </Col>
              <CorrelInfo formhoc={formhoc} intl={intl} />
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
