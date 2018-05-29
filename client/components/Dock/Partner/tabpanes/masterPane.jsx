import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Card, Collapse } from 'antd';
import DescriptionList from 'client/components/DescriptionList';
import { formatMsg } from '../message.i18n';

const { Panel } = Collapse;
const { Description } = DescriptionList;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { },
)
export default class CustomerMasterPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }

  msg = formatMsg(this.props.intl)
  render() {
    const { customer } = this.props;
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }}>
          <Collapse bordered={false} defaultActiveKey={['basicInfo']}>
            <Panel header={this.msg('basicInfo')} key="basicInfo">
              <DescriptionList col={2}>
                <Description term={this.msg('customerCode')}>{customer.partner_code}</Description>
                <Description term={this.msg('customerName')}>{customer.name}</Description>
                <Description term={this.msg('displayName')}>{customer.display_name}</Description>
                <Description term={this.msg('englishName')}>{customer.en_name}</Description>
              </DescriptionList>
            </Panel>
            <Panel header={this.msg('sysInfo')} key="sysInfo">
              <DescriptionList col={2}>
                <Description term={this.msg('createdBy')}>{customer.created_by}</Description>
                <Description term={this.msg('lastUpdatedBy')}>{customer.last_updated_by}</Description>
                <Description term={this.msg('createdDate')}>{customer.created_date && moment(customer.created_date).format('YYYY.MM.DD HH:mm')}</Description>
                <Description term={this.msg('lastUpdatedDate')}>{customer.last_updated_date && moment(customer.last_updated_date).format('YYYY.MM.DD HH:mm')}</Description>
              </DescriptionList>
            </Panel>
          </Collapse>
        </Card>
      </div>
    );
  }
}
