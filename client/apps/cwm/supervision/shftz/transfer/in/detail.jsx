import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Badge, Layout, Steps, Button, Tag, Tooltip, message, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import Drawer from 'client/components/Drawer';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import SearchBox from 'client/components/SearchBox';
import DescriptionList from 'client/components/DescriptionList';
import EditableCell from 'client/components/EditableCell';
import DataPane from 'client/components/DataPane';
import Summary from 'client/components/Summary';
import { loadEntryDetails, loadParams, updateEntryReg, pairEntryRegProducts, putCustomsRegFields } from 'common/reducers/cwmShFtz';
import { CWM_SHFTZ_APIREG_STATUS, CWM_ASN_BONDED_REGTYPES, CWM_INBOUND_STATUS_INDICATOR } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { Description } = DescriptionList;
const { Step } = Steps;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadEntryDetails({ preEntrySeqNo: params.preFtzEntNo })));
  promises.push(dispatch(loadParams()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    username: state.account.username,
    transfInReg: state.cwmShFtz.entry_asn,
    entryRegs: state.cwmShFtz.entry_regs,
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
  {
    loadEntryDetails, updateEntryReg, pairEntryRegProducts, putCustomsRegFields,
  }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
  jumpOut: true,
})
export default class SHFTZTransferInDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    comparable: false,

    searchVal: null,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.entryRegs !== this.props.entryRegs && nextProps.entryRegs.length > 0) {
      const comparable = nextProps.transfInReg.reg_status === CWM_SHFTZ_APIREG_STATUS.pending &&
        nextProps.entryRegs.filter(er => !er.ftz_ent_no).length === 0; // 入库单号全部已知可查询入库明细
      this.setState({ comparable });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleEnqueryPairing = () => {
    const {
      username: loginName, params: { preFtzEntNo }, whse, transfInReg,
    } = this.props;
    this.props.pairEntryRegProducts(
      preFtzEntNo, transfInReg.asn_no, whse.code,
      whse.ftz_whse_code, loginName
    ).then((result) => {
      if (!result.error) {
        if (result.data.remainFtzStocks.length > 0 || result.data.remainProducts.length > 0) {
          // todo 对比视图 数据保存
          const { remainFtzStocks, remainProducts } = result.data;
          let remainFtzMsg = null;
          if (remainFtzStocks.length > 0) {
            remainFtzMsg = (<span>东方支付入库单剩余以下未配: <br />{
              remainFtzStocks.map(rfs =>
                (<span key={rfs.ftz_ent_detail_id}>{rfs.ftz_ent_detail_id}-{rfs.hscode}-{rfs.name}
                  <br />净重: {rfs.stock_wt.toFixed(6)} 数量: {rfs.stock_qty} <br /></span>))
            }</span>);
          }
          let remainPrdtMsg = null;
          if (remainProducts.length > 0) {
            remainPrdtMsg = (<span>订单剩余以下未配: <br />{
          remainProducts.map(rps =>
            (<span key={`${rps.product_no}${rps.asn_seq_no}`}>{rps.product_no}-{rps.hscode}-{rps.name}
            数量: {rps.expect_qty}<br /></span>))
            }</span>);
          }
          notification.warn({
            message: '未完全匹配',
            description: <span>{remainFtzMsg}<br />{remainPrdtMsg}</span>,
            duration: 0,
            placement: 'topLeft',
          });
        } else {
          notification.success({
            message: '操作成功',
            description: '货号明细ID配对完成',
          });
        }
        this.props.loadEntryDetails({ preEntrySeqNo: preFtzEntNo });
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
  columns = [{
    title: '行号',
    dataIndex: 'asn_seq_no',
    width: 60,
  }, {
    title: '入库单号',
    dataIndex: 'ftz_ent_no',
    width: 120,
  }, {
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
    title: '商品编码',
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
    width: 100,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }]
  handleTransfOwnerChange= (value) => {
    const owner = this.props.owners.filter(own => own.customs_code === value)[0];
    if (owner) {
      const { preFtzEntNo } = this.props.params;
      this.props.putCustomsRegFields(
        { pre_ftz_ent_no: preFtzEntNo },
        { owner_cus_code: owner.customs_code, owner_name: owner.name }
      ).then((result) => {
        if (result.error) {
          notification.error({
            message: '操作失败',
            description: result.error.message,
            duration: 15,
          });
        } else {
          message.success('修改成功');
        }
      });
    }
  }
  handleInfoSave = (field, value) => {
    const { preFtzEntNo } = this.props.params;
    this.props.updateEntryReg(preFtzEntNo, field, value).then((result) => {
      if (result.error) {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      } else {
        message.success('修改成功');
        if (field === 'ftz_ent_no') {
          this.props.loadEntryDetails({ preEntrySeqNo: preFtzEntNo });
        }
      }
    });
  }
  handleInboundPage = () => {
    this.context.router.push(`/cwm/receiving/inbound/${this.props.transfInReg.inbound_no}`);
  }
  handlePairingConfirmed = () => {
    const { preFtzEntNo } = this.props.params;
    this.props.putCustomsRegFields(
      { pre_ftz_ent_no: preFtzEntNo },
      { status: CWM_SHFTZ_APIREG_STATUS.completed }
    ).then((result) => {
      if (result.error) {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      }
    });
  }
  handleSearch = (searchText) => {
    this.setState({ searchVal: searchText });
  }
  render() {
    const {
      transfInReg, entryRegs, submitting, owners,
    } = this.props;
    const { searchVal } = this.state;
    if (entryRegs.length !== 1) {
      return null;
    }
    const entType = CWM_ASN_BONDED_REGTYPES[2];
    const inbStatus = CWM_INBOUND_STATUS_INDICATOR.filter(status =>
      status.value === transfInReg.inbound_status)[0];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const reg = entryRegs[0];
    let { details } = reg;
    if (searchVal) {
      details = details.filter((item) => {
        const sv = new RegExp(searchVal);
        return sv.test(item.ftz_cargo_no) || sv.test(item.product_no)
        || sv.test(item.hscode) || sv.test(item.g_name);
      });
    }
    const stat = details.reduce((acc, regd) => ({
      total_qty: acc.total_qty + regd.stock_qty,
      total_amount: acc.total_amount + regd.stock_amount,
      total_net_wt: acc.total_net_wt + regd.stock_netwt,
    }), {
      total_qty: 0,
      total_amount: 0,
      total_net_wt: 0,
    });
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            entType.ftztext,
            this.props.params.preFtzEntNo,
          ]}
        >
          <PageHeader.Nav>
            {transfInReg.inbound_no && <Tooltip title="入库操作" placement="bottom">
              <Button icon="link" onClick={this.handleInboundPage}>
                {inbStatus && <Badge status={inbStatus.badge} text={inbStatus.text} />}
              </Button>
            </Tooltip>
            }
          </PageHeader.Nav>
          <PageHeader.Actions>
            {this.state.comparable && <Button type="primary" icon="sync" loading={submitting} onClick={this.handleEnqueryPairing}>明细匹配核对</Button>}
            {reg.details.length > 0 &&
              <Button type="primary" loading={submitting} onClick={this.handlePairingConfirmed}>核对通过</Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer top onCollapseChange={this.handleCollapseChange}>
            <DescriptionList col={2}>
              <Description term="收货单位">
                <EditableCell
                  value={transfInReg.owner_cus_code}
                  type="select"
                  options={owners.map(data => ({
                      key: data.customs_code,
                      text: `${data.customs_code}|${data.name}`,
                    }))}
                  onSave={this.handleTransfOwnerChange}
                />
              </Description>
              <Description term="海关入库单号">
                <EditableCell
                  value={transfInReg.ftz_ent_no}
                  onSave={value => this.handleInfoSave('ftz_ent_no', value)}
                />
              </Description>
            </DescriptionList>
            <DescriptionList col={2}>
              <Description term="发货单位">{transfInReg.sender_cus_code}|{transfInReg.sender_name}</Description>
              <Description term="海关出库单号">
                <EditableCell
                  value={transfInReg.ftz_rel_no}
                  onSave={value => this.handleInfoSave('ftz_rel_no', value)}
                />
              </Description>
            </DescriptionList>
            <DescriptionList col={4}>
              <Description term="收货仓库号">{transfInReg.receiver_ftz_whse_code}</Description>
              <Description term="转入完成时间">
                <EditableCell
                  type="date"
                  value={transfInReg.ftz_ent_date && moment(transfInReg.ftz_ent_date).format('YYYY-MM-DD')}
                  onSave={value => this.handleInfoSave('ftz_ent_date', new Date(value))}
                />
              </Description>
              <Description term="发货仓库号">{transfInReg.sender_ftz_whse_code}</Description>
              <Description term="转出日期">
                <EditableCell
                  type="date"
                  value={transfInReg.ftz_rel_date && moment(transfInReg.ftz_rel_date).format('YYYY-MM-DD')}
                  onSave={value => this.handleInfoSave('ftz_rel_date', new Date(value))}
                />
              </Description>
            </DescriptionList>
            <Steps progressDot current={transfInReg.reg_status} className="progress-tracker">
              <Step title="待转入" />
              <Step title="已接收" />
              <Step title="已核对" />
            </Steps>
          </Drawer>
          <Content className="page-content">
            <MagicCard bodyStyle={{ padding: 0 }} >
              <DataPane
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
                    <Summary>
                      <Summary.Item label="总数量">{stat.total_qty}</Summary.Item>
                      <Summary.Item label="总净重" addonAfter="KG">{stat.total_net_wt.toFixed(3)}</Summary.Item>
                      <Summary.Item label="总金额">{stat.total_amount.toFixed(3)}</Summary.Item>
                    </Summary>
                  </DataPane.Extra>
                </DataPane.Toolbar>
              </DataPane>
            </MagicCard>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
