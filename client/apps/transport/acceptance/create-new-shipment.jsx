import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Card, Row, Col, Form, Button, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadFormRequire } from 'common/reducers/shipment';
import { savePending, saveAndAccept, loadTable, saveDraft }
  from 'common/reducers/transport-acceptance';
import ClientInfo from '../shipment/forms/clientInfo';
import ConsignInfo from '../shipment/forms/consign-info';
import GoodsInfo from '../shipment/forms/goods-info';
import ModeInfo from '../shipment/forms/mode-info';
import CorrelInfo from '../shipment/forms/correlInfo';
import FreightCharge from '../shipment/forms/freightCharge';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
const formatGlobalMsg = format(globalMessages);
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
    tenantName: state.account.tenantName,
    formData: state.shipment.formData,
    submitting: state.transportAcceptance.submitting,
    filters: state.transportAcceptance.table.filters,
    sortField: state.transportAcceptance.table.sortField,
    sortOrder: state.transportAcceptance.table.sortOrder,
    pageSize: state.transportAcceptance.table.shipmentlist.pageSize,
    current: state.transportAcceptance.table.shipmentlist.current,
  }),
  { loadTable, savePending, saveAndAccept, saveDraft })
@connectNav({
  depth: 3,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'shipment', action: 'create' })
@Form.create()
export default class ShipmentCreate extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
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
    router: PropTypes.object.isRequired,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }
  handleSavePending = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((errors) => {
      if (errors) {
        message.error(this.msg('formError'));
      } else {
        const form = {
          ...this.props.formData,
          ...this.props.form.getFieldsValue(),
        };
        this.props.savePending(form, {
          tid: this.props.tenantId,
          name: this.props.tenantName,
          login_id: this.props.loginId,
          login_name: this.props.loginName,
        }).then((result) => {
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
    this.props.form.validateFields((errors) => {
      if (errors) {
        message.error(this.msg('formError'));
      } else {
        const form = {
          ...this.props.formData,
          ...this.props.form.getFieldsValue(),
        };
        this.props.saveAndAccept(form, {
          tid: this.props.tenantId,
          name: this.props.tenantName,
          login_id: this.props.loginId,
          login_name: this.props.loginName,
        }).then((result) => {
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
    const form = {
      ...this.props.formData,
      ...this.props.form.getFieldsValue(),
    };
    this.props.saveDraft(form, {
      tid: this.props.tenantId,
      name: this.props.tenantName,
      login_id: this.props.loginId,
      login_name: this.props.loginName,
    }).then((result) => {
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
    const { intl, submitting, form } = this.props;
    return (
      <div>
        <header className="top-bar">
          <span>{this.msg('shipmtCreate')}</span>
        </header>
        <div className="top-bar-tools">
          <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
            {this.msg('cancel')}
          </Button>
          <Button size="large" type="primary" loading={submitting} onClick={this.handleSavePending}>
            {formatGlobalMsg(intl, 'save')}
          </Button>
        </div>
        <div className="main-content">
          <Form horizontal>
            <div className="page-body card-wrapper">
              <Row gutter={16}>
                <Col span="16">
                  <Card bodyStyle={{ padding: 16 }}>
                    <ClientInfo outerColSpan={16} intl={intl} formhoc={form} />
                  </Card>
                  <Card bodyStyle={{ padding: 16 }}>
                    <ConsignInfo type="consigner" intl={intl} outerColSpan={16}
                      labelColSpan={8} formhoc={form}
                    />
                  </Card>
                  <Card bodyStyle={{ padding: 16 }}>
                    <ConsignInfo type="consignee" intl={intl} outerColSpan={16}
                      labelColSpan={8} formhoc={form}
                    />
                  </Card>
                  <Card bodyStyle={{ padding: 16 }}>
                    <ModeInfo intl={intl} formhoc={form} />
                  </Card>
                  <Card bodyStyle={{ padding: 16 }}>
                    <GoodsInfo intl={intl} labelColSpan={8} formhoc={form} />
                  </Card>
                </Col>
                <Col span="8">
                  <Card bodyStyle={{ padding: 16 }}>
                    <CorrelInfo formhoc={form} intl={intl} />
                  </Card>
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
