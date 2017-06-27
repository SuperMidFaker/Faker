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
          <Collapse bordered={false} defaultActiveKey={['main', 'asnDetails']}>
            <Panel header="主信息" key="main">
              <Row>
                <Col span="8">
                  <InfoItem label="ASN编号" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="ASN类型" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="货主" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="状态" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="货物属性" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="保税监管方式" field={''} />
                </Col>
                <Col span="6">
                  <InfoItem label="总预期数量" field={''} />
                </Col>
                <Col span="6">
                  <InfoItem label="总收货数量" field={''} />
                </Col>
                <Col span="6">
                  <InfoItem label="预期重量" field={''} />
                </Col>
                <Col span="6">
                  <InfoItem label="预期体积" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="预期到货日期" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="上次收货日期" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="创建日期" field={''} />
                </Col>
              </Row>
            </Panel>
            <Panel header="ASN明细" key="asnDetails" />
          </Collapse>
        </Card>
      </div>
    );
  }
}
