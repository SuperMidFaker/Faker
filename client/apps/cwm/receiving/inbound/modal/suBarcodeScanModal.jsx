import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Alert, Card, Table, Icon, Modal, Form, Input, Button, message } from 'antd';
import RowAction from 'client/components/RowAction';
import { viewSuBarcodeScanModal, receiveProduct } from 'common/reducers/cwmReceive';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    username: state.account.username,
    visible: state.cwmReceive.suBarScanModal.visible,
    inboundHead: state.cwmReceive.inboundFormHead,
    inboundNo: state.cwmReceive.suBarScanModal.inboundNo,
    inboundProducts: state.cwmReceive.inboundProducts,
    saveLoading: state.cwmReceive.submitting,
  }),
  { viewSuBarcodeScanModal, receiveProduct }
)
export default class SuBarcodeScanModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundProducts: PropTypes.arrayOf(PropTypes.shape({
      product_no: PropTypes.string.isRequired,
      expect_qty: PropTypes.number.isRequired,
      received_qty: PropTypes.number.isRequired,
    })).isRequired,
  }
  state = {
    inboundProductSeqMap: null,
    alertMsg: null,
    dataSource: [],
    scanRecv: {
      su_barcode: null,
      product_no: null,
      serial_no: null,
      expiry_date: null,
      attrib_1_string: null,
      qty: null,
    },
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      const inboundProductSeqMap = new Map();
      nextProps.inboundProducts.forEach((inbPrd) => {
        let productSeqMap;
        if (inboundProductSeqMap.has(inbPrd.product_no)) {
          productSeqMap = inboundProductSeqMap.get(inbPrd.product_no);
        } else {
          productSeqMap = new Map();
        }
        productSeqMap.set(inbPrd.asn_seq_no, {
          expect_qty: inbPrd.expect_qty - inbPrd.received_qty,
          received_qty: 0,
        });
        inboundProductSeqMap.set(inbPrd.product_no, productSeqMap);
      });
      const dataSource = [];
      if (window.localStorage) {
        const subarDataSource = window.localStorage.getItem('subarcode-data');
        if (subarDataSource) {
          const suDataSource = JSON.parse(subarDataSource);
          if (suDataSource && suDataSource.length > 0) {
            suDataSource.forEach((sds) => {
              if (inboundProductSeqMap.has(sds.product_no)) {
                const productSeqMap = inboundProductSeqMap.get(sds.product_no);
                const productSeqQty = productSeqMap.get(sds.asn_seq_no);
                if (productSeqQty) {
                  productSeqQty.received_qty += sds.qty;
                  productSeqMap.set(sds.asn_seq_no, productSeqQty);
                  inboundProductSeqMap.set(sds.product_no, productSeqMap);
                  dataSource.push(sds);
                }
              }
            });
          }
        }
      }
      this.setState({
        inboundProductSeqMap,
        dataSource,
      });
      if (this.suInputRef) {
        setTimeout(() => {
          this.suInputRef.focus();
        }, 100);
      }
    }
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.viewSuBarcodeScanModal({ visible: false });
    this.setState({
      inboundProductSeqMap: null,
      dataSource: [],
      scanRecv: {
        su_barcode: null,
        product_no: null,
        serial_no: null,
        expiry_date: null,
        attrib_1_string: null,
        qty: null,
      },
      alertMsg: null,
    });
    if (window.localStorage) {
      window.localStorage.removeItem('subarcode-data');
    }
  }
  handleDeleteDetail = (index) => {
    const dataSource = [...this.state.dataSource];
    const data = dataSource[index];
    const inboundProductSeqMap = new Map(this.state.inboundProductSeqMap);
    const productSeqMap = inboundProductSeqMap.get(data.product_no);
    const seqQty = productSeqMap.get(data.asn_seq_no);
    seqQty.received_qty -= data.qty;
    dataSource.splice(index, 1);
    inboundProductSeqMap.set(data.product_no, productSeqMap);
    this.setState({ dataSource, inboundProductSeqMap });
  }
  handleSubmit = () => {
    const dataSource = [...this.state.dataSource];
    const {
      loginId, inboundHead, username, inboundNo,
    } = this.props;
    const seqDataSource = new Map();
    dataSource.forEach((ds) => {
      let seqDatas = [];
      if (seqDataSource.has(ds.asn_seq_no)) {
        seqDatas = seqDataSource.get(ds.asn_seq_no);
      }
      seqDatas.push(ds);
      seqDataSource.set(ds.asn_seq_no, seqDatas);
    });
    const recvProductPromises = [];
    seqDataSource.forEach((seqDatas, seqNo) => {
      recvProductPromises.push(this.props.receiveProduct(seqDatas.map(data => ({
        inbound_qty: data.qty,
        inbound_pack_qty: data.qty,
        received_by: username,
        serial_no: data.serial_no,
        attrib_1_string: data.attrib_1_string,
        expiry_date: data.expiry_date,
        avail: true,
      })), inboundNo, seqNo, inboundHead.asn_no, loginId, new Date()));
    });
    Promise.all(recvProductPromises).then((result) => {
      if (!result.error) {
        message.success('条码收货确认成功');
        this.handleCancel();
      } else {
        message.error('操作失败');
      }
    });
  }
  handleScanReceive = () => {
    const suScan = { ...this.state.scanRecv };
    const inboundProductSeqMap = new Map(this.state.inboundProductSeqMap);
    const productSeqMap = inboundProductSeqMap.get(suScan.product_no);
    if (!productSeqMap) {
      return;
    }
    const seqNoKeys = Array.from(productSeqMap.keys());
    let remainQty = suScan.qty;
    const dataSource = [...this.state.dataSource];
    for (let i = 0; i < seqNoKeys.length; i++) {
      const seqNo = seqNoKeys[i];
      const seqQty = productSeqMap.get(seqNo);
      if (seqQty.received_qty < seqQty.expect_qty) {
        const id = `${suScan.serial_no}${seqNo}`;
        if (seqQty.received_qty + remainQty <= seqQty.expect_qty) {
          dataSource.push({
            id,
            product_no: suScan.product_no,
            serial_no: suScan.serial_no,
            expiry_date: suScan.expiry_date,
            attrib_1_string: suScan.attrib_1_string,
            qty: remainQty,
            asn_seq_no: seqNo,
          });
          seqQty.received_qty += remainQty;
          productSeqMap.set(seqNo, seqQty);
          remainQty = 0;
          break;
        } else {
          const recvQty = seqQty.expect_qty - seqQty.received_qty;
          dataSource.push({
            id,
            product_no: suScan.product_no,
            serial_no: suScan.serial_no,
            expiry_date: suScan.expiry_date,
            attrib_1_string: suScan.attrib_1_string,
            qty: recvQty,
            asn_seq_no: seqNo,
          });
          remainQty -= recvQty;
          seqQty.received_qty = seqQty.expect_qty;
          productSeqMap.set(seqNo, seqQty);
        }
      }
    }
    if (window.localStorage) {
      window.localStorage.setItem('subarcode-data', JSON.stringify(dataSource));
    }
    inboundProductSeqMap.set(suScan.product_no, productSeqMap);
    this.setState({
      scanRecv: {
        su_barcode: null,
        product_no: null,
        serial_no: null,
        expiry_date: null,
        attrib_1_string: null,
        qty: null,
      },
      dataSource,
      inboundProductSeqMap,
      alertMsg: remainQty > 0 ? `${suScan.product_no}收货数量大于订单数量` : null,
    });
    this.suInputRef.focus();
  }
  handleSuInputRef = (input) => {
    this.suInputRef = input;
    if (input) {
      setTimeout(() => {
        this.suInputRef.focus();
      }, 100);
    }
  }
  handleQtyInputRef = (input) => { this.qtyInputRef = input; }
  handleScanSuChange = (ev) => {
    /* SUD1107973470|MNOA2C0002929500|GRD28.12.2017|GRS53687924|GRP01004|14D2019.12.12|
     * SUD1107973469|MNOA2C0002929500|GRD28.12.2017|GRS53687924|GRP01003|14D2019.12.12| */
    const barcode = ev.target.value;
    const suScan = { ...this.state.scanRecv };
    if (barcode) {
      suScan.su_barcode = barcode;
    } else {
      suScan.su_barcode = null;
      suScan.product_no = null;
      suScan.serial_no = null;
      suScan.expiry_date = null;
      suScan.attrib_1_string = null;
    }
    this.setState({
      scanRecv: suScan,
    });
  }
  handleSuBarKeyDown = (ev) => {
    if (ev.key === 'Enter') {
      const suScan = { ...this.state.scanRecv };
      const barcode = suScan.su_barcode;
      suScan.serial_no = barcode.slice(3, 13);
      suScan.product_no = barcode.slice(17, 30);
      suScan.attrib_1_string = barcode.slice(34, 44);
      let splitDates = suScan.attrib_1_string.split('.');
      suScan.attrib_1_string = `${splitDates[2]}.${splitDates[1]}.${splitDates[0]}`;
      suScan.expiry_date = barcode.slice(69, 79);
      splitDates = suScan.expiry_date.split('.');
      suScan.expiry_date = new Date(
        Number(splitDates[0]),
        Number(splitDates[1]) - 1, Number(splitDates[2])
      );
      if (!suScan.serial_no || !suScan.product_no) {
        this.setState({
          scanRecv: {
            su_barcode: null,
            product_no: null,
            serial_no: null,
            expiry_date: null,
            attrib_1_string: null,
            qty: null,
          },
        });
        return;
      }
      if (!this.state.inboundProductSeqMap.has(suScan.product_no)) {
        this.setState({
          scanRecv: suScan,
          alertMsg: `订单明细无此货号:${suScan.product_no}`,
        });
        return;
      }
      if (this.state.dataSource.filter(ds => ds.serial_no === suScan.serial_no).length > 0) {
        this.setState({
          scanRecv: {
            su_barcode: null,
            product_no: null,
            serial_no: null,
            expiry_date: null,
            attrib_1_string: null,
            qty: null,
          },
          alertMsg: `序列号${suScan.serial_no}已经扫描`,
        });
        return;
      }
      if (suScan.qty) {
        this.handleScanReceive();
      } else {
        this.setState({
          scanRecv: suScan,
          alertMsg: null,
        });
        this.qtyInputRef.focus();
      }
    }
  }
  handleScanQtyChange = (ev) => {
    const qty = parseFloat(ev.target.value);
    if (!Number.isNaN(qty)) {
      const suScan = { ...this.state.scanRecv };
      suScan.qty = Number(qty);
      this.setState({
        scanRecv: suScan,
      });
    }
  }
  handleQtyKeyEnter = (ev) => {
    if (ev.key === 'Enter') {
      const suScan = { ...this.state.scanRecv };
      if (suScan.su_barcode) {
        this.handleScanReceive();
      } else {
        this.setState({
          scanRecv: suScan,
        });
        this.suInputRef.focus();
      }
    }
  }
  barColumns = [{
    title: '行号',
    dataIndex: 'asn_seq_no',
    width: 100,
  }, {
    title: '货号',
    dataIndex: 'product_no',
    width: 350,
  }, {
    title: '序列号',
    dataIndex: 'serial_no',
  }, {
    title: '收货数量',
    dataIndex: 'qty',
    width: 300,
  }, {
    title: '生产日期',
    width: 200,
    dataIndex: 'attrib_1_string',
  }, {
    title: '失效日期',
    width: 200,
    dataIndex: 'expiry_date',
    render: expiry => expiry && moment(expiry).format('YYYY.MM.DD'),
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record, index) => (<RowAction onClick={() => this.handleDeleteDetail(index)} label={<Icon type="delete" />} row={record} />),
  }]
  render() {
    const { saveLoading } = this.props;
    const { alertMsg, dataSource, scanRecv } = this.state;
    const title = (<div>
      <span>条码扫描数量确认</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>取消</Button>
        <Button disabled={dataSource.length === 0} loading={saveLoading} type="primary" onClick={this.handleSubmit}>保存</Button>
      </div>
    </div>);
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    /* const formButtonLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 4,
        },
      },
    }; */
    return (
      <Modal
        maskClosable={false}
        title={title}
        width="100%"
        wrapClassName="fullscreen-modal"
        closable={false}
        visible={this.props.visible}
        footer={null}
      >
        <Card bodyStyle={{ paddingBottom: 16 }} >
          <Form>
            {alertMsg && <Alert message={alertMsg} type="error" showIcon /> }
            <FormItem label="商品条码" {...formItemLayout}>
              <Input
                type="textarea"
                row={2}
                prefix={<Icon type="qrcode" />}
                value={scanRecv.su_barcode}
                ref={this.handleSuInputRef}
                onChange={this.handleScanSuChange}
                onKeyDown={this.handleSuBarKeyDown}
              />
            </FormItem>
            <FormItem label="商品货号" {...formItemLayout}>
              <Input value={scanRecv.product_no} readOnly />
            </FormItem>
            <FormItem label="序列号" {...formItemLayout}>
              <Input value={scanRecv.serial_no} readOnly />
            </FormItem>
            <FormItem label="生产日期" {...formItemLayout}>
              <Input value={scanRecv.attrib_1_string} readOnly />
            </FormItem>
            <FormItem label="失效日期" {...formItemLayout}>
              <Input value={scanRecv.expiry_date && moment(scanRecv.expiry_date).format('YYYY.MM.DD')} readOnly />
            </FormItem>
            <FormItem label="收货数量" {...formItemLayout}>
              <Input
                ref={this.handleQtyInputRef}
                value={scanRecv.qty}
                onChange={this.handleScanQtyChange}
                onKeyDown={this.handleQtyKeyEnter}
              />
            </FormItem>
            <FormItem label="收货时间" {...formItemLayout}>
              <Input disabled defaultValue={moment().format('YYYY.MM.DD')} />
            </FormItem>
            {/* <FormItem {...formButtonLayout}>
              <Button type="primary">保存</Button>
            </FormItem> */}
          </Form>
        </Card>
        <Card bodyStyle={{ padding: 0 }} >
          <Table
            size="middle"
            columns={this.barColumns}
            dataSource={dataSource}
            rowKey="id"
            scroll={{
              x: this.barColumns.reduce((acc, cur) =>
              acc + (cur.width ? cur.width : 240), 0),
            }}
          />
        </Card>
      </Modal>
    );
  }
}
