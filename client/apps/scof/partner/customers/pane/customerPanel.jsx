import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Card, Tabs } from 'antd';
import DockPanel from 'client/components/DockPanel';
import InfoItem from 'client/components/InfoItem';
import { showCustomerPanel, showPartnerModal } from 'common/reducers/partner';
import GeneralPane from './generalPane';
import ServiceTeamPane from './serviceTeamPane';
import LogsPane from './logsPane';
import { formatMsg } from '../message.i18n';

const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    visible: state.partner.customerModal.visiblePanel,
    customer: state.partner.customerModal.customer,
  }),
  { showCustomerPanel, showPartnerModal },
)
export default class CustomerPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customer: PropTypes.shape({ partner_code: PropTypes.string }).isRequired,
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
    return (
      <Row>
        <Col sm={24} lg={4}>
          <InfoItem
            label={this.msg('customerCode')}
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
    return (
      <DockPanel
        label={this.msg('customer')}
        title={customer.name}
        size="large"
        visible={visible}
        onClose={this.handleClose}
        onEdit={this.handleCustomerEdit}
        extra={this.renderExtra()}
      >
        <Card bodyStyle={{ padding: 0 }}>
          <Tabs defaultActiveKey="general">
            <TabPane tab={this.msg('general')} key="general" >
              <GeneralPane customer={customer} />
            </TabPane>
            <TabPane tab={this.msg('serviceTeam')} key="team" >
              <ServiceTeamPane customer={customer} />
            </TabPane>
            <TabPane tab={this.msg('logs')} key="logs" >
              <LogsPane />
            </TabPane>
          </Tabs>
        </Card>
      </DockPanel>);
  }
}
