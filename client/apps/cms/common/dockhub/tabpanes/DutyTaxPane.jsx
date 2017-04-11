import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Table } from 'antd';

@injectIntl
@connect(
  state => ({
    aspect: state.account.aspect,
  })
)
export default class DutyTaxPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    aspect: PropTypes.number.isRequired,
  }
  render() {
    const columns = [{
      title: '报关单号',
      dataIndex: 'fee_name',
      key: 'fee_name',
    }, {
      title: '申报货值',
      dataIndex: 'charge_count',
      key: 'charge_count',
    }, {
      title: '关税',
      dataIndex: 'charge_count',
      key: 'charge_count',
    }, {
      title: '增值税',
      dataIndex: 'charge_count',
      key: 'charge_count',
    }, {
      title: '消费税',
      dataIndex: 'charge_count',
      key: 'charge_count',
    }, {
      title: '其他',
      dataIndex: 'charge_count',
      key: 'charge_count',
    }, {
      title: '税费总金额',
      dataIndex: 'unit_price',
      key: 'unit_price',
    }];
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 8 }}>
          <Table size="small" columns={columns} pagination={false} />
        </Card>
      </div>
    );
  }
}
