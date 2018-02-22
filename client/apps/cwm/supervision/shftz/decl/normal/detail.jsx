import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Badge, Breadcrumb, Form, Layout, Tabs, Steps, Button, Card, Tag } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import SearchBox from 'client/components/SearchBox';
import DataPane from 'client/components/DataPane';
import Summary from 'client/components/Summary';
import TrimSpan from 'client/components/trimSpan';
import { loadParams, loadNormalDelg, loadDeclRelDetails } from 'common/reducers/cwmShFtz';
import { DELG_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { Description } = DescriptionList;
const { TabPane } = Tabs;
const { Step } = Steps;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadNormalDelg(params.clearanceNo)));
  promises.push(dispatch(loadDeclRelDetails(params.clearanceNo)));
  promises.push(dispatch(loadParams()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(state => ({
  normalDecl: state.cwmShFtz.normalDecl,
  regs: state.cwmShFtz.declRelRegs,
  details: state.cwmShFtz.declRelDetails,
  units: state.cwmShFtz.params.units.map(un => ({
    value: un.unit_code,
    text: un.unit_name,
  })),
  currencies: state.cwmShFtz.params.currencies.map(cr => ({
    value: cr.curr_code,
    text: cr.curr_name,
  })),
  tradeCountries: state.cwmShFtz.params.tradeCountries.map(tc => ({
    value: tc.cntry_co,
    text: tc.cntry_name_cn,
  })),
  trxModes: state.cwmShFtz.params.trxModes.map(tx => ({
    value: tx.trx_mode,
    text: tx.trx_spec,
  })),
  exemptions: state.cmsManifest.params.exemptionWays.map(ep => ({
    value: ep.value,
    text: ep.text,
  })),
  whse: state.cwmContext.defaultWhse,
}))
@connectNav({
  depth: 3,
  moduleName: 'cwm',
  jumpOut: true,
})
export default class NormalDeclDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    fullscreen: true,
  }
  msg = key => formatMsg(this.props.intl, key)
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  regColumns = [{
    title: '出区提货单号',
    dataIndex: 'ftz_rel_no',
    width: 180,
  }, {
    title: 'SO编号',
    dataIndex: 'so_no',
    width: 250,
  }, {
    title: '供货商',
    dataIndex: 'supplier',
  }, {
    title: '成交方式',
    dataIndex: 'trxn_mode',
    render: (o) => {
      const mode = this.props.trxModes.filter(cur => cur.value === o)[0];
      const text = mode ? `${mode.value}|${mode.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '币制',
    dataIndex: 'currency',
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }]
  columns = [{
    title: '出区提货单号',
    dataIndex: 'ftz_rel_no',
    width: 180,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
  }, {
    title: '商品编码',
    dataIndex: 'hscode',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }, {
    title: '规格型号',
    dataIndex: 'model',
    render: o => <TrimSpan text={o} maxLen={30} />,
    width: 240,
  }, {
    title: '原产国',
    dataIndex: 'country',
    width: 150,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '单位',
    dataIndex: 'out_unit',
    width: 100,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '数量',
    width: 100,
    dataIndex: 'qty',
  }, {
    title: '毛重',
    width: 100,
    dataIndex: 'gross_wt',
  }, {
    title: '净重',
    width: 100,
    dataIndex: 'net_wt',
  }, {
    title: '金额',
    width: 100,
    dataIndex: 'amount',
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
    title: '供货商',
    width: 100,
    dataIndex: 'supplier',
  }, {
    title: '成交方式',
    width: 100,
    dataIndex: 'trxn_mode',
    render: (o) => {
      const mode = this.props.trxModes.filter(cur => cur.value === o)[0];
      const text = mode ? `${mode.value}|${mode.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '运费',
    dataIndex: 'freight',
    width: 100,
  }, {
    title: '运费币制',
    dataIndex: 'freight_currency',
    width: 100,
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '目的国',
    dataIndex: 'dest_country',
    width: 150,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      return country ? <Tag>{`${country.value}| ${country.text}`}</Tag> : o;
    },
  }]
  handleDelgManifest = () => {
    const decl = this.props.normalDecl;
    const link = `/clearance/${decl.i_e_type}/manifest/`;
    this.context.router.push(`${link}${decl.delg_no}`);
  }
  render() {
    const {
      normalDecl, whse, details, regs, trxModes,
    } = this.props;
    const statWt = details.reduce((acc, det) => ({
      net_wt: acc.net_wt + det.net_wt,
      gross_wt: acc.gross_wt + det.gross_wt,
    }), { net_wt: 0, gross_wt: 0 });
    const mode = trxModes.filter(cur => cur.value === normalDecl.trxn_mode)[0];
    let declStatusText;
    let declStep;
    if (normalDecl.status <= DELG_STATUS.undeclared) {
      declStatusText = '制单中';
      declStep = 0;
    } else if (normalDecl.status === DELG_STATUS.declared) {
      declStatusText = '已申报';
      declStep = 1;
    } else if (normalDecl.status === DELG_STATUS.finished) {
      declStatusText = '已放行';
      declStep = 2;
    }
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const totCol = (
      <Summary>
        <Summary.Item label="总数量" addonAfter="KG">{statWt.gross_wt.toFixed(2)}</Summary.Item>
        <Summary.Item label="总净重" addonAfter="KG">{statWt.net_wt.toFixed(6)}</Summary.Item>
      </Summary>
    );
    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {whse.name}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('ftzNormalDecl')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.clearanceNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <Button icon="link" onClick={this.handleDelgManifest}>关联申报清单 <Badge status="default" text={declStatusText} /></Button>
          </PageHeader.Nav>
          <PageHeader.Actions />
        </PageHeader>
        <Content className="page-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 56 }} >
              <DescriptionList col={6}>
                <Description term="提货单位">{normalDecl.owner_name}</Description>
                <Description term="报关代理">{normalDecl.customs_name}</Description>
                <Description term="成交方式">{mode && `${mode.value}| ${mode.text}`}</Description>
                <Description term="备案时间">{normalDecl.reg_date && moment(normalDecl.reg_date).format('YYYY.MM.DD HH:mm')}</Description>
              </DescriptionList>
              <div className="card-footer">
                <Steps progressDot current={declStep}>
                  <Step title="委托制单" />
                  <Step title="已申报" />
                  <Step title="报关放行" />
                </Steps>
              </div>
            </Card>
            <MagicCard bodyStyle={{ padding: 0 }} onSizeChange={this.toggleFullscreen}>
              <Tabs defaultActiveKey="details">
                <TabPane tab="提货单列表" key="list">
                  <DataPane
                    fullscreen={this.state.fullscreen}
                    columns={this.regColumns}
                    indentSize={8}
                    dataSource={regs}
                    rowKey="ftz_rel_no"
                  >
                    <DataPane.Toolbar>
                      <SearchBox placeholder={this.msg('searchPlaceholder')} onSearch={this.handleSearch} />
                    </DataPane.Toolbar>
                  </DataPane>
                </TabPane>
                <TabPane tab="出库报关明细" key="details">
                  <DataPane
                    fullscreen={this.state.fullscreen}
                    columns={this.columns}
                    rowSelection={rowSelection}
                    indentSize={0}
                    dataSource={details}
                    rowKey="id"
                    loading={this.state.loading}
                  >
                    <DataPane.Toolbar>
                      <SearchBox placeholder={this.msg('searchPlaceholder')} onSearch={this.handleSearch} />
                      <DataPane.Extra>
                        {totCol}
                      </DataPane.Extra>
                    </DataPane.Toolbar>
                  </DataPane>
                </TabPane>
              </Tabs>
            </MagicCard>
          </Form>
        </Content>
      </div>
    );
  }
}
