import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Card, Table, Switch, Form, Modal, Row, Col, Radio, Select, Tag, Input, message } from 'antd';
import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import messages from '../../../message.i18n';
import { closeBatchDeclModal, loadParams, loadDeclEntries, loadBatchRegDetails, beginBatchDecl } from 'common/reducers/cwmShFtz';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Search = Input.Search;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    head: state.cmsManifest.billHead,
    visible: state.cmsManifestImport.declBodyModal.visible,
    submitting: state.cmsManifestImport.submitting,
    declEntries: state.cmsManifestImport.declEntries,
    units: state.cmsManifest.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    currencies: state.cmsManifest.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    tradeCountries: state.cmsManifest.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
      search: `${tc.cntry_co}${tc.cntry_name_en}${tc.cntry_name_cn}${tc.cntry_en_short}`,
    })),
    trxModes: state.cmsManifest.params.trxModes.map(tx => ({
      value: tx.trx_mode,
      text: tx.trx_spec,
    })),
    exemptions: state.cmsManifest.params.exemptionWays.map(ep => ({
      value: ep.value,
      text: ep.text,
      search: `${ep.value}${ep.text}`,
    })),
  }),
  { closeBatchDeclModal, loadParams, loadDeclEntries, loadBatchRegDetails, beginBatchDecl }
)
export default class DeclBodyImportModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    clearDateRange: [],
    cusDeclNo: '',
    declEntries: [],
    regDetails: [],
    supplier: '',
    currency: '',
    ftzRelNo: '',
    selectedRowKeys: [],
    selectedRows: [],
    destCountry: '142',
    dutyMode: '1',
  }
  componentWillMount() {
    this.props.loadParams();
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: (window.innerHeight - 460),
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.declEntries !== this.props.declEntries) {
      this.setState({ declEntries: nextProps.declEntries });
    }
  }

  msg = key => formatMsg(this.props.intl, key);
  portionRegColumns = [{
    title: '出库单号',
    dataIndex: 'ftz_rel_no',
  }, {
    title: '货主',
    dataIndex: 'owner_name',
    width: 200,
  }, {
    title: '收货单位',
    dataIndex: 'receiver_name',
    width: 200,
  }, {
    title: '出库日期',
    dataIndex: 'ftz_rel_date',
    render: o => o && moment(o).format('YYYY.MM.DD'),
    width: 180,
  }, {
    title: '添加',
    width: 80,
    fixed: 'right',
    render: (o, record) => !record.added && <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddReg(record)} />,
  }]

  regDetailColumns = [{
    title: '出库单号',
    dataIndex: 'ftz_rel_no',
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
  }, {
    title: '出库明细ID',
    dataIndex: 'ftz_rel_detail_id',
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
    render: o => <TrimSpan text={o} maxLen={30} />,
    width: 260,
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
    title: '供货商',
    width: 100,
    dataIndex: 'supplier',
  }, {
    title: '成交方式',
    width: 100,
    dataIndex: 'trxn_mode',
    render: (o) => {
      const mode = this.props.trxModes.filter(cur => cur.value === o)[0];
      const text = mode ? `${mode.value}| ${mode.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
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
    title: '目的国',
    dataIndex: 'dest_country',
    width: 150,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      return country ? <Tag>{`${country.value}| ${country.text}`}</Tag> : o;
    },
  }, {
    title: '删除',
    width: 80,
    fixed: 'right',
    render: (o, record) => (<span><Button type="danger" size="small" ghost icon="minus" onClick={() => this.handleDelDetail(record)} /></span>),
  }]
  handleAddReg = (row) => {
    this.props.loadBatchRegDetails(row.pre_entry_seq_no).then((result) => {
      if (!result.error) {
        const cusDeclNo = row.ftz_rel_no;
        const regDetails = this.state.regDetails.filter(reg => reg.ftz_rel_no !== cusDeclNo).concat(
          result.data.map(dt => ({ ...dt, ftz_rel_no: cusDeclNo })));
        const declEntries = this.state.declEntries.map(pr => pr.ftz_rel_no === cusDeclNo ? { ...pr, added: true } : pr);
        this.setState({ regDetails, declEntries });
      }
    });
  }
  handleDelDetail = (detail) => {
    const regDetails = this.state.regDetails.filter(reg => reg.ftz_rel_detail_id !== detail.ftz_rel_detail_id);
    const declEntries = this.state.declEntries.map(pr => pr.ftz_rel_no === detail.ftz_rel_no ? { ...pr, added: false } : pr);
    this.setState({ regDetails, declEntries });
    message.info(`出库明细ID${detail.ftz_rel_detail_id}已删除`);
  }
  batchDelete = () => {
    const { selectedRows, regDetails } = this.state;
    const declEntries = [...this.state.declEntries];
    const newRegDetails = [];
    for (let i = 0; i < regDetails.length; i++) {
      const detail = regDetails[i];
      if (!selectedRows.find(seldetail => seldetail.ftz_rel_detail_id === detail.ftz_rel_detail_id)) {
        newRegDetails.push(detail);
      } else {
        declEntries.find(pr => pr.ftz_rel_no === detail.ftz_rel_no).added = false;
      }
    }
    this.setState({
      declEntries,
      regDetails: newRegDetails,
      selectedRowKeys: [],
      selectedRows: [],
    });
  }
  handleCancel = () => {
    this.setState({
      declEntries: [],
      regDetails: [],
      cusDeclNo: '',
      clearDateRange: [],
      destCountry: '',
      dutyMode: '',
    });
    this.props.closeBatchDeclModal();
    this.props.form.resetFields();
  }
  handleCusDeclNoChange = (ev) => {
    this.setState({ cusDeclNo: ev.target.value });
  }
  handleClearRangeChange = (clearDateRange) => {
    this.setState({ clearDateRange });
  }
  handleCusDeclQuery = () => {
    const { owner, ietype, cusDeclNo/* , clearDateRange*/ } = this.state;
    this.props.loadDeclEntries({
      owner,
      entry_no: cusDeclNo,
      ietype: ietype === 'import' ? 0 : 1,
      /*start_date: clearDateRange.length === 2 ? clearDateRange[0].valueOf() : undefined,
      end_date: clearDateRange.length === 2 ? clearDateRange[1].valueOf() : undefined,*/
    });
  }
  handleBatchDecl = () => {
    const detailIds = [];
    const relCountObj = {};
    this.state.regDetails.forEach((regd) => {
      detailIds.push(regd.id);
      if (relCountObj[regd.ftz_rel_no]) {
        relCountObj[regd.ftz_rel_no] += 1;
      } else {
        relCountObj[regd.ftz_rel_no] = 1;
      }
    });
    const relCounts = Object.keys(relCountObj).map(cusDeclNo => ({
      rel_no: cusDeclNo,
      count: relCountObj[cusDeclNo],
    }));
    const { destCountry, dutyMode } = this.state;
    this.props.form.validateFields((errors, values) => {
      this.props.beginBatchDecl({
        detailIds,
        relCounts,
        ietype: values.ietype,
        destCountry,
        dutyMode,
      }).then((result) => {
        if (!result.error) {
          this.handleCancel();
          this.props.reload();
          this.props.form.resetFields();
        } else {
          message.error(result.error.message);
        }
      });
    });
  }
  handleFtzRelNoChange = (ev) => {
    this.setState({ ftzRelNo: ev.target.value });
  }
  handleDutyModeChange = (dutyMode) => {
    this.setState({ dutyMode });
  }
  handleDestCountryChange = (destCountry) => {
    this.setState({ destCountry });
  }
  render() {
    const { submitting, exemptions, tradeCountries, head } = this.props;
    const { cusDeclNo, regDetails, dutyMode, destCountry } = this.state;
    const dataSource = regDetails.filter((item) => {
      if (this.state.ftzRelNo) {
        const reg = new RegExp(this.state.ftzRelNo);
        return reg.test(item.ftz_rel_no);
      } else {
        return true;
      }
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      selectedRows: this.state.selectedRows,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
      },
    };
    const title = (<div>
      <span>添加已报关清单表体</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>取消</Button>
        <Button type="primary" loading={submitting} disabled={this.state.regDetails.length === 0} onClick={this.handleBatchDecl}>标记保存</Button>
        <Button type="primary" loading={submitting} disabled={this.state.regDetails.length === 0} onClick={this.handleBatchDecl}>只复用</Button>
      </div>
    </div>);
    return (
      <Modal title={title} width="100%" maskClosable={false} wrapClassName="fullscreen-modal" closable={false}
        footer={null} visible={this.props.visible}
      >
        <Card noHovering bodyStyle={{ paddingBottom: 16 }}>
          <Form className="form-layout-compact">
            <Row gutter={16}>
              <Col span={5}>
                <FormItem label="客户">
                  <Input defaultValue={`${head.owner_cus_code}|${head.owner_name}`} />
                </FormItem>
              </Col>
              <Col span={5} offset={1}>
                <FormItem label="委托号">
                  <Input value={this.delg_no} />
                </FormItem>
              </Col>
              <Col span={5} offset={1}>
                <FormItem label="成交方式">
                  <Input value={this.delg_no} />
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Card>
        <Form layout="inline">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="原始报关单" bodyStyle={{ padding: 0 }} noHovering>
                <div className="table-panel table-fixed-layout">
                  <div className="toolbar">
                    <FormItem label="过滤已报关">
                      <Switch checked />
                    </FormItem>
                    <FormItem label="报关单号">
                      <Input value={cusDeclNo} onChange={this.handleCusDeclNoChange} />
                    </FormItem>
                    <FormItem>
                      <RadioGroup onChange={this.handleIetypeChange} value="import">
                        <RadioButton value="import">进口</RadioButton>
                        <RadioButton value="export">出口</RadioButton>
                      </RadioGroup>
                    </FormItem>
                    <Button type="primary" ghost size="large" onClick={this.handleCusDeclQuery}>查找</Button>
                  </div>
                  <Table columns={this.portionRegColumns} dataSource={this.state.declEntries} rowKey="id"
                    scroll={{ x: this.portionRegColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
                  />
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="已选报关表体" bodyStyle={{ padding: 0 }} noHovering>
                <div className="table-panel table-fixed-layout">
                  <div className="toolbar">
                    <Search size="large" placeholder="报关单号" style={{ width: 200 }} onChange={this.handleFtzRelNoChange}
                      onSearch={this.handleSearch} value={this.state.ftzRelNo}
                    />
                    {this.state.selectedRowKeys.length !== 0 && <Button onClick={this.batchDelete}>批量删除</Button>}
                    <div className="toolbar-right">
                      <FormItem label="征免方式">
                        <Select showSearch showArrow optionFilterProp="search" value={dutyMode} onChange={this.handleDutyModeChange} style={{ width: 100 }} >
                          {
                            exemptions.map(data => (
                              <Option key={data.value} search={`${data.search}`} >
                                {`${data.value}|${data.text}`}
                              </Option>)
                            )}
                        </Select>
                      </FormItem>
                      <FormItem label="最终目的国">
                        <Select showSearch showArrow optionFilterProp="search" value={destCountry} onChange={this.handleDestCountryChange} style={{ width: 100 }}>
                          {
                            tradeCountries.map(data => (
                              <Option key={data.value} search={`${data.search}`} >
                                {`${data.value}|${data.text}`}
                              </Option>)
                            )}
                        </Select>
                      </FormItem>
                    </div>
                  </div>
                  <Table columns={this.regDetailColumns} dataSource={dataSource} rowKey="id" rowSelection={rowSelection}
                    scroll={{ x: this.regDetailColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
