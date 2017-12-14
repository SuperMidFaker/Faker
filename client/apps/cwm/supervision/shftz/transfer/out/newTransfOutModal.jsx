import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Card, Row, Col, Table, Form, Modal, Select, Tag, Input, message } from 'antd';
import { closeNewTransfOutModal, loadParams, loadNormalSoRegs,
  loadSoRelDetails, newTransfOutRegBySo } from 'common/reducers/cwmShFtz';

const Search = Input.Search;
const Option = Select.Option;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cwmShFtz.newTransfOutModal.visible,
    defaultWhse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    transferSource: state.cwmShFtz.normalSources,
    units: state.cwmShFtz.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    currencies: state.cwmShFtz.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    receivers: state.cwmContext.whseAttrs.receivers.filter(recv =>
      recv.customs_code && recv.ftz_whse_code && recv.name),
    submitting: state.cwmShFtz.submitting,
  }),
  {
    closeNewTransfOutModal, loadParams, loadNormalSoRegs, loadSoRelDetails, newTransfOutRegBySo,
  }
)
export default class NewTransfOutModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    ownerCusCode: '',
    receiverCode: '',
    srcFilter: { bill_no: '' },
    transferSource: [],
    relDetails: [],
    selRelDetailKeys: [],
    relDetailFilter: '',
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
    if (nextProps.transferSource !== this.props.transferSource) {
      this.setState({ transferSource: nextProps.transferSource });
    }
  }
  srcAddedMap = {}
  soSrcColumns = [{
    title: 'SO编号',
    dataIndex: 'so_no',
    width: 150,
  }, {
    title: '客户单号',
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
    render: (o, record) => !this.srcAddedMap[record.so_no] &&
    <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddSoDetails(record)} />,
  }]
  relDetailColumns = [{
    title: '海关入库单号',
    dataIndex: 'ftz_ent_no',
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
    render: (o, record) => (<Button type="danger" size="small" ghost icon="minus" onClick={() => this.handleDelDetail(record)} />),
  }]
  handleAddSoDetails = (row) => {
    this.props.loadSoRelDetails(row.pre_entry_seq_no).then((result) => {
      if (!result.error) {
        const relDetails = this.state.relDetails.filter(reg => reg.so_no !== row.so_no).concat(result.data);
        this.srcAddedMap[row.so_no] = true;
        this.setState({ relDetails });
      }
    });
  }
  handleDelDetail = (detail) => {
    const relDetails = this.state.relDetails.filter(reld => reld.id !== detail.id);
    this.srcAddedMap[detail.so_no] = false;
    this.setState({ relDetails });
  }
  handleRelBatchDelete = () => {
    const { selRelDetailKeys, relDetails } = this.state;
    const newRelDetails = [];
    for (let i = 0; i < relDetails.length; i++) {
      const detail = relDetails[i];
      if (!selRelDetailKeys.find(key => key === detail.id)) {
        newRelDetails.push(detail);
      }
      this.srcAddedMap[detail.so_no] = false;
    }
    this.setState({
      relDetails: newRelDetails,
      selRelDetailKeys: [],
    });
  }
  handleCancel = () => {
    this.setState({
      ownerCusCode: '',
      receiverCode: '',
      transferSource: [],
      relDetails: [],
      srcFilter: {},
      relDetailFilter: '',
    });
    this.srcAddedMap = {};
    this.props.closeNewTransfOutModal();
  }
  handleSrcFilterChange = (field, value) => {
    const srcFilter = { ...this.state.srcFilter };
    srcFilter[field] = value;
    this.setState({ srcFilter });
  }
  handleDetailFilterChange = (ev) => {
    this.setState({ relDetailFilter: ev.target.value });
  }
  handleTransfOutSave = () => {
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
      }
    });
    const soCounts = Object.keys(soCountObj).map(relNo => ({
      so_no: relNo,
      count: soCountObj[relNo],
    }));
    const owner = this.props.owners.filter(own => own.customs_code === this.state.ownerCusCode)[0];
    this.props.newTransfOutRegBySo({
      detailIds, soCounts, owner: owner.id, whse_code: this.props.defaultWhse.code, receiver: this.state.receiverCode,
    }).then((result) => {
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
      transferSource: [],
      srcFilter: {},
      relDetails: [],
      relDetailFilter: '',
    });
    this.props.loadNormalSoRegs({
      owner_cus_code: ownerCusCode,
      whse_code: this.props.defaultWhse.code,
      filter: {},
    });
  }
  handleReceiverChange = (receiverCode) => {
    this.setState({ receiverCode });
  }
  handleRegSrcQuery = () => {
    const { srcFilter } = this.state;
    const transferSource = this.props.transferSource.filter(tfs => !srcFilter.bill_no || tfs.cust_order_no === srcFilter.bill_no);
    this.setState({ transferSource });
  }
  render() {
    const { submitting, owners, receivers } = this.props;
    const {
      srcFilter, relDetails, relDetailFilter, selRelDetailKeys, ownerCusCode, receiverCode,
    } = this.state;
    const dataSource = relDetails.filter((item) => {
      if (relDetailFilter) {
        const reg = new RegExp(relDetailFilter);
        return reg.test(item.ftz_ent_no);
      } else {
        return true;
      }
    });
    const relDetailRowSelection = {
      selectedRowKeys: selRelDetailKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selRelDetailKeys: selectedRowKeys });
      },
    };
    const title = (<div>
      <span>新建区内移库转出</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>取消</Button>
        <Button type="primary" disabled={this.state.relDetails.length === 0} loading={submitting} onClick={this.handleTransfOutSave}>保存</Button>
      </div>
    </div>);
    return (
      <Modal maskClosable={false} title={title} width="100%" wrapClassName="fullscreen-modal" closable={false}
        footer={null} visible={this.props.visible}
      >
        <Card hoverable={false} bodyStyle={{ paddingBottom: 16 }}>
          <Form layout="inline" className="form-layout-compact">
            <FormItem label="货主">
              <Select onChange={this.handleOwnerChange} value={ownerCusCode} allowClear style={{ width: 200 }}>
                {owners.map(owner => (<Option value={owner.customs_code} key={owner.customs_code}>{owner.name}</Option>))}
              </Select>
            </FormItem>
            <FormItem label="收货仓库">
              <Select onChange={this.handleReceiverChange} value={receiverCode} allowClear style={{ width: 200 }}>
                {receivers.map(recv => (<Option key={recv.code} value={recv.code}>{recv.customs_code} | {recv.name} | {recv.ftz_whse_code}</Option>))}
              </Select>
            </FormItem>
          </Form>
        </Card>
        <Form layout="inline">
          <Row gutter={8}>
            <Col sm={24} md={8} lg={10}>
              <Card title="出库单" bodyStyle={{ padding: 0 }}>
                <div className="table-panel table-fixed-layout">
                  <div className="toolbar">
                    <Input key="ftz_ent_no" value={srcFilter.bill_no} placeholder="客户单号"
                      onChange={ev => this.handleSrcFilterChange('bill_no', ev.target.value)} style={{ width: 200 }}
                    />
                    <Button icon="search" onClick={this.handleRegSrcQuery} style={{ marginLeft: 8 }} />
                  </div>
                  <Table columns={this.soSrcColumns} dataSource={this.state.transferSource} rowKey="id"
                    scroll={{ x: this.soSrcColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
                  />
                </div>
              </Card>
            </Col>
            <Col sm={24} md={16} lg={14}>
              <Card title="转出明细" bodyStyle={{ padding: 0 }}>
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
