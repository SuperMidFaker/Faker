import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Form, Layout, Tabs, Steps, Button, Card, Col, Row, Table, Tag } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import InfoItem from 'client/components/InfoItem';
import TrimSpan from 'client/components/trimSpan';
import { loadApplyDetails, loadParams, fileBatchApply, makeBatchApplied } from 'common/reducers/cwmShFtz';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const TabPane = Tabs.TabPane;
const Step = Steps.Step;

function fetchData({ dispatch }) {
  const promises = [];
  // promises.push(dispatch(loadApplyDetails(params.clearanceNo)));
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
    batchDecl: state.cwmShFtz.batch_decl,
    batchApplies: state.cwmShFtz.batch_applies,
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
    whse: state.cwmContext.defaultWhse,
    submitting: state.cwmShFtz.submitting,
  }),
  { loadApplyDetails, fileBatchApply, makeBatchApplied }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class SHFTZClearanceDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    tabKey: '',
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 460,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.batchApplies !== this.props.batchApplies && nextProps.batchApplies.length > 0) {
      if (this.state.tabKey === '') {
        this.setState({ tabKey: nextProps.batchApplies[0].pre_entry_seq_no });
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  columns = [{
    title: '出库单号',
    dataIndex: 'ftz_rel_no',
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
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
  }]
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  handleInfoSave = (preRegNo, field, value) => {
    this.props.updateRelReg(preRegNo, field, value);
  }
  render() {
    const { batchDecl, whse } = this.props;

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
                {this.msg('ftzClearance')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.clearanceNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions />
        </PageHeader>
        <Content className="main-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 48 }} noHovering>
              <Row className="info-group-inline">
                <Col sm={24} lg={6}>
                  <InfoItem label="提货单位" field={batchDecl.owner_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="报关代理" field={batchDecl.receiver_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="成交方式" field={batchDecl.receiver_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="备案时间" field={batchDecl.reg_date && moment(batchDecl.reg_date).format('YYYY-MM-DD HH:mm')} />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={batchDecl.status}>
                  <Step description="委托制单" />
                  <Step description="海关申报" />
                  <Step description="清关放行" />
                </Steps>
              </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }} noHovering>
              <Tabs defaultActiveKey="details" onChange={this.handleTabChange}>
                <TabPane tab="提货单列表" key="list" />
                <TabPane tab="委托清关明细" key="details">
                  <div className="panel-header">
                    <Row>
                      <Col sm={24} lg={6}>
                        <InfoItem size="small" addonBefore="申请单号" field={'reg.ftz_apply_no'} />
                      </Col>
                      <Col sm={24} lg={6}>
                        <InfoItem size="small" addonBefore="总毛重" field={'reg.gross_wt'} />
                      </Col>
                      <Col sm={24} lg={6}>
                        <InfoItem size="small" addonBefore="总净重" field={'reg.net_wt'} />
                      </Col>
                    </Row>
                  </div>
                  <div className="table-panel table-fixed-layout">
                    <Table size="middle" columns={this.columns} dataSource={null} indentSize={8} rowKey="id"
                      scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
                    />
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
