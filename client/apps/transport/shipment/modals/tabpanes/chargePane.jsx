import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Table } from 'ant-ui';
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
        <Row className="pane-section">
          <Table size="middle" bordered columns={this.columns} pagination={false}
            dataSource={ds}
          />
        </Row>
      </div>
    );
  }
}
