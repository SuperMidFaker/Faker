import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Form, Layout, Row, Col, Button, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { loadSkuParams, cleanSkuForm, createSku } from 'common/reducers/cwmSku';
import MainForm from './forms/mainForm';
import SiderForm from './forms/siderForm';
import { formatMsg } from '../message.i18n';

const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    owner: state.cwmSku.owner,
    skuForm: state.cwmSku.skuForm,
    submitting: state.cwmSku.skuSubmitting,
  }),
  { loadSkuParams, cleanSkuForm, createSku }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class CreateProductSku extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  componentWillMount() {
    this.props.cleanSkuForm();
    if (this.props.owner.id) {
      this.props.loadSkuParams(this.props.owner.id);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.owner.id !== this.props.owner.id) {
      nextProps.loadSkuParams(nextProps.owner.id);
    }
  }
  msg = formatMsg(this.props.intl)
  handleSaveBtnClick = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        const owner = this.props.owner;
        const formData = {
          ...values,
          ...this.props.skuForm,
          owner_partner_id: owner.id,
          owner_name: owner.name,
          owner_tenant_id: owner.partner_tenant_id,
          wh_ent_tenant_id: this.props.tenantId,
          created_by: this.props.loginId,
        };
        this.props.createSku(formData).then((result) => {
          if (!result.error) {
            this.context.router.push('/cwm/products/sku');
          } else {
            message.error(result.error.message);
          }
        });
      }
    });
  }
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }

  render() {
    const { form, submitting } = this.props;
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('products')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('productsSku')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('createProductSku')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button size="large" type="primary" icon="save" loading={submitting} onClick={this.handleSaveBtnClick}>
              {this.msg('save')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width layout-fixed-width-lg">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col sm={24} md={16}>
                <MainForm form={form} mode="create" />
              </Col>
              <Col sm={24} md={8}>
                <SiderForm form={form} />
              </Col>
            </Row>
          </Form>
        </Content>
      </div>
    );
  }
}
