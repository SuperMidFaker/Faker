import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Tabs } from 'antd';
import DockPanel from 'client/components/DockPanel';
import InfoItem from 'client/components/InfoItem';
import { showCustomerPanel, showPartnerModal } from 'common/reducers/partner';
import { PARTNER_ROLES, SCOF_BIZ_OBJECT_KEY } from 'common/constants';
import MasterPane from './tabpanes/masterPane';
import TeamPane from './tabpanes/teamPane';
import LogsPane from '../common/logsPane';
import { formatMsg } from './message.i18n';

const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    visible: state.partner.customerModal.visiblePanel,
    customer: state.partner.customerModal.customer,
  }),
  { showCustomerPanel, showPartnerModal },
)
export default class PartnerDock extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customer: PropTypes.shape({ partner_code: PropTypes.string }).isRequired,
    partnerType: PropTypes.string.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleCustomerEdit = () => {
    this.props.showPartnerModal('edit', this.props.customer);
  }
  handleClose = () => {
    this.props.showCustomerPanel({ visible: false });
  }
  renderExtra() {
    const { customer } = this.props;
    let label = '';
    if (this.props.partnerType === PARTNER_ROLES.CUS) {
      label = this.msg('customerCode');
    } else if (this.props.partnerType === PARTNER_ROLES.SUP) {
      label = this.msg('supplierCode');
    } else if (this.props.partnerType === PARTNER_ROLES.VEN) {
      label = this.msg('vendorCode');
    }
    return (
      <Row>
        <Col sm={24} lg={4}>
          <InfoItem
            label={label}
            field={customer.partner_code}
          />
        </Col>
        <Col sm={24} lg={8}>
          <InfoItem
            label={this.msg('uscCode')}
            field={customer.partner_unique_code}
          />
        </Col>
        <Col sm={24} lg={8}>
          <InfoItem
            label={this.msg('customsCode')}
            field={customer.customs_code}
          />
        </Col>
        <Col sm={24} lg={4}>
          <InfoItem
            label={this.msg('contact')}
            field={customer.contact}
          />
        </Col>
      </Row>);
  }
  render() {
    const { customer, visible } = this.props;
    let label = '';
    if (this.props.partnerType === PARTNER_ROLES.CUS) {
      label = this.msg('customer');
    } else if (this.props.partnerType === PARTNER_ROLES.SUP) {
      label = this.msg('supplier');
    } else if (this.props.partnerType === PARTNER_ROLES.VEN) {
      label = this.msg('vendor');
    }
    return (
      <DockPanel
        label={label}
        title={customer.name}
        size="large"
        visible={visible}
        onClose={this.handleClose}
        onEdit={this.handleCustomerEdit}
        extra={this.renderExtra()}
      >
        <Tabs defaultActiveKey="masterInfo">
          <TabPane tab={this.msg('masterInfo')} key="masterInfo" >
            <MasterPane customer={customer} partnerType={this.props.partnerType} />
          </TabPane>
          {this.props.partnerType === PARTNER_ROLES.CUS &&
          <TabPane tab={this.msg('serviceTeam')} key="team" >
            <TeamPane customer={customer} />
          </TabPane>}
          <TabPane tab={this.msg('logs')} key="logs" >
            <LogsPane
              billNo={JSON.stringify(customer.id)}
              bizObject={SCOF_BIZ_OBJECT_KEY.SAAS_PARTNER.key}
            />
          </TabPane>
        </Tabs>
      </DockPanel>);
  }
}
