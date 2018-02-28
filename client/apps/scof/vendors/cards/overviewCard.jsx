import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Avatar, Button, Card, Icon, Row, Col } from 'antd';
import { format } from 'client/common/i18n/helpers';
import InfoItem from 'client/components/InfoItem';
import { showVendorModal } from 'common/reducers/sofVendors';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  () => ({}),
  { showVendorModal },
)
export default class OverviewCard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    vendor: PropTypes.shape({ partner_code: PropTypes.string }).isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { vendor } = this.props;
    return (
      <Card >
        <Avatar shape="square" icon="global" />
        <h2 style={{ display: 'inline-block', marginLeft: 8 }}>{vendor.name}</h2>
        <div className="pull-right">
          <Button onClick={() => this.props.showVendorModal('edit', vendor)}><Icon type="edit" /></Button>
        </div>
        <Row gutter={16} className="info-group-underline">
          <Col sm={24} lg={8}>
            <InfoItem
              label="服务商代码"
              field={vendor.partner_code}
            />
          </Col>
          <Col sm={24} lg={8}>
            <InfoItem
              label="统一社会信用代码"
              field={vendor.partner_unique_code}
            />
          </Col>
          <Col sm={24} lg={8}>
            <InfoItem
              label="海关编码"
              field={vendor.customs_code}
            />
          </Col>
          <Col sm={24} lg={8}>
            <InfoItem
              label="联系人"
              field={vendor.contact}
            />
          </Col>
          <Col sm={24} lg={8}>
            <InfoItem
              label="电话"
              field={vendor.phone}
            />
          </Col>
          <Col sm={24} lg={8}>
            <InfoItem
              label="邮箱"
              field={vendor.email}
            />
          </Col>
        </Row>
      </Card>
    );
  }
}
