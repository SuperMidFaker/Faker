import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Row, Col, Table, Tabs } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadPaneExp } from 'common/reducers/cmsExpense';
const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    expenses: state.cmsExpense.expenses,
    delgNo: state.cmsDelegation.previewer.delgNo,
    tenantId: state.account.tenantId,
  }),
  { loadPaneExp }
)
export default class ExpensePane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    expenses: PropTypes.object.isRequired,
    delgNo: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  componentWillMount() {
    this.props.loadPaneExp(this.props.delgNo, this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.delgNo !== this.props.delgNo) {
      nextProps.loadPaneExp(nextProps.delgNo, this.props.tenantId);
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { expenses } = this.props;
    const columns = [{
      title: this.msg('feeName'),
      dataIndex: 'fee_name',
      key: 'fee_name',
      width: '16.7%',
    }, {
      title: this.msg('charCount'),
      dataIndex: 'charge_count',
      key: 'charge_count',
      width: '16.7%',
    }, {
      title: this.msg('unitPrice'),
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: '16.7%',
    }, {
      title: this.msg('feeVal'),
      dataIndex: 'cal_fee',
      key: 'cal_fee',
      width: '16.7%',
    }, {
      title: this.msg('taxFee'),
      dataIndex: 'tax_fee',
      key: 'tax_fee',
      width: '16.7%',
      render: (o) => {
        if (o) {
          return o.toFixed(2);
        }
      },
    }, {
      title: this.msg('totalFee'),
      dataIndex: 'total_fee',
      key: 'total_fee',
      width: '16.7%',
      render: (o) => {
        if (o) {
          return o.toFixed(2);
        }
      },
    }];
    const cushColumns = [{
      title: this.msg('feeName'),
      dataIndex: 'fee_name',
      key: 'fee_name',
      width: '40%',
    }, {
      title: this.msg('totalFee'),
      dataIndex: 'total_fee',
      key: 'total_fee',
      width: '60%',
    }];

    return (
      <div className="pane-content tab-pane">
        <Tabs defaultActiveKey="revenue" tabPosition="left">
          <TabPane tab={this.msg('revenue')} key="revenue" style={{ padding: 8 }}>
            <Row gutter={16}>
              <Col span={14}>
                <Card title={this.msg('serviceFee')} bodyStyle={{ padding: 8 }}>
                  <Table size="small" columns={columns} dataSource={expenses.servbill} rowKey="id" pagination={false} />
                </Card>
              </Col>
              <Col span={10}>
                <Card title={this.msg('cushionFee')} bodyStyle={{ padding: 8 }}>
                  <Table size="small" columns={cushColumns} dataSource={expenses.cushbill} rowKey="id" pagination={false} />
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab={this.msg('cost')} key="cost" style={{ padding: 8 }}>
            <Row gutter={16}>
              <Col span={14}>
                <Card title={this.msg('serviceFee')} bodyStyle={{ padding: 8 }}>
                  <Table size="small" columns={columns} dataSource={expenses.servcost} rowKey="id" pagination={false} />
                </Card>
              </Col>
              <Col span={10}>
                <Card title={this.msg('cushionFee')} bodyStyle={{ padding: 8 }}>
                  <Table size="small" columns={cushColumns} dataSource={expenses.cushcost} rowKey="id" pagination={false} />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
