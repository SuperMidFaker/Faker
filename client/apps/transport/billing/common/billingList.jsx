import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Button } from 'antd';
import Table from 'client/components/remoteAntTable';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import BillingForm from './billingForm';
import { loadBillings, updateBilling } from 'common/reducers/transportBilling';
import { SHIPMENT_BILLING_STATUS } from 'common/constants';

const formatMsg = format(messages);

@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    billings: state.transportBilling.billings,
  }),
  { loadBillings, updateBilling }
)
export default class BillingList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadBillings: PropTypes.func.isRequired,
    updateBilling: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    billingFormVisible: false,
  }
  componentDidMount() {
    const { tenantId, type } = this.props;
    const { pageSize, currentPage } = this.props.billings;
    this.props.loadBillings({
      type,
      tenantId,
      pageSize,
      currentPage,
    });
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleAddBtnClicked = () => {
    this.setState({
      billingFormVisible: true,
    });
  }
  toggleBillingForm = () => {
    this.setState({ billingFormVisible: !this.state.billingFormVisible });
  }
  render() {
    const { tenantId, type } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadBillings(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.currentPage, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
      }),
      getParams: (pagination) => {
        const params = {
          type,
          tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
        };
        return params;
      },
      remotes: this.props.billings,
    });

    const columns = [{
      title: '账单名称',
      dataIndex: 'name',
    }, {
      title: '开始日期',
      dataIndex: 'begin_date',
      render(o) {
        return moment(o).format('YYYY.MM.DD');
      },
    }, {
      title: '结束日期',
      dataIndex: 'end_date',
      render(o) {
        return moment(o).format('YYYY.MM.DD');
      },
    }, {
      title: type === 'receivable' ? '客户' : '承运商',
      dataIndex: type === 'receivable' ? 'sr_name' : 'sp_name',
    }, {
      title: '运单数量',
      dataIndex: 'shipmt_count',
    }, {
      title: '运单总费用',
      dataIndex: 'total_charge',
    }, {
      title: '调整费用',
      dataIndex: 'adjust_charge',
    }, {
      title: '账单总金额',
      dataIndex: '',
    }, {
      title: '核销金额',
      dataIndex: 'cancel_charge',
    }, {
      title: '账单状态',
      dataIndex: 'status',
      render(o) {
        return SHIPMENT_BILLING_STATUS[o];
      },
    }, {
      title: '操作',
      dataIndex: 'id',
      render: (o) => {
        return <Link to={`/transport/billing/checkBilling/${o}`}>{this.msg('checkBilling')}</Link>;
      },
    }];

    return (
      <div>
        <header className="top-bar">
          <span>{this.msg(this.props.type)}{this.msg('billing')}</span>
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary" onClick={this.handleAddBtnClicked}>{this.msg('createBilling')}</Button>
              <Button style={{ marginLeft: 16 }}>{this.msg('export')}</Button>
            </div>
            <div className="panel-body">
              <Table dataSource={dataSource} columns={columns} rowKey="id" />
            </div>
            <BillingForm type={this.props.type} visible={this.state.billingFormVisible} toggle={this.toggleBillingForm} />
          </div>
        </div>
      </div>

    );
  }
}
