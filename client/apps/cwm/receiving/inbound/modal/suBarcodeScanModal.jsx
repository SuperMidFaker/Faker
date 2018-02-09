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
const NullSuScan = {
  su_barcode: null,
  product_no: null,
  serial_no: null,
  expiry_date: null,
  attrib_1_string: null,
  attrib_2_string: null,
  attrib_3_string: null,
  attrib_4_string: null,
  qty: null,
};

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
    scanRecv: NullSuScan,
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
      scanRecv: NullSuScan,
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
        expiry_date: data.expiry_date,
        attrib_1_string: data.attrib_1_string,
        attrib_2_string: data.attrib_2_string,
        attrib_3_string: data.attrib_3_string,
        attrib_4_string: data.attrib_4_string,
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
        const suData = {
          id: `${suScan.serial_no}${seqNo}`,
          product_no: suScan.product_no,
          serial_no: suScan.serial_no,
          expiry_date: suScan.expiry_date,
          attrib_1_string: suScan.attrib_1_string,
          attrib_2_string: suScan.attrib_2_string,
          attrib_3_string: suScan.attrib_3_string,
          attrib_4_string: suScan.attrib_4_string,
          asn_seq_no: seqNo,
        };
        if (seqQty.received_qty + remainQty <= seqQty.expect_qty) {
          suData.qty = remainQty;
          dataSource.push(suData);
          seqQty.received_qty += remainQty;
          productSeqMap.set(seqNo, seqQty);
          remainQty = 0;
          break;
        } else {
          const recvQty = seqQty.expect_qty - seqQty.received_qty;
          suData.qty = recvQty;
          dataSource.push(suData);
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
      scanRecv: NullSuScan,
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
    if (barcode) {
      const suScan = { ...this.state.scanRecv };
      suScan.su_barcode = barcode;
      this.setState({
        scanRecv: suScan,
      });
    } else {
      this.setState({
        scanRecv: NullSuScan,
      });
    }
  }
  handleSuBarKeyDown = (ev) => {
    if (ev.key === 'Enter') {
      const suScan = { ...this.state.scanRecv };
      const suSetting = this.props.inboundHead.su_setting;
      const suKeys = ['serial_no', 'product_no'];
      Object.keys(suSetting).forEach((suKey) => {
        if (suSetting[suKey].enabled) {
          suKeys.push(suKey);
        }
      });
      const barcode = suScan.su_barcode;
      for (let i = 0; i < suKeys.length; i++) {
        const suKey = suKeys[i];
        const suConf = suSetting[suKey];
        suScan[suKey] = barcode.slice(suConf.start, suConf.end);
        if (!suScan[suKey]) {
          this.setState({ scanRecv: NullSuScan });
          return;
        } else if (suConf.time_format) {
          const yearIndex = suConf.time_format.indexOf('YYYY');
          const monthIndex = suConf.time_format.indexOf('MM');
          const dayIndex = suConf.time_format.indexOf('DD');
          const year = suScan[suKey].slice(yearIndex, yearIndex + 4);
          const month = suScan[suKey].slice(monthIndex, monthIndex + 2);
          const day = suScan[suKey].slice(dayIndex, dayIndex + 2);
          if (suKey === 'expiry_date') {
            suScan[suKey] = new Date(Number(year), Number(month) - 1, Number(day));
          } else {
            suScan[suKey] = `${year}.${month}.${day}`;
          }
        }
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
          scanRecv: NullSuScan,
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
    const suScan = { ...this.state.scanRecv };
    if (!Number.isNaN(qty)) {
      suScan.qty = Number(qty);
      this.setState({
        scanRecv: suScan,
      });
    } else {
      suScan.qty = null;
      this.setState({ scanRecv: suScan });
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
  render() {
    const { saveLoading, inboundHead: { su_setting: suSetting } } = this.props;
    const { alertMsg, dataSource, scanRecv } = this.state;
    const barColumns = [{
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
    }].concat(Object.keys(suSetting).filter(suKey => suSetting[suKey].enabled).map((suKey) => {
      const suConf = suSetting[suKey];
      if (suKey === 'expiry_date') {
        return {
          title: '失效日期',
          width: 200,
          dataIndex: 'expiry_date',
          render: expiry => expiry && moment(expiry).format('YYYY.MM.DD'),
        };
      }
      return {
        title: suConf.display,
        width: 200,
        dataIndex: suKey,
      };
    })).concat({
      title: '操作',
      width: 100,
      fixed: 'right',
      render: (o, record, index) => (<RowAction onClick={() => this.handleDeleteDetail(index)} label={<Icon type="delete" />} row={record} />),
    });
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
                addonBefore={<Icon type="barcode" />}
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
            {Object.keys(suSetting).filter(suKey => suSetting[suKey].enabled).map((suKey) => {
              const suConf = suSetting[suKey];
              if (suKey === 'expiry_date') {
                return (<FormItem label="失效日期" {...formItemLayout} key={suKey}>
                  <Input value={scanRecv.expiry_date && moment(scanRecv.expiry_date).format('YYYY.MM.DD')} readOnly />
                </FormItem>);
              }
              return (<FormItem label={suConf.display} {...formItemLayout} key={suKey}>
                <Input value={scanRecv[suKey]} readOnly />
              </FormItem>);
            })}
            <FormItem label="收货数量" {...formItemLayout}>
              <Input
                addonBefore={<Icon type="barcode" />}
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
            columns={barColumns}
            dataSource={dataSource}
            rowKey="id"
            scroll={{
              x: barColumns.reduce((acc, cur) =>
              acc + (cur.width ? cur.width : 240), 0),
            }}
          />
        </Card>
      </Modal>
    );
  }
}
