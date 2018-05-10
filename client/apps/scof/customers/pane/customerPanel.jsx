import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Avatar, Button, Icon, Row, Col, Card, Tabs } from 'antd';
import DockPanel from 'client/components/DockPanel';
import InfoItem from 'client/components/InfoItem';
import { showCustomerPanel, showVendorModal } from 'common/reducers/partner';
import ServiceTeamPane from './serviceTeamPane';
import { formatMsg } from '../message.i18n';

const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    visible: state.partner.customerModal.visiblePanel,
    customer: state.partner.customerModal.customer,
  }),
  { showCustomerPanel, showVendorModal },
)
export default class CustomerPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customer: PropTypes.shape({ partner_code: PropTypes.string }).isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleCustomerEdit = () => {
    this.props.showVendorModal('edit', this.props.customer);
  }
  handleClose = () => {
    this.props.showCustomerPanel({ visible: false });
  }
  render() {
    const { customer, visible } = this.props;
    return (
      <DockPanel title={`${this.msg('customers')}${this.msg('profile')}`} size="large" visible={visible} onClose={this.handleClose}>
        <Card >
          <Avatar shape="square" icon="global" />
          <h2 style={{ display: 'inline-block', marginLeft: 8 }}>{customer.name}</h2>
          <div className="pull-right">
            <Button onClick={this.handleCustomerEdit}><Icon type="edit" /></Button>
          </div>
          <Row gutter={16} className="info-group-underline">
            <Col sm={24} lg={8}>
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
            <Col sm={24} lg={8}>
              <InfoItem
                label={this.msg('contact')}
                field={customer.contact}
              />
            </Col>
            <Col sm={24} lg={8}>
              <InfoItem
                label={this.msg('phone')}
                field={customer.phone}
              />
            </Col>
            <Col sm={24} lg={8}>
              <InfoItem
                label={this.msg('email')}
                field={customer.email}
              />
            </Col>
          </Row>
        </Card>
        <Card bodyStyle={{ padding: 0 }}>
          <Tabs defaultActiveKey="team">
            <TabPane tab={<span>{this.msg('serviceTeam')}</span>} key="team" >
              <ServiceTeamPane customer={customer} />
            </TabPane>
          </Tabs>
        </Card>
      </DockPanel>);
  }
}
