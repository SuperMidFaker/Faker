import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Icon, Form, Layout, Steps, Button, Card, Col, Row, Tag, Table, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import InfoItem from 'client/components/InfoItem';
import TrimSpan from 'client/components/trimSpan';
import { loadVirtualTransferDetails, loadParams, updateEntryReg, transferToOwnWhse, queryOwnTransferOutIn } from 'common/reducers/cwmShFtz';
import { CWM_SHFTZ_APIREG_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Step = Steps.Step;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadVirtualTransferDetails(params.asnNo)));
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
    entryAsn: state.cwmShFtz.entry_asn,
    owners: state.cwmContext.whseAttrs.owners,
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
  { updateEntryReg, transferToOwnWhse, queryOwnTransferOutIn }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class SHFTZTransferSelfDetail extends Component {
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
  columns = [{
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 160,
  }, {
    title: '入库明细ID',
    dataIndex: 'ftz_ent_detail_id',
    width: 120,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: 'HS编码',
    dataIndex: 'hscode',
    width: 180,
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }, {
    title: '规格型号',
    dataIndex: 'model',
    width: 150,
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: '数量',
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
    dataIndex: 'stock_netwt',
  }, {
    title: '毛重',
    width: 100,
    dataIndex: 'stock_grosswt',
  }, {
    title: '金额',
    width: 100,
    dataIndex: 'stock_amount',
  }, {
    title: '币制',
    dataIndex: 'currency',
    width: 100,
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
  }]
  handleInfoSave = (preRegNo, field, value, virtualTransfer) => {
    this.props.updateEntryReg(preRegNo, field, value, virtualTransfer);
  }
  handleTransToWhs = () => {
    const { params, entryAsn, tenantId, owners, whse } = this.props;
    const owner = owners.find(own => own.name === entryAsn.owner_name);
    this.props.transferToOwnWhse({
      asnNo: params.asnNo,
      whseCode: entryAsn.whse_code,
      customsWhseCode: whse.customs_whse_code,
      tenantId,
      owner,
    }).then((result) => {
      if (!result.error) {
        notification.success({
          message: '操作成功',
          placement: 'topLeft',
        });
      } else if (result.error.message === 'WHSE_FTZ_UNEXIST') {
        notification.error({
          message: '操作失败',
          description: '仓库监管系统未配置',
        });
      } else {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      }
    });
  }
  handleOwnTransferQuery = () => {
    const { params, entryAsn, username } = this.props;
    const asnNo = params.asnNo;
    this.props.queryOwnTransferOutIn({
      asn_no: asnNo,
      whse: entryAsn.whse_code,
      customsWhseCode: this.props.whse.customs_whse_code,
      username,
      tenantId: this.props.tenantId,
    }).then((result) => {
      if (!result.error) {
        if (result.data.errorMsg) {
          notification.warn({
            message: '结果异常',
            description: result.data.errorMsg,
            duration: 15,
          });
        } else {
          notification.success({
            message: '操作成功',
            placement: 'topLeft',
          });
        }
      } else if (result.error.message === 'WHSE_FTZ_UNEXIST') {
        notification.error({
          message: '操作失败',
          description: '仓库监管系统未配置',
        });
      } else {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      }
    });
  }
  render() {
    const { entryAsn, whse, submitting } = this.props;
    const stat = entryAsn.details.reduce((acc, regd) => ({
      total_qty: acc.total_qty + regd.stock_qty,
      total_amount: acc.total_amount + regd.stock_amount,
      total_net_wt: acc.total_net_wt + regd.stock_netwt,
    }), {
      total_qty: 0,
      total_amount: 0,
      total_net_wt: 0,
    });
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              上海自贸区监管
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {whse.name}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('ftzTransferSelf')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.props.params.asnNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            {entryAsn.reg_status === CWM_SHFTZ_APIREG_STATUS.pending &&
              <Button size="large" icon="export" loading={submitting} onClick={this.handleTransToWhs}>发送至终端</Button>}
            {entryAsn.reg_status === CWM_SHFTZ_APIREG_STATUS.sent && entryAsn.ftz_ent_no &&
              <Button size="large" icon="export" loading={submitting} onClick={this.handleOwnTransferQuery}>获取转移后明细ID</Button>}
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <Card bodyStyle={{ padding: 16, paddingBottom: 48 }} noHovering>
              <Row gutter={16} className="info-group-underline">
                <Col sm={24} lg={6}>
                  <InfoItem label="收货单位" field={entryAsn.owner_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="收货仓库" field={entryAsn.wh_ent_tenant_name} />
                </Col>
                <Col sm={24} lg={3}>
                  <InfoItem label="创建时间" addonBefore={<Icon type="clock-circle-o" />}
                    field={entryAsn.created_date && moment(entryAsn.created_date).format('YYYY.MM.DD HH:mm')} format="YYYY.MM.DD HH:mm"
                  />
                </Col>
                <Col sm={24} lg={3}>
                  <InfoItem label="转出时间" addonBefore={<Icon type="clock-circle-o" />}
                    field={entryAsn.ftz_rel_date && moment(entryAsn.ftz_rel_date).format('YYYY.MM.DD HH:mm')} format="YYYY.MM.DD HH:mm"
                  />
                </Col>
                <Col sm={12} lg={5}>
                  <InfoItem size="small" addonBefore="转入单号" field={entryAsn.ftz_ent_no} editable
                    onEdit={value => this.handleInfoSave(entryAsn.pre_entry_seq_no, 'ftz_ent_no', value, entryAsn.virtual_transfer)}
                  />
                </Col>
                <Col sm={12} lg={3}>
                  <InfoItem size="small" addonBefore={<span><Icon type="calendar" />转入日期</span>}
                    type="date" field={entryAsn.ftz_ent_date} editable
                    onEdit={value => this.handleInfoSave(entryAsn.pre_entry_seq_no, 'ftz_ent_date', new Date(value), entryAsn.virtual_transfer)}
                  />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={entryAsn.reg_status}>
                  <Step description="待转出" />
                  <Step description="终端处理" />
                  <Step description="已转入" />
                </Steps>
              </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }} noHovering>
              <div className="panel-header">
                <Row>
                  <Col sm={8} lg={2}>
                    <InfoItem size="small" addonBefore="总数量" field={stat.total_qty} />
                  </Col>
                  <Col sm={8} lg={3}>
                    <InfoItem size="small" addonBefore="总净重" field={stat.total_net_wt.toFixed(3)} addonAfter="KG" />
                  </Col>
                  <Col sm={8} lg={3}>
                    <InfoItem size="small" addonBefore="总金额" field={stat.total_amount.toFixed(2)} />
                  </Col>
                </Row>
              </div>
              <div className="table-panel table-fixed-layout">
                <Table size="middle" columns={this.columns} dataSource={entryAsn.details} indentSize={8} rowKey="id"
                  scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
                />
              </div>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
