import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Tag, Card, Collapse, Table, Tabs } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadPaneExp } from 'common/reducers/cmsExpense';
import { EXPENSE_CATEGORIES, EXPENSE_TYPES } from 'common/constants';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;
const Column = Table.Column;
const Panel = Collapse.Panel;
const CheckableTag = Tag.CheckableTag;
const SERVER_CATEGORY_MAP = {
  customs_expense: 'customdecl',
  ciq_expense: 'ciqdecl',
  cert_expense: 'cert',
};
const categoryKeys = EXPENSE_CATEGORIES.filter(ec => ec.key !== 'all').map(ec => ec.key);
const typeKeys = EXPENSE_TYPES.map(ec => ec.key);

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
      revenue: PropTypes.arrayOf(PropTypes.shape({ fee_name: PropTypes.string.isRequired })),
      allcost: PropTypes.arrayOf(PropTypes.shape({
        vendor: PropTypes.string.isRequired,
        fees: PropTypes.arrayOf(PropTypes.shape({ fee_name: PropTypes.string.isRequired })),
      })),
    }).isRequired,
    delgNo: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    tabKey: 'revenue',
    checkedExpCates: categoryKeys,
    checkedExpTypes: typeKeys,
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
  columnFields = [{
    title: this.msg('feeName'),
    dataIndex: 'fee_name',
    key: 'fee_name',
  }, {
    title: this.msg('feeRemark'),
    dataIndex: 'remark',
    key: 'remark',
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
  }]
  handleTabChange = (key) => {
    this.setState({
      tabKey: key,
      checkedExpCates: categoryKeys,
      checkedExpTypes: typeKeys,
    });
  }
  handleCateTagChange = (tag, checked) => {
    if (checked) {
      if (tag === 'all') {
        this.setState({
          checkedExpCates: categoryKeys,
          checkedExpTypes: typeKeys,
        });
      } else {
        this.setState({
          checkedExpCates: [...this.state.checkedExpCates, tag],
        });
      }
    } else {
      this.setState({
        checkedExpCates: this.state.checkedExpCates.filter(ec => ec !== tag),
      });
    }
  }
  handleTypeTagChange = (tag, checked) => {
    if (checked) {
      this.setState({
        checkedExpTypes: [...this.state.checkedExpTypes, tag],
      });
    } else {
      this.setState({
        checkedExpTypes: this.state.checkedExpTypes.filter(ec => ec !== tag),
      });
    }
  }
  renderFeeName = (text, row) => {
    if (row.key === 'vendor') {
      return {
        children: text,
        props: {
          colSpan: 5,
        },
      };
    } else {
      return text;
    }
  }
  render() {
    const { expenses: { revenue, allcost } } = this.props;
    const { tabKey, checkedExpCates, checkedExpTypes } = this.state;
    let revenueFees = [];
    let costFees = [];
    if (tabKey === 'revenue') {
      revenueFees = revenue.filter(rev =>
          checkedExpCates.indexOf(rev.fee_style) !== -1
        && checkedExpCates.indexOf(SERVER_CATEGORY_MAP[rev.category]) !== -1);
      const totalFee = revenueFees.reduce((res, bsf) => ({
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
      totalFee.cal_fee = totalFee.cal_fee.toFixed(2);
      totalFee.tax_fee = totalFee.tax_fee.toFixed(2);
      totalFee.total_fee = totalFee.total_fee.toFixed(2);
      revenueFees.push(totalFee);
    } else {
      costFees = allcost.reduce((res, cost) =>
        res.concat({ key: 'vendor', fee_name: cost.vendor }).concat(cost.fees.filter(ct =>
          checkedExpCates.indexOf(ct.fee_style) !== -1
        && checkedExpCates.indexOf(SERVER_CATEGORY_MAP[ct.category]) !== -1)), []);
        /*
      if (allcost.length === 1) {
        costFees = costFees.filter(cd => cd.key !== 'vendor');
      } */
      const totalCost = costFees.filter(cf => cf.key !== 'vendor').reduce((res, cfe) => ({
        cal_fee: res.cal_fee + parseFloat(cfe.cal_fee),
        tax_fee: res.tax_fee + parseFloat(cfe.tax_fee),
        total_fee: res.total_fee + parseFloat(cfe.total_fee),
      }), {
        cal_fee: 0,
        tax_fee: 0,
        total_fee: 0,
      });
      costFees.push({
        fee_name: '合计',
        cal_fee: totalCost.cal_fee.toFixed(2),
        tax_fee: totalCost.tax_fee.toFixed(2),
        total_fee: totalCost.total_fee.toFixed(2),
      });
    }
    const checkedTags = EXPENSE_CATEGORIES.map((ec) => {
      let checked = false;
      if (ec.key === 'all') {
        checked = checkedExpCates.length + checkedExpTypes.length + 1 === EXPENSE_TYPES.length + EXPENSE_CATEGORIES.length;
      } else {
        checked = checkedExpCates.indexOf(ec.key) !== -1;
      }
      const tagProps = {};
      if (checked) {
        tagProps.style = { backgroundColor: ec.color };
      }
      return (
        <CheckableTag key={ec.key} checked={checked} {...tagProps}
          onChange={chked => this.handleCateTagChange(ec.key, chked)}
        >{ec.text}</CheckableTag>);
    }).concat(
      EXPENSE_TYPES.map(et => (
        <CheckableTag key={et.key} checked={checkedExpTypes.indexOf(et.key) !== -1}
          onChange={chked => this.handleTypeTagChange(et.key, chked)}
        >{et.text}</CheckableTag>))
    );
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 8 }}>
          <Tabs activeKey={tabKey} onChange={this.handleTabChange}>
            <TabPane tab={this.msg('revenueDetail')} key="revenue">
              {checkedTags}
              <Table size="middle" columns={this.columnFields} dataSource={revenueFees}
                rowKey="fee_name" pagination={false}
              />
            </TabPane>
            <TabPane tab={this.msg('costDetail')} key="cost">
              {checkedTags}
              <Table size="middle" dataSource={costFees} rowKey="fee_name" pagination={false}>
                <Column title={this.msg('feeName')} dataIndex="fee_name" render={this.renderFeeName} />
                <Column title={this.msg('feeRemark')} dataIndex="remark" />
                <Column title={this.msg('feeVal')} dataIndex="cal_fee" />
                <Column title={this.msg('taxFee')} dataIndex="tax_fee" />
                <Column title={this.msg('totalFee')} dataIndex="total_fee" />
              </Table>
            </TabPane>
          </Tabs>
          <hr />
          <Collapse bordered={false}>
            <Panel header="计费参数" key="params">
              <Table size="middle" pagination={false}>
                <Column
                  title="运单数量"
                  dataIndex="shipmtQty"
                  key="shipmtQty"
                />
                <Column
                  title="报关单数量"
                  dataIndex="shipmtQty"
                  key="shipmtQty"
                />
                <Column
                  title="报关单联数"
                  dataIndex="shipmtQty"
                  key="shipmtQty"
                />
                <Column
                  title="品名数量"
                  dataIndex="shipmtQty"
                  key="shipmtQty"
                />
                <Column
                  title="料件数量"
                  dataIndex="shipmtQty"
                  key="shipmtQty"
                />
                <Column
                  title="货值"
                  dataIndex="shipmtQty"
                  key="shipmtQty"
                />
                <Column
                  title="办证数量"
                  dataIndex="shipmtQty"
                  key="shipmtQty"
                />
              </Table>
            </Panel>
          </Collapse>
        </Card>
      </div>
    );
  }
}
