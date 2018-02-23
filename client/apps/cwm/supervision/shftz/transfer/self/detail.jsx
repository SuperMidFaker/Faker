import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Form, Layout, Steps, Button, Tabs, Card, Tag, message, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import TrimSpan from 'client/components/trimSpan';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import DataPane from 'client/components/DataPane';
import SearchBox from 'client/components/SearchBox';
import EditableCell from 'client/components/EditableCell';
import Summary from 'client/components/Summary';
import { loadVirtualTransferDetails, getSelfTransfFtzCargos, loadParams, updateEntryReg, transferToOwnWhse, queryOwnTransferOutIn } from 'common/reducers/cwmShFtz';
import { string2Bytes } from 'client/util/dataTransform';
import { CWM_SHFTZ_APIREG_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { Description } = DescriptionList;
const { Step } = Steps;
const { TabPane } = Tabs;

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
    loginId: state.account.loginId,
    username: state.account.username,
    transfSelfReg: state.cwmShFtz.entry_asn,
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
    loadVirtualTransferDetails,
    updateEntryReg,
    transferToOwnWhse,
    queryOwnTransferOutIn,
    getSelfTransfFtzCargos,
  }
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
    fullscreen: true,
    transfSelfReg: {},
  }
  componentWillMount() {
    this.setState({
      transfSelfReg: this.props.transfSelfReg,
    });
  }
  msg = key => formatMsg(this.props.intl, key)
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
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
  handleInfoSave = (field, value) => {
    const { transfSelfReg, updateEntryReg: upERfunc } = this.props;
    upERfunc(transfSelfReg.pre_ftz_ent_no, field, value, true)
      .then((result) => {
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
  handleSelfTransfExport = () => {
    const { transfSelfReg, getSelfTransfFtzCargos: lstfcFunc } = this.props;
    lstfcFunc(transfSelfReg.pre_ftz_ent_no).then((result) => {
      if (!result.error) {
        const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
        const wb = { SheetNames: [transfSelfReg.ftz_rel_no], Sheets: {}, Props: {} };
        const mergedFtzDetailMap = new Map();
        const details = [...transfSelfReg.details];
        const ftzCargoMap = result.data;
        details.sort((era, erb) => era.ftz_ent_detail_id.localeCompare(erb.ftz_ent_detail_id))
          .forEach((erd) => {
            let mergeDetail;
            if (mergedFtzDetailMap.has(erd.ftz_ent_detail_id)) {
              mergeDetail = mergedFtzDetailMap.get(erd.ftz_ent_detail_id);
              mergeDetail.qty += erd.stock_qty;
              mergeDetail.net_wt += erd.stock_netwt;
              mergeDetail.gross_wt += erd.stock_grosswt;
              mergeDetail.amount += erd.stock_amount;
              mergeDetail.amount_usd += erd.stock_amountusd;
            } else {
              const ftzCargoNo = ftzCargoMap[erd.product_no] || erd.ftz_cargo_no;
              mergeDetail = {
                ftz_cargo_no: ftzCargoNo,
                hscode: erd.hscode,
                g_name: erd.g_name,
                model: erd.model,
                unit: erd.unit,
                qty: erd.stock_qty,
                net_wt: erd.stock_netwt,
                gross_wt: erd.stock_grosswt,
                amount: erd.stock_amount,
                amount_usd: erd.stock_amountusd,
                country: erd.country,
                currency: erd.currency,
                tag: erd.ftz_ent_detail_id,
              };
            }
            mergedFtzDetailMap.set(erd.ftz_ent_detail_id, mergeDetail);
          });
        const mergedRegDetails = Array.from(mergedFtzDetailMap.values());
        const csvData = mergedRegDetails.map(mrd => ({
          备件号: mrd.ftz_cargo_no,
          HS编码: mrd.hscode,
          中文品名: mrd.g_name,
          规格型号: mrd.model,
          原数量: mrd.qty,
          原计量单位: mrd.unit,
          计量单位: mrd.unit,
          数量: mrd.qty,
          净重: mrd.net_wt,
          毛重: mrd.gross_wt,
          金额: mrd.amount,
          货币: mrd.currency,
          原产国: mrd.country,
          美元货值: mrd.amount_usd,
          库位: null,
          标签: mrd.tag,
        }));
        wb.Sheets[transfSelfReg.ftz_rel_no] = XLSX.utils.json_to_sheet(csvData);
        FileSaver.saveAs(
          new window.Blob([string2Bytes(XLSX.write(wb, wopts))], { type: 'application/octet-stream' }),
          `区内转让转入_${transfSelfReg.ftz_rel_no}.xlsx`
        );
      }
    });
  }
  handleTransToWhs = () => {
    const { params, whse } = this.props;
    this.props.transferToOwnWhse({
      asnNo: params.asnNo,
      whseCode: whse.code,
      ftzWhseCode: whse.ftz_whse_code,
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
          this.props.loadVirtualTransferDetails(params.asnNo);
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
  handleOwnTransferQuery = () => {
    const { params: { asnNo }, username, whse } = this.props;
    this.props.queryOwnTransferOutIn({
      asn_no: asnNo,
      whse: whse.code,
      ftzWhseCode: this.props.whse.ftz_whse_code,
      username,
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
          this.props.loadVirtualTransferDetails(asnNo);
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
  handleSearch = (searchText) => {
    const transfSelfReg = JSON.parse(JSON.stringify(this.props.transfSelfReg));
    if (searchText) {
      transfSelfReg.details = transfSelfReg.details.filter((item) => {
        const reg = new RegExp(searchText);
        return reg.test(item.ftz_cargo_no) || reg.test(item.product_no)
        || reg.test(item.hscode) || reg.test(item.g_name);
      });
    }
    this.setState({ transfSelfReg });
  }
  render() {
    const { whse, submitting } = this.props;
    const { transfSelfReg } = this.state;
    const stat = transfSelfReg.details ? transfSelfReg.details.reduce((acc, regd) => ({
      total_qty: acc.total_qty + regd.stock_qty,
      total_amount: acc.total_amount + regd.stock_amount,
      total_net_wt: acc.total_net_wt + regd.stock_netwt,
    }), {
      total_qty: 0,
      total_amount: 0,
      total_net_wt: 0,
    }) : {
      total_qty: 0,
      total_amount: 0,
      total_net_wt: 0,
    };
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const totCol = (
      <Summary>
        <Summary.Item label="总数量">{stat.total_qty}</Summary.Item>
        <Summary.Item label="总净重" addonAfter="KG">{stat.total_net_wt.toFixed(3)}</Summary.Item>
        <Summary.Item label="总金额">{stat.total_amount.toFixed(3)}</Summary.Item>
      </Summary>
    );
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
                {this.msg('ftzTransferSelf')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.asnNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            {transfSelfReg.reg_status === CWM_SHFTZ_APIREG_STATUS.pending &&
              <Button icon="export" loading={submitting} onClick={this.handleTransToWhs}>发送至终端</Button>}
            {transfSelfReg.reg_status === CWM_SHFTZ_APIREG_STATUS.processing &&
              <Button icon="export" loading={submitting} onClick={this.handleSelfTransfExport}>导出</Button>}
            {transfSelfReg.reg_status === CWM_SHFTZ_APIREG_STATUS.processing &&
                  transfSelfReg.ftz_ent_no &&
                  <Button icon="export" loading={submitting} onClick={this.handleOwnTransferQuery}>获取转移后明细ID</Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Form layout="vertical">
            <Card bodyStyle={{ padding: 16, paddingBottom: 56 }} >
              <DescriptionList col={4}>
                <Description term="收货单位海关编码">
                  <EditableCell
                    value={transfSelfReg.owner_cus_code}
                    onSave={value => this.handleInfoSave('owner_cus_code', value)}
                  />
                </Description>
                <Description term="收货单位">
                  <EditableCell
                    value={transfSelfReg.owner_name}
                    onSave={value => this.handleInfoSave('owner_name', value)}
                  />
                </Description>
                <Description term="出库单号">{transfSelfReg.ftz_rel_no}</Description>
                <Description term="转出时间">{transfSelfReg.ftz_rel_date && moment(transfSelfReg.ftz_rel_date).format('YYYY.MM.DD HH:mm')}</Description>
                <Description term="入库单号">
                  <EditableCell
                    value={transfSelfReg.ftz_ent_no}
                    onSave={value => this.handleInfoSave('ftz_ent_no', value)}
                  />
                </Description>
                <Description term="转入时间">
                  <EditableCell
                    type="date"
                    value={transfSelfReg.ftz_ent_date && moment(transfSelfReg.ftz_ent_date).format('YYYY-MM-DD')}
                    onSave={value => this.handleInfoSave('ftz_ent_date', new Date(value))}
                  />
                </Description>
              </DescriptionList>
              <div className="card-footer">
                <Steps progressDot current={transfSelfReg.reg_status}>
                  <Step title="待转出" />
                  <Step title="终端处理" />
                  <Step title="已转入" />
                </Steps>
              </div>
            </Card>
            <MagicCard
              bodyStyle={{ padding: 0 }}

              onSizeChange={this.toggleFullscreen}
            >
              <Tabs defaultActiveKey="transitDetails">
                <TabPane tab="转移明细" key="transitDetails">
                  <DataPane
                    fullscreen={this.state.fullscreen}
                    columns={this.columns}
                    rowSelection={rowSelection}
                    indentSize={8}
                    dataSource={transfSelfReg.details}
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
