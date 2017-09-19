import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Badge, Breadcrumb, Layout, Tabs, Card, Tag } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import TrimSpan from 'client/components/trimSpan';
import PageHeader from 'client/components/PageHeader';
import { loadEntryDetails, loadParams } from 'common/reducers/cwmShFtz';
import { format } from 'client/common/i18n/helpers';
import FTZStockPane from './tabpane/ftzStockPane';
import ComaprisonPane from './tabpane/comparisonPane';
import DiscrepancyPane from './tabpane/discrepancyPane';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const TabPane = Tabs.TabPane;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadEntryDetails({ asnNo: params.asnNo })));
  promises.push(dispatch(loadParams()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
  }),
  { }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
  jumpOut: true,
})
export default class SHFTZStockTask extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 460,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key)

  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }

  columns = [{
    title: '行号',
    dataIndex: 'asn_seq_no',
    width: 70,
  }, {
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 160,
  }, {
    title: '入库明细ID',
    dataIndex: 'ftz_ent_detail_id',
    width: 120,
  }, {
    title: '项号',
    dataIndex: 'decl_g_no',
    width: 60,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: 'HS编码',
    dataIndex: 'hscode',
    width: 150,
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }, {
    title: '规格型号',
    dataIndex: 'model',
    width: 250,
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: '数量',
    dataIndex: 'qty',
    width: 100,
    render: o => (<b>{o}</b>),
  }, {
    title: '剩余数量',
    dataIndex: 'stock_qty',
    width: 100,
    render: o => (<b>{o}</b>),
  }, {
    title: '单位',
    dataIndex: 'unit',
    width: 100,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '净重',
    width: 100,
    dataIndex: 'net_wt',
  }, {
    title: '剩余净重',
    width: 100,
    dataIndex: 'stock_netwt',
  }, {
    title: '毛重',
    width: 100,
    dataIndex: 'gross_wt',
  }, {
    title: '金额',
    width: 100,
    dataIndex: 'amount',
  }, {
    title: '剩余金额',
    width: 100,
    dataIndex: 'stock_amount',
  }, {
    title: '币制',
    width: 100,
    dataIndex: 'currency',
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '原产国',
    dataIndex: 'country',
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '运费',
    width: 100,
    dataIndex: 'freight',
  }, {
    title: '剩余运费',
    width: 100,
    dataIndex: 'stock_freight',
  }, {
    title: '运费币制',
    width: 100,
    dataIndex: 'freight_currency',
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }]
  render() {
    const { whse } = this.props;
    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
              上海自贸区监管
            </Breadcrumb.Item>
              <Breadcrumb.Item>
                {whse.name}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.asnNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
        </PageHeader>
        <Content className="main-content" key="main">
          <Card noHovering bodyStyle={{ paddingBottom: 8 }} />
          <Card noHovering bodyStyle={{ padding: 0 }}>
            <Tabs defaultActiveKey="comparison">
              <TabPane tab="对比视图" key="comparison">
                <ComaprisonPane />
              </TabPane>
              <TabPane tab={<Badge count={5}>差异视图</Badge>} key="discrepancy">
                <DiscrepancyPane />
              </TabPane>
              <TabPane tab="海关库存数据" key="ftz">
                <FTZStockPane />
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </div>
    );
  }
}
