import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Row, Col, Table, Tabs } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadPaneExp } from 'common/reducers/cmsExpense';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;
const Column = Table.Column;

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
    expenses: PropTypes.shape({
      servbill: PropTypes.arrayOf(PropTypes.shape({ fee_name: PropTypes.string.isRequired })),
      cushbill: PropTypes.arrayOf(PropTypes.shape({ fee_name: PropTypes.string.isRequired })),
      allcost: PropTypes.arrayOf(PropTypes.shape({
        vendor: PropTypes.string.isRequired,
        fees: PropTypes.arrayOf(PropTypes.shape({ fee_name: PropTypes.string.isRequired })),
      })),
    }).isRequired,
    delgNo: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  componentDidMount() {
    this.props.loadPaneExp(this.props.delgNo, this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.delgNo !== this.props.delgNo) {
      nextProps.loadPaneExp(nextProps.delgNo, this.props.tenantId);
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  billColumnFields = {
    service: [{
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
    }, {
      title: this.msg('totalFee'),
      dataIndex: 'total_fee',
      key: 'total_fee',
      width: '16.7%',
    }],
    cushion: [{
      title: this.msg('feeName'),
      dataIndex: 'fee_name',
      key: 'fee_name',
    }, {
      title: this.msg('feeVal'),
      dataIndex: 'cal_fee',
      key: 'cal_fee',
    }, {
      title: this.msg('taxFee'),
      dataIndex: 'tax_fee',
      key: 'tax_fee',
    }, {
      title: this.msg('totalFee'),
      dataIndex: 'total_fee',
      key: 'total_fee',
    }],
  }
  render() {
    const { expenses: { servbill, cushbill, allcost } } = this.props;
    const billServicesFee = [...servbill];
    const totalServFee = billServicesFee.reduce((res, bsf) => ({
      fee_name: '合计',
      cal_fee: res.cal_fee + parseFloat(bsf.cal_fee),
      tax_fee: res.tax_fee + parseFloat(bsf.tax_fee),
      total_fee: res.total_fee + parseFloat(bsf.total_fee),
    }), {
      fee_name: '合计',
      cal_fee: 0,
      tax_fee: 0,
      total_fee: 0,
    });
    totalServFee.cal_fee = totalServFee.cal_fee.toFixed(2);
    totalServFee.tax_fee = totalServFee.tax_fee.toFixed(2);
    totalServFee.total_fee = totalServFee.total_fee.toFixed(2);
    billServicesFee.push(totalServFee);
    const billCushFees = [...cushbill];
    const totalCushFee = billCushFees.reduce((res, bsf) => ({
      cal_fee: res.cal_fee + parseFloat(bsf.cal_fee),
      tax_fee: res.tax_fee + parseFloat(bsf.tax_fee),
      total_fee: res.total_fee + parseFloat(bsf.total_fee),
    }), {
      cal_fee: 0,
      tax_fee: 0,
      total_fee: 0,
    });
    billCushFees.push({
      fee_name: '合计',
      cal_fee: totalCushFee.cal_fee.toFixed(2),
      tax_fee: totalCushFee.tax_fee.toFixed(2),
      total_fee: totalCushFee.total_fee.toFixed(2),
    });
    return (
      <div className="pane-content tab-pane">
        <Tabs defaultActiveKey="revenue" tabPosition="left">
          <TabPane tab={this.msg('revenue')} key="revenue" style={{ padding: 8 }}>
            <Row gutter={16}>
              <Col span={14}>
                <Card title={this.msg('serviceFee')} bodyStyle={{ padding: 8 }}>
                  <Table size="small" columns={this.billColumnFields.service} dataSource={billServicesFee}
                    rowKey="fee_name" pagination={false}
                  />
                </Card>
              </Col>
              <Col span={10}>
                <Card title={this.msg('cushionFee')} bodyStyle={{ padding: 8 }}>
                  <Table size="small" columns={this.billColumnFields.cushion} dataSource={billCushFees}
                    rowKey="fee_name" pagination={false}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab={this.msg('cost')} key="cost" style={{ padding: 8 }}>
            {
              allcost.map((cost) => {
                let titleLabel;
                if (cost.vendor === 'cert') {
                  titleLabel = '鉴定办证';
                } else {
                  titleLabel = `供应商: ${cost.vendor}`;
                }
                const costData = cost.fees;
                const totalCost = costData.reduce((res, cfe) => ({
                  cal_fee: res.cal_fee + parseFloat(cfe.cal_fee),
                  tax_fee: res.tax_fee + parseFloat(cfe.tax_fee),
                  total_fee: res.total_fee + parseFloat(cfe.total_fee),
                }), {
                  cal_fee: 0,
                  tax_fee: 0,
                  total_fee: 0,
                });
                costData.push({
                  fee_name: '合计',
                  cal_fee: totalCost.cal_fee.toFixed(2),
                  tax_fee: totalCost.tax_fee.toFixed(2),
                  total_fee: totalCost.total_fee.toFixed(2),
                });
                return (
                  <Row gutter={16} key={cost.vendor} style={{ marginBottom: 8 }}>
                    <Card title={titleLabel} bodyStyle={{ padding: 8 }}>
                      <Table size="small" dataSource={costData} rowKey="fee_name" pagination={false}>
                        <Column title={this.msg('feeName')} dataIndex="fee_name" />
                        <Column title="费用类型" dataIndex="fee_style" render={(o) => {
                          if (o === 'service') {
                            return '服务费';
                          } else if (o === 'cushion') {
                            return '代垫费';
                          }
                        }}
                        />
                        <Column title={this.msg('charCount')} dataIndex="charge_count" />
                        <Column title={this.msg('unitPrice')} dataIndex="unit_price" />
                        <Column title={this.msg('feeVal')} dataIndex="cal_fee" />
                        <Column title={this.msg('taxFee')} dataIndex="tax_fee" />
                        <Column title="应付金额" dataIndex="total_fee" />
                      </Table>
                    </Card>
                  </Row>);
              })
            }
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
