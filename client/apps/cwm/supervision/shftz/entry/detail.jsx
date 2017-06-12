import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Icon, Form, Layout, Tabs, Steps, Button, Select, Card, Col, Row, Tag, Table, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { loadEntryDetails, loadParams } from 'common/reducers/cwmShFtz';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const Step = Steps.Step;

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
    tenantName: state.account.tenantName,
    asnNo: state.cwmShFtz.entryData.asn_no,
    entryData: state.cwmShFtz.entryData,
    entryDetails: state.cwmShFtz.entryDetails,
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
  }),
  { loadEntryDetails }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class SHFTZEntryDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    entryList: PropTypes.object.isRequired,
    asnNo: PropTypes.string.isRequired,
    entryData: PropTypes.object.isRequired,
    entryDetails: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    sent: false,
    tabKey: Object.keys(this.props.entryDetails)[0],
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSend = () => {
    notification.success({
      message: '操作成功',
      description: `${this.props.asnNo} 已发送至 上海自贸区海关监管系统 一二线先报关后入库`,
    });
    this.setState({
      sent: true,
    });
  }
  columns = [{
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 150,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: 'HS编码',
    dataIndex: 'hscode',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }, {
    title: '规格型号',
    dataIndex: 'model',
    width: 200,
  }, {
    title: '单位',
    dataIndex: 'unit',
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: '数量',
    dataIndex: 'qty',
    render: o => (<b>{o}</b>),
  }, {
    title: '毛重',
    dataIndex: 'gross_wt',
  }, {
    title: '净重',
    dataIndex: 'net_wt',
  }, {
    title: '金额',
    dataIndex: 'amount',
  }, {
    title: '币制',
    dataIndex: 'currency',
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text;
    },
  }, {
    title: '原产国',
    dataIndex: 'country',
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text;
    },
  }]
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  renderTabs() {
    const { entryData, entryDetails } = this.props;
    const tabs = [];
    const keys = Object.keys(entryDetails);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const detail = entryDetails[key];
      tabs.push(
        <TabPane tab={key} key={key}>
          <div className="panel-header">
            <Row>
              <Col sm={24} lg={8}>
                <InfoItem size="small" addonBefore="入库备案号" field={entryData.ftz_ent_no} editable />
              </Col>
              <Col sm={24} lg={6}>
                <InfoItem size="small" addonBefore={<span><Icon type="calendar" />进口日期</span>} field={moment(entryData.ie_date).format('YYYY-MM-DD')} editable />
              </Col>
              <Col sm={24} lg={6}>
                <InfoItem size="small" addonBefore={<span><Icon type="calendar" />进库日期</span>} field={moment(entryData.ftz_ent_date).format('YYYY-MM-DD')} editable />
              </Col>
            </Row>
          </div>
          <Table columns={this.columns} dataSource={detail} indentSize={8} rowKey="id" />
        </TabPane>);
    }
    return (
      <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
        {tabs}
      </Tabs>
    );
  }
  render() {
    const { asnNo, entryData } = this.props;
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              上海自贸区监管
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Select
                size="large"
                defaultValue="0960"
                placeholder="选择仓库"
                style={{ width: 160 }}
                disabled
              >
                <Option value="0960">物流大道仓库</Option>
                <Option value="0961">希雅路仓库</Option>
                <Option value="0962">富特路仓库</Option>
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('ftzEntryReg')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {asnNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            {this.state.sent ? <Button size="large" icon="sync" onClick={this.handlePrint} >获取状态</Button> :
            <Button type="primary" size="large" icon="export" onClick={this.handleSend} >发送备案</Button>}
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 56 }}>
              <Row>
                <Col sm={24} lg={6}>
                  <InfoItem label="备案类型" field={<Tag color="blue">一二线进境</Tag>} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="经营单位" field={entryData.owner_cus_code} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="收货单位" field={entryData.wh_ent_cus_code} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="备案时间" addonBefore={<span><Icon type="calendar" /></span>} field={moment(entryData.ftz_ent_date).format('YYYY-MM-DD HH:mm')} />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={entryData.status}>
                  <Step description="待备案" />
                  <Step description="已发送" />
                  <Step description="备案完成" />
                </Steps>
              </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }}>
              {this.renderTabs()}
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
