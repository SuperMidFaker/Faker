import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Card, Table } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    charges: state.shipment.previewer.charges,
  })
)
export default class ChargePanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    charges: PropTypes.object.isRequired,
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  columns = [{
    title: this.msg('chargeItem'),
    dataIndex: 'item',
  }, {
    title: this.msg('chargeFee'),
    dataIndex: 'fee',
  }]
  render() {
    const { charges } = this.props;
    const ds = [];
    Object.keys(charges).forEach(chf => {
      if (charges[chf] !== null) {
        ds.push({
          key: chf,
          item: chf === 'earnings' ? this.msg('trackEarnings') : this.msg('trackPay'),
          fee: charges[chf],
        });
      }
    });
    return (
      <div className="pane-content tab-pane">
          <Card bodyStyle={{ padding: 16 }}>
            <Row>
              <Col span="8">
                <h5>营收</h5>

              </Col>
              <Col span="8">
                <h5>成本</h5>
              </Col>
              <Col span="8">
                <h5>利润</h5>
              </Col>
            </Row>
          </Card>
          <Card bodyStyle={{ padding: 0 }}>
            <Table size="small" columns={this.columns} pagination={false}
              dataSource={ds}
            />
          </Card>
      </div>
    );
  }
}
