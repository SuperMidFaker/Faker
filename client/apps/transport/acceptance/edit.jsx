import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Card, Row, Col, Form, Layout, Button, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadForm, loadFormRequire, onFormFieldsChange } from 'common/reducers/shipment';
import { loadTable, saveEdit } from 'common/reducers/transport-acceptance';
import ClientInfo from '../shipment/forms/clientInfo';
import ConsignInfo from '../shipment/forms/consign-info';
import GoodsInfo from '../shipment/forms/goods-info';
import ModeInfo from '../shipment/forms/mode-info';
import CorrelInfo from '../shipment/forms/correlInfo';
import FreightCharge from '../shipment/forms/freightCharge';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

function fetchData({ state, dispatch, params, cookie }) {
  const promises = [];
  const shipmtNo = params.shipmt;
  promises.push(dispatch(loadForm(cookie, {
    tenantId: state.account.tenantId,
    shipmtNo,
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
    formRequireJudgeParams: state.shipment.formRequireJudgeParams, // @Form.create... 这一层使用
  }),
  { loadTable, saveEdit, onFormFieldsChange })
@connectNav({
  depth: 3,
  text: props => props.formData.shipmt_no,
  moduleName: 'transport',
  until: props => props.formData.shipmt_no,
  lifecycle: 'componentWillReceiveProps',
})
@withPrivilege({ module: 'transport', feature: 'shipment', action: 'edit' })
@Form.create({ onFieldsChange: (props, fields) => props.onFormFieldsChange(props, fields) })
export default class ShipmentEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
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
    this.props.form.validateFields((errors) => {
      if (errors) {
        message.error(this.msg('formError'));
      } else {
        const { formData, tenantId, loginId } = this.props;
        const form = { ...formData, ...this.props.form.getFieldsValue() };
        this.props.saveEdit(form, tenantId, loginId)
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
  handleCancel = () => {
    this.context.router.goBack();
  }
  render() {
    const { intl, submitting, form } = this.props;
    return (
      <div>
        <Header className="top-bar top-bar-fixed">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('transportShipment')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('shipmtEdit')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button size="large" type="primary" loading={submitting} onClick={this.handleEdit}>
              {this.msg('save')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width layout-fixed-width-large top-bar-fixed">
          <Form horizontal>
            <Row gutter={16}>
              <Col sm={24} md={18}>
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
              <Col sm={24} md={6}>
                <Card bodyStyle={{ padding: 16 }}>
                  <CorrelInfo formhoc={form} intl={intl} />
                </Card>
                <FreightCharge formhoc={form} intl={this.props.intl} />
              </Col>
            </Row>
          </Form>
        </Content>
      </div>
    );
  }
}
