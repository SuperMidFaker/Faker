import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Row, Col, Button, Card } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import { createDelegationByCCB } from 'common/reducers/cmsDelegation';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
import HeadForm from './forms/headForm';
import SetImportRules from './cards/setImportRules';
import { loadCmsParams } from 'common/reducers/cmsManifest';

const formatMsg = format(messages);
const { Header, Content } = Layout;

function fetchData({ dispatch, state }) {
  return dispatch(loadCmsParams({
    ieType: state.cmsSettings.template.ieType,
    tenantId: state.account.tenantId,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    template: state.cmsSettings.template,
    ietype: state.cmsSettings.template.ietype,
    templateName: state.cmsSettings.billTemplateModal.templateName,
    billHead: state.cmsSettings.billHead,
    formData: state.cmsDelegation.formData,
  }),
  { createDelegationByCCB }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class CreateTemplate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    createDelegationByCCB: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    attachments: [],
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
      }
    });
  }
  handleSaveBtnClick = () => {
    this.handleSave({ accepted: false });
  }
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }

  render() {
    const { form, ietype, templateName, billHead } = this.props;
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('billTemplates')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {`${templateName}`}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button size="large" type="primary" icon="save" onClick={this.handleSaveBtnClick}>
              {this.msg('save')}
            </Button>
          </div>
        </Header>
        <Content className={'main-content layout-min-width layout-min-width-large'}>
          <HeadForm ietype={ietype} form={form} formData={billHead} />
          <Form vertical>
            <Row gutter={24}>
              <Col sm={24} md={12}>
                <SetImportRules form={form} />
              </Col>
              <Col sm={24} md={12}>
                <Card />
              </Col>
            </Row>
          </Form>
        </Content>
      </div>
    );
  }
}
