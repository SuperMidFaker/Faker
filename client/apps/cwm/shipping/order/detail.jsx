import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Row, Col, Button, Select, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import HeadForm from './forms/headForm';
import DetailForm from './forms/detailForm';
import SiderForm from './forms/siderForm';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { clearTemporary } from 'common/reducers/cwmReceive';
import { getSo, updateSo } from 'common/reducers/cwmShippingOrder';

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
    temporaryDetails: state.cwmReceive.temporaryDetails,
    owners: state.cwmContext.whseAttrs.owners,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { getSo, updateSo, clearTemporary }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class CreateShippingOrder extends Component {
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
    soHead: {},
    soBody: [],
  }
  componentWillMount() {
    this.props.getSo(this.props.params.soNo).then(
      (result) => {
        if (!result.error) {
          this.setState({
            soHead: result.data.soHead,
            soBody: result.data.soBody,
          });
        }
      }
    );
  }
  componentWillUnmount() {
    this.props.clearTemporary();
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSaveBtnClick = () => {
    const { temporaryDetails, defaultWhse, owners, tenantId, loginId, tenantName } = this.props;
    if (temporaryDetails.length === 0) {
      message.info('明细不能为空');
      return;
    }
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        const data = values;
        const owner = owners.find(item => item.id === values.owner_partner_id);
        data.soNo = this.props.params.soNo;
        data.ownerName = owner.name;
        data.ownerTenantId = owner.partner_tenant_id;
        data.temporaryDetails = temporaryDetails;
        data.whseCode = defaultWhse.code;
        data.tenantId = tenantId;
        data.loginId = loginId;
        data.tenantName = tenantName;
        this.props.updateSo(data).then(
          (result) => {
            if (!result.error) {
              this.context.router.push('/cwm/shipping/order');
            }
          }
        );
      }
    });
  };
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }
  handleUploadFiles = (fileList) => {
    this.setState({
      attachments: fileList,
    });
  }

  render() {
    const { form, submitting, defaultWhse } = this.props;
    const { soHead, soBody } = this.state;
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
              {this.msg('shippingOrder')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('createSO')}
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
            <HeadForm soHead={soHead} form={form} editable={this.state.editable} />
            <Row gutter={16}>
              <Col span={18}>
                <DetailForm soBody={soBody} detailEnable selectedOwner={soHead.owner_partner_id} form={form} editable={this.state.editable} />
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
