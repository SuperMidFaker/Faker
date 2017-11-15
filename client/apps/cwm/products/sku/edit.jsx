import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Form, Layout, Row, Col, Button } from 'antd';
import { loadSkuParams, loadSku, saveSku } from 'common/reducers/cwmSku';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
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
  { loadSkuParams, loadSku, saveSku }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class EditProductSku extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillMount() {
    if (this.props.owner.id) {
      this.props.loadSkuParams(this.props.owner.id);
    }
    this.props.loadSku(this.props.params.sku);
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
        const formData = {
          ...this.props.skuForm, ...values, last_updated_by: this.props.loginId,
        };
        this.props.saveSku(formData).then((result) => {
          if (!result.error) {
            this.context.router.push('/cwm/products/sku');
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
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('products')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('productsSku')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.sku}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" icon="save" loading={submitting} onClick={this.handleSaveBtnClick}>
              {this.msg('save')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content layout-fixed-width layout-fixed-width-lg">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col sm={24} md={16}>
                <MainForm form={form} mode="edit" />
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
