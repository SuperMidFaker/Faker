import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Badge, Breadcrumb, Form, Layout, Tabs, Steps, Button, Card, Col, Row, Table, Tag, Tooltip } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import InfoItem from 'client/components/InfoItem';
import TrimSpan from 'client/components/trimSpan';
import { loadParams, loadNormalDelg, loadDeclRelDetails } from 'common/reducers/cwmShFtz';
import { DELG_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const TabPane = Tabs.TabPane;
const Step = Steps.Step;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadNormalDelg(params.clearanceNo)));
  promises.push(dispatch(loadDeclRelDetails(params.clearanceNo)));
  promises.push(dispatch(loadParams()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
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
    whse: state.cwmContext.defaultWhse,
  })
)
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
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 460,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  regColumns = [{
    title: '出库单号',
    dataIndex: 'ftz_rel_no',
  }, {
    title: 'SO单号',
    dataIndex: 'so_no',
    width: 250,
  }, {
    title: '供货商',
    width: 200,
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
    title: '币制',
    width: 100,
    dataIndex: 'currency',
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }]
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
  }]
  handleDelgManifest = () => {
    const decl = this.props.normalDecl;
    const link = `/clearance/${decl.i_e_type}/manifest/`;
    this.context.router.push(`${link}${decl.delg_no}`);
  }
  render() {
    const { normalDecl, whse, details, regs, trxModes } = this.props;
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
          <PageHeader.Nav>
            <Tooltip title="报关清单" placement="bottom">
              <Button size="large" icon="link" onClick={this.handleDelgManifest}><Badge status="default" text={declStatusText} /></Button>
            </Tooltip>
          </PageHeader.Nav>
          <PageHeader.Actions />
        </PageHeader>
        <Content className="main-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 48 }} noHovering>
              <Row className="info-group-inline">
                <Col sm={24} lg={6}>
                  <InfoItem label="提货单位" field={normalDecl.owner_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="报关代理" field={normalDecl.customs_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="成交方式" field={mode && `${mode.value}| ${mode.text}`} />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={declStep}>
                  <Step description="委托制单" />
                  <Step description="已申报" />
                  <Step description="报关放行" />
                </Steps>
              </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }} noHovering>
              <Tabs defaultActiveKey="details">
                <TabPane tab="提货单列表" key="list">
                  <Table size="middle" columns={this.regColumns} dataSource={regs} indentSize={8} rowKey="ftz_rel_no" />
                </TabPane>
                <TabPane tab="出库报关明细" key="details">
                  <div className="panel-header">
                    <Row>
                      <Col sm={24} lg={6}>
                        <InfoItem size="small" addonBefore="总毛重" field={statWt.gross_wt.toFixed(2)} />
                      </Col>
                      <Col sm={24} lg={6}>
                        <InfoItem size="small" addonBefore="总净重" field={statWt.net_wt.toFixed(6)} />
                      </Col>
                    </Row>
                  </div>
                  <div className="table-panel table-fixed-layout">
                    <Table size="middle" columns={this.columns} dataSource={details} indentSize={8} rowKey="id"
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
