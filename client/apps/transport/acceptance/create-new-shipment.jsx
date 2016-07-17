import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Button, message, Popconfirm } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { loadFormRequire } from 'common/reducers/shipment';
import { savePending, saveAndAccept, loadTable, saveDraft }
  from 'common/reducers/transport-acceptance';
import ClientInfo from '../shipment/forms/clientInfo';
import ConsignInfo from '../shipment/forms/consign-info';
import GoodsInfo from '../shipment/forms/goods-info';
import ModeInfo from '../shipment/forms/mode-info';
import CorrelInfo from '../shipment/forms/correlInfo';
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
    tenantName: state.corpDomain.name,
    formData: state.shipment.formData,
    submitting: state.transportAcceptance.submitting,
    filters: state.transportAcceptance.table.filters,
    sortField: state.transportAcceptance.table.sortField,
    sortOrder: state.transportAcceptance.table.sortOrder,
    pageSize: state.transportAcceptance.table.shipmentlist.pageSize,
    current: state.transportAcceptance.table.shipmentlist.current,
  }),
  { loadTable, savePending, saveAndAccept, saveDraft })
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: formatMsg(props.intl, 'shipmtCreate'),
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: () => router.goBack(),
  }));
})
@Form.create({
  formPropName: 'formhoc',
})
export default class ShipmentCreate extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    formhoc: PropTypes.object.isRequired,
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
  handleSavePending = (ev) => {
    ev.preventDefault();
    this.props.formhoc.validateFields(errors => {
      if (errors) {
        message.error(this.msg('formError'));
      } else {
        const form = {
          ...this.props.formData,
          ...this.props.formhoc.getFieldsValue(),
        };
        this.props.savePending(form, {
          tid: this.props.tenantId,
          name: this.props.tenantName,
          login_id: this.props.loginId,
          login_name: this.props.loginName,
        }).then(result => {
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
        const form = {
          ...this.props.formData,
          ...this.props.formhoc.getFieldsValue(),
        };
        this.props.saveAndAccept(form, {
          tid: this.props.tenantId,
          name: this.props.tenantName,
          login_id: this.props.loginId,
          login_name: this.props.loginName,
        }).then(result => {
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
      ...this.props.formhoc.getFieldsValue(),
    };
    this.props.saveDraft(form, {
      tid: this.props.tenantId,
      name: this.props.tenantName,
      login_id: this.props.loginId,
      login_name: this.props.loginName,
    }).then(result => {
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
    const { intl, submitting, tenantName, formhoc } = this.props;
    return (
      <div className="main-content">
        <Form form={formhoc} horizontal>
          <div className="page-body">
            <div className="panel-header" />
            <div className="panel-body">
              <Col span="16" className="main-col">
                <ClientInfo outerColSpan={16} intl={intl} formhoc={formhoc} />
                <ConsignInfo type="consigner" intl={intl} outerColSpan={16}
                  labelColSpan={8} formhoc={formhoc}
                />
                <ConsignInfo type="consignee" intl={intl} outerColSpan={16}
                  labelColSpan={8} formhoc={formhoc}
                />
                <ModeInfo intl={intl} formhoc={formhoc} />
                <GoodsInfo intl={intl} labelColSpan={8} formhoc={formhoc} />
              </Col>
              <CorrelInfo formhoc={formhoc} intl={intl} tenantName={tenantName} />
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
