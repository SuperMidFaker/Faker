import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { notification, Card, Table, Icon, Modal, Form, Input, Button, message } from 'antd';
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
    inboundProducts: state.cwmReceive.inboundProducts,
    inboundNo: state.cwmReceive.receiveModal.inboundNo,
    saveLoading: state.cwmReceive.submitting,
  }),
  { viewSuBarcodeScanModal, receiveProduct }
)
export default class SuBarcodeScanModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundNo: PropTypes.string.isRequired,
    inboundProducts: PropTypes.arrayOf(PropTypes.shape({
      product_no: PropTypes.string.isRequired,
      expect_qty: PropTypes.number.isRequired,
      received_qty: PropTypes.number.isRequired,
    })).isRequired,
  }
  state = {
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
  }
  componentDidMount() {
    if (this.suInputRef) {
      this.suInputRef.focus();
    }
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
      this.setState({
        inboundProductSeqMap,
      });
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
    });
  }
  handleProductPutAway = (index, value, location) => {
    const dataSource = [...this.state.dataSource];
    dataSource[index].location = value;
    if (location) {
      dataSource[index].priority = Number(location.status);
    }
    this.setState({ dataSource });
  }
  handleConveyChange = (index, value) => {
    const dataSource = [...this.state.dataSource];
    dataSource[index].convey_no = value;
    this.setState({ dataSource });
  }
  handleReceiverChange = (index, value) => {
    const dataSource = [...this.state.dataSource];
    dataSource[index].received_by = value;
    this.setState({ dataSource });
  }
  handleProductReceive = (index, value) => {
    const receivePack = Number(parseFloat(value));
    if (!Number.isNaN(receivePack)) {
      const inboundProduct = this.props.inboundProduct;
      let { receivedQty, receivedPackQty } = this.state;
      const dataSource = [...this.state.dataSource];
      const remainQty = inboundProduct.expect_qty - receivedQty;
      const remainPackQty = inboundProduct.expect_pack_qty - receivedPackQty;
      const changeQty = receivePack * inboundProduct.sku_pack_qty - dataSource[index].inbound_qty;
      const changePackQty = receivePack - dataSource[index].inbound_pack_qty;
      dataSource[index].avail = remainQty >= 0;
      if (remainQty < 0 && changeQty < 0 && changeQty <= remainQty) {
        for (let i = 0; i < dataSource.length; i++) {
          dataSource[i].avail = true;
        }
      }
      if (changeQty > remainQty && remainQty >= 0) {
        dataSource[index].inbound_pack_qty += remainPackQty;
        dataSource[index].inbound_qty += remainQty;
        dataSource.push(Object.assign({}, dataSource[index], {
          inbound_qty: changeQty - remainQty,
          inbound_pack_qty: changePackQty - remainPackQty,
          avail: false,
        }));
        if (dataSource[index].inbound_pack_qty === 0) {
          dataSource.splice(index, 1);
        }
      } else {
        dataSource[index].inbound_pack_qty = receivePack;
        dataSource[index].inbound_qty = receivePack * inboundProduct.sku_pack_qty;
      }
      receivedQty += changeQty;
      receivedPackQty += changePackQty;
      this.setState({
        dataSource,
        receivedQty,
        receivedPackQty,
      });
    }
  }
  handleDamageLevelChange = (index, value) => {
    const dataSource = [...this.state.dataSource];
    dataSource[index].damage_level = value;
    this.setState({ dataSource });
  }
  handleReceivedDateChange = (date) => {
    this.setState({ receivedDate: date.toDate() });
  }
  handleAvailChange = (index, value) => {
    const dataSource = [...this.state.dataSource];
    dataSource[index].avail = value === 'avail';
    this.setState({ dataSource });
  }
  handleAdd = () => {
    const dataSource = [...this.state.dataSource];
    const newDetail = {
      id: `${this.props.productNo}${dataSource.length + 1}`,
      inbound_qty: 0,
      inbound_pack_qty: 0,
      location: '',
      priority: null,
      damage_level: 0,
      avail: this.props.inboundProduct.expect_qty > this.state.receivedQty,
      received_by: this.props.username,
    };
    dataSource.push(newDetail);
    this.setState({ dataSource });
  }
  handleDeleteDetail = (index) => {
    const dataSource = [...this.state.dataSource];
    let { receivedQty, receivedPackQty } = this.state;
    receivedQty -= dataSource[index].inbound_qty;
    receivedPackQty -= dataSource[index].inbound_pack_qty;
    dataSource.splice(index, 1);
    this.setState({ dataSource, receivedQty, receivedPackQty });
  }
  handleSubmit = () => {
    const dataSource = [...this.state.dataSource];
    if (dataSource.find(data => data.inbound_pack_qty === 0)) {
      message.error('收货数量不能等于零');
      return;
    }
    const notificationkey = 'unexpect-receive';
    const btn = (
      <Button
        type="primary"
        size="small"
        onClick={() => {
        notification.close(notificationkey);
        this.handleConfirmReceive();
      }}
      >
        确定
      </Button>
    );
    if (this.state.receivedQty > this.props.inboundProduct.expect_qty) {
      notification.warning({
        message: '实收数量大于预期数量',
        description: '确定按超量完成收货?',
        btn,
        key: notificationkey,
      });
    } else if (this.state.receivedQty < this.props.inboundProduct.expect_qty) {
      notification.warning({
        message: '实收数量少于预期数量',
        description: '确定按缺量完成收货?',
        btn,
        key: notificationkey,
      });
    } else {
      this.handleConfirmReceive();
    }
  }
  handleConfirmReceive = () => {
    const {
      loginId, inboundNo, inboundProduct, inboundHead,
    } = this.props;
    this.props.receiveProduct(this.state.dataSource.filter(data => !data.trace_id).map(data => ({
      location: data.location,
      damage_level: data.damage_level,
      inbound_qty: data.inbound_qty,
      inbound_pack_qty: data.inbound_pack_qty,
      convey_no: data.convey_no,
      avail: data.avail,
      received_by: data.received_by,
      serial_no: data.serial_no,
      attrib_1_string: data.attrib_1_string,
      attrib_2_string: data.attrib_2_string,
      attrib_3_string: data.attrib_3_string,
      attrib_4_string: data.attrib_4_string,
      priority: data.priority,
    })), inboundNo, inboundProduct.asn_seq_no, inboundHead.asn_no, loginId, this.state.receivedDate).then((result) => {
      if (!result.error) {
        message.success('收货确认成功');
        this.props.hideReceiveModal();
      } else {
        message.error('操作失败');
      }
    });
  }
  handleSerialNoChange = (index, value) => {
    const dataSource = [...this.state.dataSource];
    dataSource[index].serial_no = value;
    this.setState({ dataSource });
  }
  handleAttrChange = (index, value, dataIndex) => {
    const dataSource = [...this.state.dataSource];
    dataSource[index][dataIndex] = value;
    this.setState({ dataSource });
  }
  handleSuInputRef = (input) => { this.suInputRef = input; }
  handleQtyInputRef = (input) => { this.qtyInputRef = input; }
  handleScanSuChange = (ev) => {
    /* SUD1107973470|MNOA2C0002929500|GRD28.12.2017|GRS53687924|GRP01004|14D2019.12.12|
     * SUD1107973469|MNOA2C0002929500|GRD28.12.2017|GRS53687924|GRP01003|14D2019.12.12| */
    console.log(ev);
    const barcode = ev.target.value;
    const suScan = { ...this.state.scanRecv };
    suScan.su_barcode = barcode;
    suScan.serial_no = barcode.slice(3, 14);
    suScan.product_no = barcode.slice(18, 31);
    suScan.attrib_1_string = barcode.slice(35, 46);
    let splitDates = suScan.attrib_1_string.split('.');
    suScan.attrib_1_string = `${splitDates[2]}.${splitDates[1]}.${splitDates[0]}`;
    suScan.expiry_date = barcode.slice(70, 81);
    splitDates = suScan.expiry_date.split('.');
    suScan.expiry_date = new Date(
      Number(splitDates[0]),
      Number(splitDates[1]) - 1, Number(splitDates[2])
    );
    if (suScan.qty) {
      this.handleScanReceive();
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
      this.suInputRef.focus();
    } else {
      this.setState({
        scanRecv: suScan,
      });
      this.qtyInputRef.focus();
    }
  }
  handleScanQtyChange = (ev) => {
    console.log(ev);
    const qty = ev.target.value;
    const suScan = { ...this.state.scanRecv };
    suScan.qty = Number(qty);
    if (suScan.su_barcode) {
      this.handleScanReceive();
    } else {
      this.setState({
        scanRecv: suScan,
      });
      this.suInputRef.focus();
    }
  }
  barColumns = [{
    title: '货号',
    dataIndex: 'product_no',
    width: 200,
    render: o => (<Input className="readonly" value={o} disabled />),
  }, {
    title: '序列号',
    width: 150,
    dataIndex: 'serial_no',
    render: o => (<Input className="readonly" prefix={<Icon type="barcode" />} value={o} />),
  }, {
    title: '收货数量',
    dataIndex: 'inbound_qty',
    width: 220,
    render: o => (<Input className="readonly" value={o} />),
  }, {
    title: '生产日期',
    width: 100,
    dataIndex: 'attrib_1_string',
    render: o => <Input value={o} className="readonly" />,
  }, {
    title: '失效日期',
    width: 100,
    dataIndex: 'expiry_date',
    render: expiry => <Input value={expiry && moment(expiry).format('YYYY.MM.DD')} className="readonly" />,
  }, {
    title: '操作',
    width: 50,
    fixed: 'right',
    render: (o, record, index) => (<RowAction onClick={() => this.handleDeleteDetail(index)} label={<Icon type="delete" />} row={record} />),
  }]
  render() {
    const { saveLoading } = this.props;
    const { dataSource, scanRecv } = this.state;
    const title = (<div>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>取消</Button>
        <Button disabled={dataSource.length === 0} loading={saveLoading} type="primary" onClick={this.handleSubmit}>保存</Button>
      </div>
    </div>);
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const formButtonLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };
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
            <FormItem label="商品条码" {...formItemLayout}>
              <Input prefix={<Icon type="qrcode" />} type="textarea" row={2} value={scanRecv.su_barcode} ref={this.handleSuInputRef} onChange={this.handleScanSuChange} />
            </FormItem>
            <FormItem label="商品货号" {...formItemLayout}>
              <Input value={scanRecv.product_no} className="readonly" />
            </FormItem>
            <FormItem label="序列号" {...formItemLayout}>
              <Input value={scanRecv.serial_no} className="readonly" />
            </FormItem>
            <FormItem label="生产日期" {...formItemLayout}>
              <Input value={scanRecv.attrib_1_string} className="readonly" />
            </FormItem>
            <FormItem label="失效日期" {...formItemLayout}>
              <Input value={scanRecv.expiry_date && moment(scanRecv.expiry_date).format('YYYY.MM.DD')} className="readonly" />
            </FormItem>
            <FormItem label="收货数量" {...formItemLayout}>
              <Input
                ref={this.handleQtyInputRef}
                value={scanRecv.qty}
                onChange={this.handleScanQtyChange}
              />
            </FormItem>
            <FormItem label="收货时间" {...formItemLayout}>
              <Input disabled defaultValue={moment().format('YYYY.MM.DD')} />
            </FormItem>
            <FormItem {...formButtonLayout}>
              <Button type="primary">保存</Button>
            </FormItem>
          </Form>
        </Card>
        <Card bodyStyle={{ padding: 0 }} >
          <Table
            size="middle"
            columns={this.barColumns}
            dataSource={dataSource}
            rowKey="id"
            scroll={{ x: this.barColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0) }}
          />
        </Card>
      </Modal>
    );
  }
}
