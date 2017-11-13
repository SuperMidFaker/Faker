import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Card, Row, Col, Table, Form, Modal, Select, Tag, Input, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../../message.i18n';
import { closeNormalRelRegModal, loadParams, loadNormalSoRegs, loadNormalEntryRegs, loadNormalEntryDetails,
  loadSoRelDetails, loadNormalEntryRegDetails, newNormalRegByEntryReg, newNormalRegBySo } from 'common/reducers/cwmShFtz';

const formatMsg = format(messages);
const Search = Input.Search;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantName: state.account.tenantName,
    visible: state.cwmShFtz.normalRelRegModal.visible,
    defaultWhse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    normalSources: state.cwmShFtz.normalSources,
    loginName: state.account.username,
    units: state.cwmShFtz.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    currencies: state.cwmShFtz.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    submitting: state.cwmShFtz.submitting,
  }),
  { closeNormalRelRegModal, loadParams, loadNormalSoRegs, loadNormalEntryRegs, loadNormalEntryDetails, loadSoRelDetails, loadNormalEntryRegDetails, newNormalRegByEntryReg, newNormalRegBySo }
)
export default class NormalRelRegModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    ownerCusCode: '',
    srcType: '',
    srcFilter: { bill_no: '' },
    normalSources: [],
    relDetails: [],
    selRelDetailKeys: [],
    relDetailFilter: '',
    normalRegColumns: null,
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
    if (nextProps.normalSources !== this.props.normalSources) {
      this.setState({ normalSources: nextProps.normalSources });
    }
  }

  msg = key => formatMsg(this.props.intl, key);
  soNormalSrcColumns = [{
    title: 'SO编号',
    dataIndex: 'so_no',
    width: 150,
  }, {
    title: '客户订单号',
    dataIndex: 'cust_order_no',
  }, {
    title: '出库日期',
    width: 150,
    dataIndex: 'ftz_rel_date',
    render: o => o && moment(o).format('YYYY.MM.DD'),
  }, {
    title: '添加',
    width: 80,
    fixed: 'right',
    render: (o, record) => !record.added && <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddSoDetails(record)} />,
  }]
  ftzEntryNormalSrcColumns = [{
    title: '海关入库单号',
    dataIndex: 'ftz_ent_no',
    width: 180,
  }, {
    title: '客户订单号',
    dataIndex: 'po_no',
  }, {
    title: '添加',
    width: 80,
    fixed: 'right',
    render: (o, record) => !record.added && <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddEntryDetails(record)} />,
  }]
  ftzEntryDetailNormalSrcColumns = [{
    title: '海关入库单号',
    dataIndex: 'ftz_ent_no',
    width: 180,
  }, {
    title: '货号',
    dataIndex: 'product_no',
    width: 150,
  }, {
    title: '品名',
    dataIndex: 'g_name',
  }, {
    title: '商品编码',
    dataIndex: 'hscode',
    width: 100,
  }, {
    title: '数量',
    width: 100,
    dataIndex: 'qty',
  }, {
    title: '净重',
    width: 100,
    dataIndex: 'net_wt',
  }, {
    title: '添加',
    width: 80,
    fixed: 'right',
    render: (o, record) => !record.added && <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddSrcDetail(record)} />,
  }]
  relDetailColumns = [{
    title: '海关入库单号',
    dataIndex: 'ftz_ent_no',
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
    title: '商品编码',
    dataIndex: 'hscode',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }, {
    title: '数量',
    width: 100,
    dataIndex: 'qty',
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
    title: '删除',
    width: 80,
    fixed: 'right',
    render: (o, record) => (<span><Button type="danger" size="small" ghost icon="minus" onClick={() => this.handleDelDetail(record)} /></span>),
  }]
  handleAddSoDetails = (row) => {
    this.props.loadSoRelDetails(row.pre_entry_seq_no).then((result) => {
      if (!result.error) {
        const relDetails = this.state.relDetails.filter(reg => reg.so_no !== row.so_no).concat(result.data);
        const normalSources = this.state.normalSources.map(pr => pr.so_no === row.so_no ? { ...pr, added: true } : pr);
        this.setState({ relDetails, normalSources });
      }
    });
  }
  handleAddEntryDetails = (row) => {
    this.props.loadNormalEntryRegDetails(row.ftz_ent_no).then((result) => {
      if (!result.error) {
        const relDetails = this.state.relDetails.filter(reg => reg.ftz_ent_no !== row.ftz_ent_no).concat(result.data);
        const normalSources = this.state.normalSources.map(pr => pr.ftz_ent_no === row.ftz_ent_no ? { ...pr, added: true } : pr);
        this.setState({ relDetails, normalSources });
      }
    });
  }
  handleAddSrcDetail = (row) => {
    const relDetails = [...this.state.relDetails];
    relDetails.push(row);
    const normalSources = this.state.normalSources.map(pr => pr.id === row.id ? { ...pr, added: true } : pr);
    this.setState({ relDetails, normalSources });
  }
  handleDelDetail = (detail) => {
    const relDetails = this.state.relDetails.filter(reld => reld.id !== detail.id);
    let normalSources;
    if (this.state.srcType === 'so_no') {
      normalSources = this.state.normalSources.map(pr => pr.so_no === detail.so_no ? { ...pr, added: false } : pr);
    } else if (this.state.srcType === 'ftz_ent_no') {
      normalSources = this.state.normalSources.map(pr => pr.ftz_ent_no === detail.ftz_ent_no ? { ...pr, added: false } : pr);
    } else if (this.state.srcType === 'ftz_ent_stock') {
      normalSources = this.state.normalSources.map(pr => pr.id === detail.id ? { ...pr, added: false } : pr);
    }
    this.setState({ relDetails, normalSources });
  }
  handleRelBatchDelete = () => {
    const { selRelDetailKeys, relDetails, srcType } = this.state;
    const normalSources = [...this.state.normalSources];
    const newRelDetails = [];
    for (let i = 0; i < relDetails.length; i++) {
      const detail = relDetails[i];
      if (!selRelDetailKeys.find(key => key === detail.id)) {
        newRelDetails.push(detail);
      } else if (srcType === 'so_no') {
        normalSources.find(pr => pr.so_no === detail.so_no).added = false;
      } else if (srcType === 'ftz_ent_no') {
        normalSources.find(pr => pr.ftz_ent_no === detail.ftz_ent_no).added = false;
      } else if (srcType === 'ftz_ent_stock') {
        normalSources.find(pr => pr.id === detail.id).added = false;
      }
    }
    this.setState({
      normalSources,
      relDetails: newRelDetails,
      selRelDetailKeys: [],
    });
  }
  handleCancel = () => {
    this.setState({ ownerCusCode: '',
      srcType: '',
      normalSources: [],
      relDetails: [],
      srcFilter: {},
      relDetailFilter: '',
    });
    this.props.closeNormalRelRegModal();
  }
  handleSrcFilterChange = (field, value) => {
    const srcFilter = { ...this.state.srcFilter };
    srcFilter[field] = value;
    this.setState({ srcFilter });
  }
  handleDetailFilterChange = (ev) => {
    this.setState({ relDetailFilter: ev.target.value });
  }
  handleNormalRegSave = () => {
    const detailIds = [];
    const soCountObj = {};
    this.state.relDetails.forEach((regd) => {
      detailIds.push(regd.id);
      if (regd.so_no) {
        if (soCountObj[regd.so_no]) {
          soCountObj[regd.so_no] += 1;
        } else {
          soCountObj[regd.so_no] = 1;
        }
   // } else if (regd.ftz_ent_no) {
      }
    });
    const soCounts = Object.keys(soCountObj).map(relNo => ({
      so_no: relNo,
      count: soCountObj[relNo],
    }));
    const owner = this.props.owners.filter(own => own.customs_code === this.state.ownerCusCode)[0];
    let createNormalReg;
    if (this.state.srcType === 'so_no') {
      createNormalReg = this.props.newNormalRegBySo;
    } else {
      createNormalReg = this.props.newNormalRegByEntryReg;
    }
    createNormalReg({ detailIds, soCounts, owner: owner.id, whse_code: this.props.defaultWhse.code }).then((result) => {
      if (!result.error) {
        this.handleCancel();
        this.props.reload();
      } else {
        message.error(result.error.message);
      }
    });
  }
  handleOwnerChange = (ownerCusCode) => {
    this.setState({
      ownerCusCode,
      srcType: '',
      normalSources: [],
      srcFilter: {},
      relDetails: [],
      relDetailFilter: '',
    });
  }
  handleSrcTypeChange = (value) => {
    if (!this.state.ownerCusCode) {
      message.info('选择货主');
      return;
    }
    // so rel detail id entry detail id may equal
    let normalRegColumns;
    let relDetails = this.state.relDetails;
    if (value === 'so_no') {
      normalRegColumns = this.soNormalSrcColumns;
      relDetails = [];
    } else {
      if (value === 'ftz_ent_no') {
        normalRegColumns = this.ftzEntryNormalSrcColumns;
      } else if (value === 'ftz_ent_stock') {
        normalRegColumns = this.ftzEntryDetailNormalSrcColumns;
      }
      if (this.state.srcType === 'so_no') {
        relDetails = [];
      }
    }
    this.setState({ normalRegColumns, srcType: value, relDetails });
    this.handleLoadNormalSrc(value, {
      owner_cus_code: this.state.ownerCusCode,
      whse_code: this.props.defaultWhse.code,
    });
  }
  handleNormalSrcQuery = () => {
    const { ownerCusCode, srcFilter, srcType } = this.state;
    this.handleLoadNormalSrc(srcType, {
      owner_cus_code: ownerCusCode,
      whse_code: this.props.defaultWhse.code,
      filter: srcFilter,
    });
  }
  handleLoadNormalSrc = (srcType, query) => {
    let loadNS;
    const newQuery = query;
    if (srcType === 'so_no') {
      loadNS = this.props.loadNormalSoRegs;
    } else if (srcType === 'ftz_ent_no') {
      loadNS = this.props.loadNormalEntryRegs;
    } else if (srcType === 'ftz_ent_stock') {
      loadNS = this.props.loadNormalEntryDetails;
      if (this.state.relDetails.length > 0) {
        newQuery.filter = newQuery.filter || {};
        newQuery.filter.detailIds = this.state.relDetails.map(rd => rd.id);
      }
    }
    if (loadNS) {
      newQuery.filter = JSON.stringify(newQuery.filter);
      loadNS(newQuery);
    }
  }
  render() {
    const { submitting, owners } = this.props;
    const { srcFilter, relDetails, relDetailFilter, selRelDetailKeys, srcType, ownerCusCode } = this.state;
    let normalRegColumns = this.state.normalRegColumns;
    if (!normalRegColumns) {
      normalRegColumns = this.ftzEntryNormalSrcColumns;
    }
    const dataSource = relDetails.filter((item) => {
      if (relDetailFilter) {
        const reg = new RegExp(relDetailFilter);
        return reg.test(item.ftz_ent_no);
      } else {
        return true;
      }
    });
    const srcSearchTool = [];
    if (srcType === 'so_no') {
      srcSearchTool.push(
        <Input key="ftz_ent_no" value={srcFilter.bill_no} placeholder="客户订单号"
          onChange={ev => this.handleSrcFilterChange('bill_no', ev.target.value)} style={{ width: 200 }}
        />
      );
    } else if (srcType === 'ftz_ent_no') {
      srcSearchTool.push(
        <Input key="ftz_ent_no" value={srcFilter.bill_no} placeholder="海关入库单号"
          onChange={ev => this.handleSrcFilterChange('bill_no', ev.target.value)} style={{ width: 200 }}
        />
      );
    } else if (srcType === 'ftz_ent_stock') {
      srcSearchTool.push(
        <Input key="ftz_ent_no" value={srcFilter.bill_no} placeholder="海关入库单号"
          onChange={ev => this.handleSrcFilterChange('bill_no', ev.target.value)} style={{ width: 200 }}
        />,
        <Input key="product_no" value={srcFilter.product_no} placeholder="货号"
          onChange={ev => this.handleSrcFilterChange('product_no', ev.target.value)} style={{ width: 200, marginLeft: 8 }}
        />,
      );
    }
    const relDetailRowSelection = {
      selectedRowKeys: selRelDetailKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selRelDetailKeys: selectedRowKeys });
      },
    };
    const title = (<div>
      <span>新建普通出库备案</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>取消</Button>
        <Button type="primary" disabled={this.state.relDetails.length === 0} loading={submitting} onClick={this.handleNormalRegSave}>保存</Button>
      </div>
    </div>);
    return (
      <Modal maskClosable={false} title={title} width="100%" wrapClassName="fullscreen-modal" closable={false}
        footer={null} visible={this.props.visible}
      >
        <Form layout="inline">
          <Row gutter={8}>
            <Col sm={24} md={8} lg={10}>
              <Card title={<div>
                <Select size="small" placeholder="货主" onChange={this.handleOwnerChange} style={{ width: 200 }} value={ownerCusCode}>
                  {owners.map(owner => (<Option value={owner.customs_code} key={owner.customs_code}>{owner.name}</Option>))}
                </Select>
                <Select size="small" value={srcType} placeholder="业务单据类型" style={{ width: 160, fontSize: 16, marginLeft: 20 }}
                  onSelect={this.handleSrcTypeChange}
                >
                  <Option key="so_no">出货订单</Option>
                  <Option key="ftz_ent_no">海关入库单</Option>
                  <Option key="ftz_ent_stock">保税库存</Option>
                </Select>
              </div>} bodyStyle={{ padding: 0 }}
              >
                <div className="table-panel table-fixed-layout">
                  {srcSearchTool.length > 0 && <div className="toolbar">
                    {srcSearchTool}
                    <Button icon="search" onClick={this.handleNormalSrcQuery} style={{ marginLeft: 8 }} />
                  </div>}
                  <Table columns={normalRegColumns} dataSource={this.state.normalSources} rowKey="id"
                    scroll={{ x: normalRegColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
                  />
                </div>
              </Card>
            </Col>
            <Col sm={24} md={16} lg={14}>
              <Card title="出库备案明细" bodyStyle={{ padding: 0 }}>
                <div className="table-panel table-fixed-layout">
                  <div className="toolbar">
                    <Search placeholder="海关入库单号" style={{ width: 200 }} onChange={this.handleDetailFilterChange} value={relDetailFilter} />
                    <div className={`bulk-actions ${selRelDetailKeys.length === 0 ? 'hide' : ''}`}>
                      <h3>已选中{selRelDetailKeys.length}项</h3>
                      {selRelDetailKeys.length !== 0 && <Button onClick={this.handleRelBatchDelete}>批量删除</Button>}
                    </div>
                  </div>
                  <Table columns={this.relDetailColumns} dataSource={dataSource} rowKey="id" rowSelection={relDetailRowSelection}
                    scroll={{ x: this.relDetailColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
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
