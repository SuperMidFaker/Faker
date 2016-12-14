import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Table } from 'antd';

function getColCls(col) {
  if (col) {
    const { span, offset } = col;
    const spanCls = span ? `col-${span}` : '';
    const offsetCls = offset ? `col-offset-${offset}` : '';
    return `${spanCls} ${offsetCls}`;
  }
  return '';
}
function PaneFormItem(props) {
  const { label, labelCol, field, fieldCol } = props;
  const labelCls = `info-label ${getColCls(labelCol)}`;
  const fieldCls = `info-data ${getColCls(fieldCol)}`;
  return (
    <div className="info-item">
      <label className={labelCls} htmlFor="pane">{label}：</label>
      <div className={fieldCls}>{field}</div>
    </div>
  );
}

PaneFormItem.propTypes = {
  label: PropTypes.string.isRequired,
  labelCol: PropTypes.object,
  fieldCol: PropTypes.object,
};
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
