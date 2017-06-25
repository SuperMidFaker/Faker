import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, Row, Col, Card } from 'antd';
import { } from 'common/constants';
import InfoItem from 'client/components/InfoItem';
// import Strip from 'client/components/Strip';
// import { MdIcon } from 'client/components/FontIcon';

const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    order: state.crmOrders.dock.order,
  }), { }
)
export default class ASNPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    tabKey: '',
  }

  render() {
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }}>
          <Collapse bordered={false} defaultActiveKey={['trading', 'shipment']}>
            <Panel header="主信息" key="trading">
              <Row>
                <Col span="8">
                  <InfoItem label="运输方式" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="运输方式" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="运输方式" field={''} />
                </Col>
              </Row>
            </Panel>
            <Panel header="运输" key="shipment">
              <Row>
                <Col span="8">
                  <InfoItem label="运输方式" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="运输方式" field={''} />
                </Col>
              </Row>
            </Panel>
          </Collapse>
        </Card>
      </div>
    );
  }
}
