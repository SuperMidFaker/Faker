import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Form, Button, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadDraftForm, loadFormRequire } from 'common/reducers/shipment';
import { acceptDraft, loadTable, saveEdit } from 'common/reducers/transport-acceptance';
import ClientInfo from '../shipment/forms/clientInfo';
import ConsignInfo from '../shipment/forms/consign-info';
import GoodsInfo from '../shipment/forms/goods-info';
import ModeInfo from '../shipment/forms/mode-info';
import CorrelInfo from '../shipment/forms/correlInfo';
import FreightCharge from '../shipment/forms/freightCharge';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

function fetchData({ state, dispatch, params, cookie }) {
  const promises = [];
  promises.push(dispatch(loadDraftForm(cookie, {
    shipmtno: params.shipmt,
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
  { acceptDraft, loadTable, saveEdit })
@connectNav({
  depth: 3,
  text: props => `${formatMsg(props.intl, 'draftShipmt')} ${props.formData.shipmt_no}`,
  moduleName: 'transport',
  lifecycle: 'componentWillReceiveProps',
  until: props => props.formData.shipmt_no,
})
@withPrivilege({ module: 'transport', feature: 'shipment', action: 'edit' })
@Form.create()
export default class ShipmentDraftEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
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
    router: PropTypes.object.isRequired,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleDraftAccept = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((errors) => {
      if (errors) {
        message.error(this.msg('formError'));
      } else {
        const { loginId, loginName, tenantId } = this.props;
        const form = {
          ...this.props.formData,
          ...this.props.form.getFieldsValue(),
        };
        this.props.acceptDraft(form, loginId, loginName, tenantId)
        .then((result) => {
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
  handleDraftSave = (ev) => {
    ev.preventDefault();
    const form = {
      ...this.props.formData,
      ...this.props.form.getFieldsValue(),
    };
    this.props.saveEdit(form, this.props.tenantId, this.props.loginId)
      .then((result) => {
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
    const { intl, submitting, form } = this.props;
    return (
      <div>
        <header className="top-bar">
          <div className="tools">
            <Button size="large" type="primary" loading={submitting} onClick={this.handleDraftAccept}>
              {this.msg('saveAndAccept')}
            </Button>
          </div>
          <span>{this.msg('shipmtDraft')}</span>
        </header>
        <div className="main-content">
          <Form horizontal>
            <div className="page-body card-wrapper">
              <Row gutter={16}>
                <Col span="16">
                  <ClientInfo outerColSpan={16} intl={intl} formhoc={form} />
                  <ConsignInfo type="consigner" intl={intl} outerColSpan={16} labelColSpan={8} formhoc={form} />
                  <ConsignInfo type="consignee" intl={intl} outerColSpan={16} labelColSpan={8} formhoc={form} />
                  <ModeInfo intl={intl} formhoc={form} />
                  <GoodsInfo intl={intl} labelColSpan={8} formhoc={form} />
                </Col>
                <Col span="8">
                  <CorrelInfo formhoc={form} intl={intl} />
                  <FreightCharge formhoc={form} intl={this.props.intl} />
                </Col>
              </Row>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}
