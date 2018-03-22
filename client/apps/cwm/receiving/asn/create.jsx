import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Layout, Tabs, Button, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import { format } from 'client/common/i18n/helpers';
import { addASN, clearTemporary } from 'common/reducers/cwmReceive';
import HeadCard from './card/headCard';
import WhseSelect from '../../common/whseSelect';
import DetailsPane from './tabpane/detailsPane';
import LottingPane from './tabpane/lottingPane';
import messages from '../message.i18n';


const formatMsg = format(messages);
const { Content } = Layout;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    submitting: state.cwmReceive.submitting,
    defaultWhse: state.cwmContext.defaultWhse,
    temporaryDetails: state.cwmReceive.temporaryDetails,
    owners: state.cwmContext.whseAttrs.owners,
    suppliers: state.cwmReceive.suppliers,
  }),
  { addASN, clearTemporary }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class CreateReceivingASN extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    tenantName: PropTypes.string.isRequired,
    submitting: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    editable: true,
    detailEnable: false,
    selectedOwner: null,
  }
  componentWillUnmount() {
    this.props.clearTemporary();
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    const {
      temporaryDetails, defaultWhse, owners, loginId, tenantName, suppliers,
    } = this.props;
    if (temporaryDetails.length === 0) {
      message.info('明细不能为空');
      return;
    }
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        const data = values;
        const owner = owners.find(item => item.id === values.owner_partner_id);
        const supplier = suppliers.find(sl => sl.name === values.supplier_name);
        data.ownerName = owner.name;
        data.ownerTenantId = owner.partner_tenant_id;
        data.temporaryDetails = temporaryDetails;
        data.whseCode = defaultWhse.code;
        data.whseName = defaultWhse.name;
        data.loginId = loginId;
        data.tenantName = tenantName;
        data.supplier_code = supplier && supplier.code;
        this.props.addASN(data).then((result) => {
          if (!result.error) {
            message.success('收货通知已创建成功');
            this.context.router.push('/cwm/receiving/asn');
          } else {
            message.error('操作失败');
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }
  handleOwnerChange = (bool, partnerId) => {
    this.setState({
      detailEnable: bool,
      selectedOwner: partnerId,
    });
  }
  render() {
    const {
      form, submitting, temporaryDetails,
    } = this.props;
    const disable = !(this.state.detailEnable && temporaryDetails.length !== 0);
    return (
      <div>
        <PageHeader
          breadcrumb={[
            <WhseSelect disabled />,
            this.msg('receivingASN'),
            this.msg('createASN'),
          ]}
        >
          <PageHeader.Actions>
            <Button type="ghost" onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" disabled={disable} icon="save" loading={submitting} onClick={this.handleSave}>
              {this.msg('save')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Form layout="vertical">
            <HeadCard form={form} handleOwnerChange={this.handleOwnerChange} />
            <MagicCard bodyStyle={{ padding: 0 }} >
              <Tabs defaultActiveKey="asnDetails" onChange={this.handleTabChange}>
                <TabPane tab="ASN明细" key="asnDetails">
                  <DetailsPane
                    editable={this.state.editable}
                    form={form}
                    detailEnable={this.state.detailEnable}
                    selectedOwner={this.state.selectedOwner}

                  />
                </TabPane>
                <TabPane tab="批次属性" key="lottingProps">
                  <LottingPane editable={this.state.editable} form={form} />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Form>
        </Content>
      </div>
    );
  }
}
