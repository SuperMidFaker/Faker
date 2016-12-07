import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Table } from 'antd';
import { loadPanelCert } from 'common/reducers/cmsExpense';

@injectIntl
@connect(
  state => ({
    certPanel: state.cmsExpense.certPanel,
    delgNo: state.cmsDelegation.previewer.delgNo,
    tenantId: state.account.tenantId,
  }),
  { loadPanelCert }
)
export default class CertsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    delgNo: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    certPanel: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.props.loadPanelCert(this.props.delgNo, this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.delgNo !== this.props.delgNo) {
      nextProps.loadPanelCert(nextProps.delgNo, this.props.tenantId);
    }
  }
  render() {
    const { certPanel } = this.props;
    const columns = [{
      title: '服务商',
      dataIndex: 'broker',
      key: 'broker',
      width: '25%',
    }, {
      title: '鉴定办证费用项',
      dataIndex: 'fee_name',
      key: 'fee_name',
      width: '25%',
    }, {
      title: '数量',
      dataIndex: 'charge_count',
      key: 'charge_count',
      width: '15%',
    }, {
      title: '金额',
      dataIndex: 'total_fee',
      key: 'total_fee',
      width: '15%',
      render: (o) => {
        if (!isNaN(o)) {
          return (<span>{o.toFixed(2)}</span>);
        }
      }
    }, {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: '20%',
    }];
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 8 }}>
          <Table size="small" columns={columns} dataSource={certPanel.fees} pagination={false} />
        </Card>
      </div>
    );
  }
}
