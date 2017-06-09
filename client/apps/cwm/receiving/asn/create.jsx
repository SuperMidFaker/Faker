import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Row, Col, Button, Select, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import HeadForm from './forms/headForm';
import DetailForm from './forms/detailForm';
import SiderForm from './forms/siderForm';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { addASN } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    formData: state.cmsDelegation.formData,
    submitting: state.cmsDelegation.submitting,
    defaultWhse: state.cwmContext.defaultWhse,
    temporaryDetails: state.cwmReceive.temporaryDetails,
    owners: state.cwmContext.whseAttrs.owners,
  }),
  { addASN }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class CreateReceivingASN extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    editable: true,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    const { temporaryDetails, defaultWhse, owners, tenantId, loginId, tenantName } = this.props;
    if (temporaryDetails.length === 0) {
      message.info('明细不能为空');
      return;
    }
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        const data = values;
        const owner = owners.find(item => item.id === values.owner_partner_id);
        data.ownerName = owner.name;
        data.ownerTenantId = owner.partner_tenant_id;
        data.temporaryDetails = temporaryDetails;
        data.whseCode = defaultWhse.code;
        data.tenantId = tenantId;
        data.loginId = loginId;
        data.tenantName = tenantName;
        this.props.addASN(data).then(
          (result) => {
            if (!result.error) {
              this.context.router.push('/cwm/receiving/asn');
            }
          }
        );
      }
    });
  }
  handleSaveBtnClick = () => {
    this.handleSave({ accepted: false });
  }
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }
  handleSaveAccept = () => {
    this.handleSave({ accepted: true });
  }
  handleUploadFiles = (fileList) => {
    this.setState({
      attachments: fileList,
    });
  }
  render() {
    const { form, submitting, defaultWhse } = this.props;
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select
                size="large"
                value={defaultWhse.code}
                style={{ width: 160 }}
                disabled
              >
                <Option value={defaultWhse.code}>{defaultWhse.name}</Option>
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('receivingASN')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('createASN')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
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
            <HeadForm form={form} />
            <Row gutter={16}>
              <Col span={18}>
                <DetailForm editable={this.state.editable} form={form} />
              </Col>
              <Col span={6}>
                <SiderForm form={form} />
              </Col>
            </Row>
          </Form>
        </Content>
      </div>
    );
  }
}
