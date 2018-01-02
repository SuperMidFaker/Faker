import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Spin, Card, Collapse, Table, Tag } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadPaneExp } from 'common/reducers/cmsExpense';
import { EXPENSE_CATEGORIES, CMS_EXPENSE_TYPES } from 'common/constants';

const formatMsg = format(messages);
const Column = Table.Column;
const Panel = Collapse.Panel;
const CheckableTag = Tag.CheckableTag;
const SERVER_CATEGORY_MAP = {
  misc_expenses: 'customdecl',
  customs_expenses: 'customdecl',
  ciq_expenses: 'ciqdecl',
  certs_expenses: 'cert',
};
const categoryKeys = EXPENSE_CATEGORIES.filter(ec => ec.key !== 'all').map(ec => ec.key);
const typeKeys = CMS_EXPENSE_TYPES.map(ec => ec.key);

@injectIntl
@connect(
  state => ({
    expensesLoading: state.cmsExpense.expensesLoading,
    expenses: state.cmsExpense.expenses,
    delgNo: state.cmsDelegationDock.previewer.delegation.delg_no,
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
      parameters: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
      })),
    }).isRequired,
    delgNo: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
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
    render: (text, row) => {
      const categ = EXPENSE_CATEGORIES.filter(ec => ec.key === row.fee_style)[0];
      return <span>{text}{categ && <span className="ant-badge-status-dot" style={{ backgroundColor: categ.color }} />}</span>;
    },
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
  renderCostFeeName = (text, row) => {
    if (row.key === 'vendor') {
      return {
        children: text,
        props: {
          colSpan: 5,
        },
      };
    }
    const categ = EXPENSE_CATEGORIES.filter(ec => ec.key === row.fee_style)[0];
    return <span>{text}{categ && <span className="ant-badge-status-dot" style={{ backgroundColor: categ.color }} />}</span>;
  }
  renderCostFeeColumn = (text, row) => {
    const col = { children: text, props: { } };
    if (row.key === 'vendor') {
      col.props.colSpan = 0;
    }
    return col;
  }
  render() {
    const { expenses: { revenue, allcost, parameters }, expensesLoading } = this.props;
    const { checkedExpCates, checkedExpTypes } = this.state;
    const revenueFees = revenue.filter(rev =>
      checkedExpCates.indexOf(rev.fee_style) !== -1
      && checkedExpTypes.indexOf(SERVER_CATEGORY_MAP[rev.category]) !== -1);
    if (revenueFees.length > 0) {
      const totalFee = revenueFees.reduce((res, bsf) => ({
        cal_fee: res.cal_fee + parseFloat(bsf.cal_fee),
        tax_fee: res.tax_fee + parseFloat(bsf.tax_fee),
        total_fee: res.total_fee + parseFloat(bsf.total_fee),
      }), {
        cal_fee: 0,
        tax_fee: 0,
        total_fee: 0,
      });
      revenueFees.push({
        fee_name: '合计',
        cal_fee: totalFee.cal_fee.toFixed(2),
        tax_fee: totalFee.tax_fee.toFixed(2),
        total_fee: totalFee.total_fee.toFixed(2),
      });
    }
    let costFees = allcost.reduce((res, cost) =>
      res.concat({ key: 'vendor', fee_name: cost.vendor }).concat(cost.fees.filter(ct =>
        checkedExpCates.indexOf(ct.fee_style) !== -1
          && checkedExpTypes.indexOf(SERVER_CATEGORY_MAP[ct.category]) !== -1)), []);
    /*
      if (allcost.length === 1) {
        costFees = costFees.filter(cd => cd.key !== 'vendor');
      } */
    if (costFees.filter(cf => cf.key !== 'vendor').length > 0) {
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
    } else {
      costFees = [];
    }
    const checkedTags = EXPENSE_CATEGORIES.map((ec) => {
      let checked = false;
      if (ec.key === 'all') {
        checked = checkedExpCates.length + checkedExpTypes.length + 1 === CMS_EXPENSE_TYPES.length + EXPENSE_CATEGORIES.length;
      } else {
        checked = checkedExpCates.indexOf(ec.key) !== -1;
      }
      const tagProps = {};
      if (checked) {
        tagProps.style = { backgroundColor: ec.color };
      }
      return (
        <CheckableTag
          key={ec.key}
          checked={checked}
          {...tagProps}
          onChange={chked => this.handleCateTagChange(ec.key, chked)}
        >{ec.text}
        </CheckableTag>);
    }).concat(CMS_EXPENSE_TYPES.map(et => (
      <CheckableTag
        key={et.key}
        checked={checkedExpTypes.indexOf(et.key) !== -1}
        onChange={chked => this.handleTypeTagChange(et.key, chked)}
      >{et.text}
      </CheckableTag>)));
    return (
      <div className="pane-content tab-pane">
        <Spin spinning={expensesLoading}>
          <div className="pane-header">
            {checkedTags}
          </div>
          <Card bodyStyle={{ padding: 0 }} hoverable={false}>
            <Collapse defaultActiveKey={['revenue', 'cost']}>
              <Panel header={this.msg('revenueDetail')} key="revenue" className="table-panel">
                <Table
                  size="small"
                  columns={this.columnFields}
                  dataSource={revenueFees}
                  rowKey="fee_name"
                  pagination={false}
                />
              </Panel>
              <Panel header={this.msg('costDetail')} key="cost" className="table-panel">
                <Table size="small" dataSource={costFees} rowKey="fee_name" pagination={false}>
                  <Column title={this.msg('feeName')} dataIndex="fee_name" render={this.renderCostFeeName} />
                  <Column title={this.msg('feeRemark')} dataIndex="remark" render={this.renderCostFeeColumn} />
                  <Column title={this.msg('feeVal')} dataIndex="cal_fee" render={this.renderCostFeeColumn} />
                  <Column title={this.msg('taxFee')} dataIndex="tax_fee" render={this.renderCostFeeColumn} />
                  <Column title={this.msg('totalFee')} dataIndex="total_fee" render={this.renderCostFeeColumn} />
                </Table>
              </Panel>
              <Panel header="计费参数" key="params" className="table-panel">
                <Table size="small" pagination={false} dataSource={parameters}>
                  <Column title="计费对象" dataIndex="name" />
                  <Column title="运单数量" dataIndex="shipmt_qty" />
                  <Column title="报关单数量" dataIndex="decl_qty" />
                  <Column title="报关单联数" dataIndex="decl_sheet_qty" />
                  <Column title="品名数量" dataIndex="decl_item_qty" />
                  <Column title="料件数量" dataIndex="trade_item_qty" />
                  <Column title="货值" dataIndex="trade_amt" />
                  <Column title="办证数量" dataIndex="cert_qty" />
                </Table>
              </Panel>
            </Collapse>
          </Card>
        </Spin>
      </div>
    );
  }
}
