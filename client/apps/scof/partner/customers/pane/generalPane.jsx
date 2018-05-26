import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, Col, Row } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { formatMsg } from '../message.i18n';

const { Panel } = Collapse;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { },
)
export default class GeneralPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }

  msg = formatMsg(this.props.intl)
  render() {
    const { customer } = this.props;
    return (
      <div className="pane-content tab-pane">
        <Collapse bordered={false} defaultActiveKey={['basicInfo']}>
          <Panel header={this.msg('basicInfo')} key="basicInfo">
            <Row gutter={16} className="info-group-underline">
              <Col span={12}>
                <InfoItem
                  label={this.msg('customerCode')}
                  field={customer.partner_code}
                />
              </Col>
              <Col span={12}>
                <InfoItem
                  label={this.msg('customerName')}
                  field={customer.name}
                />
              </Col>
              <Col span={12}>
                <InfoItem
                  label={this.msg('displayName')}
                  field={customer.display_name}
                />
              </Col>
              <Col span={12}>
                <InfoItem
                  label={this.msg('englishName')}
                  field={customer.en_name}
                />
              </Col>
            </Row>
          </Panel>
          <Panel header={this.msg('sysInfo')} key="sysInfo">
            <Row gutter={16} className="info-group-underline">
              <Col span={12}>
                <InfoItem
                  label={this.msg('createdBy')}
                  field={customer.created_by}
                />
              </Col>
              <Col span={12}>
                <InfoItem
                  label={this.msg('lastUpdatedBy')}
                  field={customer.last_updated_by}
                />
              </Col>
              <Col span={12}>
                <InfoItem
                  label={this.msg('createdDate')}
                  field={customer.created_date}
                />
              </Col>
              <Col span={12}>
                <InfoItem
                  label={this.msg('lastUpdatedDate')}
                  field={customer.last_updated_date}
                />
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </div>
    );
  }
}
