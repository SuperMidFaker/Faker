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
export default class CertsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    aspect: PropTypes.number.isRequired,
  }
  render() {
    const columns = [{
      title: '服务商',
      dataIndex: 'fee_name',
      key: 'fee_name',
    }, {
      title: '鉴定办证类型',
      dataIndex: 'charge_count',
      key: 'charge_count',
    }, {
      title: '数量',
      dataIndex: 'charge_count',
      key: 'charge_count',
    }, {
      title: '鉴定办证日期',
      dataIndex: 'charge_count',
      key: 'charge_count',
    }, {
      title: '动检查验',
      dataIndex: 'charge_count',
      key: 'charge_count',
    }, {
      title: '备注',
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
