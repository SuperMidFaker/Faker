import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Layout, Row, Col, Button, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import { loadSkuParams, cleanSkuForm, createSku } from 'common/reducers/cwmSku';
import MainForm from './forms/mainForm';
import SiderForm from './forms/siderForm';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
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
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
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
  handleSave = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        const { owner } = this.props;
        const formData = {
          ...values,
          ...this.props.skuForm,
          owner_partner_id: owner.id,
          owner_name: owner.name,
          owner_tenant_id: owner.partner_tenant_id,
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
  handleCancel = () => {
    this.context.router.goBack();
  }

  render() {
    const { form, submitting } = this.props;
    return (
      <div>
        <PageHeader
          breadcrumb={[
            this.msg('products'),
            this.msg('productsSku'),
            this.msg('createSKU'),
          ]}
        >
          <PageHeader.Actions>
            <Button type="ghost" onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" icon="save" loading={submitting} onClick={this.handleSave}>
              {this.msg('save')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content layout-fixed-width layout-fixed-width-lg">
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
