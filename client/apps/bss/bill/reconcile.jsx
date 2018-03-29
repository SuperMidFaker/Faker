import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Badge, Button, Layout, Steps, Tabs } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import Drawer from 'client/components/Drawer';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import { createFilename } from 'client/util/dataTransform';
import { SETTLE_TYPE } from 'common/constants';
import { loadBillHead, getBillStatements, acceptBill, recallBill, rejectBill } from 'common/reducers/bssBill';
import ReconciliationPane from './tabpane/reconciliationPane';
import BillTypeTag from './common/billTypeTag';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { Description } = DescriptionList;
const { Step } = Steps;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    billHead: state.bssBill.billHead,
    billStatements: state.bssBill.billStatements,
    billHeadReload: state.bssBill.billHeadReload,
    statementReload: state.bssBill.statementReload,
  }),
  {
    loadBillHead, getBillStatements, acceptBill, recallBill, rejectBill,
  }
)
@connectNav({
  depth: 3,
  moduleName: 'bss',
  jumpOut: true,
})
export default class ReceivableBillDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.props.loadBillHead(this.props.params.billNo);
    this.props.getBillStatements(this.props.params.billNo);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.billHeadReload) {
      this.props.loadBillHead(this.props.params.billNo);
    }
    if (nextProps.statementReload) {
      this.props.getBillStatements(this.props.params.billNo);
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleAcceptBill = () => {
    this.props.acceptBill({ bill_no: this.props.params.billNo }).then((result) => {
      if (!result.error) {
        this.context.router.push('/bss/bill');
      }
    });
  }
  handleRecallBill = () => {
    this.props.recallBill({ bill_no: this.props.params.billNo }).then((result) => {
      if (!result.error) {
        this.context.router.push('/bss/bill');
      }
    });
  }
  handleRejectBill = () => {
    this.props.rejectBill({ bill_no: this.props.params.billNo }).then((result) => {
      if (!result.error) {
        this.context.router.push('/bss/bill');
      }
    });
  }
  handleExport = () => {
    window.open(`${API_ROOTS.default}v1/bss/bill/export/${createFilename(`${this.props.billHead.bill_title}`)}.xlsx?billNo=${this.props.params.billNo}`);
  }
  render() {
    const { billHead, tenantId, billStatements } = this.props;
    const unaccepted = [];
    const accepted = [];
    const bothAccepted = [];
    billStatements.forEach((statemt) => {
      if (statemt.seller_settle_status === 1 && statemt.buyer_settle_status === 1) {
        bothAccepted.push(statemt);
        return;
      }
      if (statemt.settle_type === SETTLE_TYPE.owner) {
        if (tenantId === statemt.owner_tenant_id) {
          if (statemt.buyer_settle_status === 0 && statemt.seller_settle_status === 1) {
            unaccepted.push(statemt);
          }
          if (statemt.seller_settle_status === 0 && statemt.buyer_settle_status === 1) {
            accepted.push(statemt);
          }
        } else if (tenantId === statemt.tenant_id) {
          if (statemt.seller_settle_status === 0 && statemt.buyer_settle_status === 1) {
            unaccepted.push(statemt);
          }
          if (statemt.buyer_settle_status === 0 && statemt.seller_settle_status === 1) {
            accepted.push(statemt);
          }
        }
      } else if (statemt.settle_type === SETTLE_TYPE.vendor) {
        if (tenantId === statemt.vendor_tenant_id) {
          if (statemt.seller_settle_status === 0 && statemt.buyer_settle_status === 1) {
            unaccepted.push(statemt);
          }
          if (statemt.buyer_settle_status === 0 && statemt.seller_settle_status === 1) {
            accepted.push(statemt);
          }
        } else if (tenantId === statemt.tenant_id) {
          if (statemt.buyer_settle_status === 0 && statemt.seller_settle_status === 1) {
            unaccepted.push(statemt);
          }
          if (statemt.seller_settle_status === 0 && statemt.buyer_settle_status === 1) {
            accepted.push(statemt);
          }
        }
      }
    });
    let actions = null;
    if (billHead.bill_type === 'OFB') {
      if (billHead.bill_status === 2) {
        actions = (
          <span>
            <Button icon="check" onClick={this.handleAcceptBill}>
              {this.msg('接受账单')}
            </Button>
            <Button icon="close" onClick={this.handleRecallBill} style={{ marginLeft: 8 }}>
              {this.msg('撤销账单')}
            </Button>
          </span>
        );
      }
    } else if (tenantId !== billHead.tenant_id) {
      if (billHead.bill_status === 2) {
        actions = (
          <span>
            <Button icon="check" onClick={this.handleAcceptBill}>
              {this.msg('接受账单')}
            </Button>
            <Button icon="exclamation" onClick={this.handleRejectBill} style={{ marginLeft: 8 }}>
              {this.msg('拒绝账单')}
            </Button>
          </span>
        );
      }
    } else if (tenantId === billHead.tenant_id) {
      if (billHead.bill_status === 3) {
        actions = (
          <Button icon="close" onClick={this.handleRecallBill}>
            {this.msg('撤销账单')}
          </Button>
        );
      }
    }
    return (
      <Layout>
        <PageHeader breadcrumb={[this.msg('bill'), this.props.params.billNo]}>
          <PageHeader.Actions>
            {actions}
            <Button icon="download" onClick={this.handleExport} style={{ marginLeft: 8 }}>导出</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer top onCollapseChange={this.handleCollapseChange}>
            <DescriptionList col={4}>
              <Description term="账单名称">{billHead.bill_title}</Description>
              {tenantId === billHead.buyer_tenant_id ?
                <Description term="服务商">{billHead.seller_name}</Description> :
                <Description term="客户">{billHead.buyer_name}</Description>}
              <Description term="账期">{billHead.order_begin_date && moment(billHead.order_begin_date).format('YYYY.MM.DD')} ~ {billHead.order_end_date && moment(billHead.order_end_date).format('YYYY.MM.DD')}</Description>
              <Description term="类型"><BillTypeTag billType={billHead.bill_type} msg={this.msg} /></Description>
              <Description term="订单数量">{billHead.order_count}</Description>
              <Description term="账单总金额">{billHead.total_amount}</Description>
              <Description term="调整金额">{billHead.adjusted_amount}</Description>
              <Description term="最终结算金额">{billHead.final_amount}</Description>
            </DescriptionList>
            <Steps progressDot current={billHead.bill_status - 1} className="progress-tracker">
              <Step title="草稿" />
              <Step title="对账中" />
              <Step title="已接受" />
            </Steps>
          </Drawer>
          <Content className="page-content">
            <MagicCard bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="unaccepted" onChange={this.handleTabChange}>
                <TabPane tab={<span>待我方认可<Badge count={unaccepted.length} /></span>} key="unaccepted" >
                  <ReconciliationPane
                    dataSource={unaccepted}
                    billNo={this.props.params.billNo}
                    status="unaccepted"
                  />
                </TabPane>
                <TabPane tab={<span>需对方认可<Badge count={accepted.length} /></span>} key="accepted" >
                  <ReconciliationPane
                    dataSource={accepted}
                    billNo={this.props.params.billNo}
                    status="accepted"
                  />
                </TabPane>
                <TabPane tab="双方已认可" key="bothAccepted" >
                  <ReconciliationPane
                    dataSource={bothAccepted}
                    billNo={this.props.params.billNo}
                    status="bothAccepted"
                  />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
