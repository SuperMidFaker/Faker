import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Card, Tabs, Button, Select, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import HeadForm from './forms/headForm';
import DetailForm from './forms/detailForm';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { loadAsn, updateASN, clearTemporary } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    submitting: state.cwmReceive.submitting,
    temporaryDetails: state.cwmReceive.temporaryDetails,
    owners: state.cwmContext.whseAttrs.owners,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { loadAsn, updateASN, clearTemporary }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class ReceivingASNDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    submitting: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    editable: true,
    asnHead: {},
    asnBody: [],
  }
  componentWillMount() {
    this.props.loadAsn(this.props.params.asnNo).then(
      (result) => {
        if (!result.error) {
          this.setState({
            asnHead: result.data.asnHead,
            asnBody: result.data.asnBody,
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
        data.asnNo = this.props.params.asnNo;
        data.ownerName = owner.name;
        data.ownerTenantId = owner.partner_tenant_id;
        data.temporaryDetails = temporaryDetails;
        data.whseCode = defaultWhse.code;
        data.tenantId = tenantId;
        data.loginId = loginId;
        data.tenantName = tenantName;
        this.props.updateASN(data).then(
          (result) => {
            if (!result.error) {
              this.context.router.push('/cwm/receiving/asn');
            }
          }
        );
      }
    });
  }
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
    const { asnHead, asnBody } = this.state;
    return (
      <div>
        <Header className="page-header">
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
              {this.props.params.asnNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            {this.state.editable && <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>}
            {this.state.editable && <Button size="large" type="primary" icon="save" loading={submitting} onClick={this.handleSaveBtnClick}>
              {this.msg('save')}
            </Button>}
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <HeadForm asnHead={asnHead} form={form} editable={this.state.editable} />
            <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="orderDetails" onChange={this.handleTabChange}>
                <TabPane tab="收货明细" key="orderDetails">
                  <DetailForm asnBody={asnBody} detailEnable selectedOwner={asnHead.owner_partner_id} form={form} editable={this.state.editable} />
                </TabPane>
              </Tabs>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
