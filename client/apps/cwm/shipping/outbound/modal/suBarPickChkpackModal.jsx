import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Alert, Card, Table, Tooltip, Tag, Icon, Modal, Form, Input, Button, message } from 'antd';
import RowAction from 'client/components/RowAction';
import Audio from 'browser-audio';
import { showSubarPickChkModal, pickConfirm, loadPackedNoDetails } from 'common/reducers/cwmOutbound';
import printPackListPdf from '../billsPrint/printPackingList';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cwmOutbound.subarPickChkModal.visible,
    pickDetails: state.cwmOutbound.pickDetails,
    saveLoading: state.cwmOutbound.submitting,
  }),
  { showSubarPickChkModal, pickConfirm, loadPackedNoDetails }
)
export default class SuBarPickChkpackModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
    pickDetails: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      product_no: PropTypes.string.isRequired,
      trace_id: PropTypes.string.isRequired,
      serial_no: PropTypes.string.isRequired,
      alloc_qty: PropTypes.number.isRequired,
      picked_qty: PropTypes.number.isRequired,
      packed_no: PropTypes.string,
    })).isRequired,
  }
  state = {
    serialDetailMap: new Map(),
    alertMsg: null,
    dataSource: [],
    packedNo: null,
  }
  componentDidMount() {
    this.warnAudio = Audio.create(`${__CDN__}/assets/img/error.mp3`);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      const serialDetailMap = new Map();
      nextProps.pickDetails.forEach((pick) => {
        let details = [{
          id: pick.id,
          trace_id: pick.trace_id,
          qty: pick.alloc_qty - pick.picked_qty,
          packed_no: pick.packed_no,
        }];
        if (serialDetailMap.has(pick.serial_no)) {
          details = details.concat(serialDetailMap.get(pick.serial_no));
        }
        serialDetailMap.set(pick.serial_no, details);
      });
      let dataSource = [];
      if (window.localStorage) {
        const subarDataSource = window.localStorage.getItem('subarcode-pickchkpack');
        if (subarDataSource) {
          const suDataSource = JSON.parse(subarDataSource);
          if (suDataSource && suDataSource.length > 0) {
            dataSource = suDataSource;
          }
        }
      }
      this.setState({ serialDetailMap, dataSource });
      if (this.suInputRef) {
        setTimeout(() => {
          this.suInputRef.focus();
        }, 100);
      }
    }
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.handleSuCancel(true);
    this.props.showSubarPickChkModal({ visible: false });
  }
  handleDeleteDetail = (row) => {
    const dataSource = this.state.dataSource.filter(ds => ds.serial_no !== row.serial_no)
      .map((ds, idx) => ({ ...ds, seqno: idx + 1 }));
    this.setState({ dataSource });
  }
  handleSuCancel = (close) => {
    let serialDetailMap;
    if (close) {
      serialDetailMap = new Map();
    } else {
      serialDetailMap = new Map(this.state.serialDetailMap);
      this.state.dataSource.forEach((ds) => {
        if (serialDetailMap.has(ds.serial_no)) {
          const details = serialDetailMap.get(ds.serial_no)
            .map(sdet => ({ ...sdet, packed_no: this.state.packedNo }));
          serialDetailMap.set(ds.serial_no, details);
        }
      });
    }
    this.setState({
      dataSource: [],
      alertMsg: null,
      serialDetailMap,
    });
    this.emptySuInputElement();
    if (window.localStorage) {
      window.localStorage.removeItem('subarcode-pickchkpack');
    }
  }
  handleSubmit = () => {
    const { outboundNo } = this.props;
    const picklist = this.state.dataSource.map(ds => ({
      id: ds.id,
      picked_qty: ds.qty,
    }));
    const { packedNo } = this.state;
    this.props.pickConfirm(outboundNo, picklist, null, new Date(), packedNo).then((result) => {
      if (!result.error) {
        message.success(`箱号${packedNo}条码拣货成功`);
        this.handleSuCancel();
      } else {
        message.error('操作失败');
      }
    });
  }
  handleSuInputRef = (input) => {
    this.suInputRef = input;
    if (input) {
      setTimeout(() => {
        this.suInputRef.focus();
      }, 100);
    }
  }
  emptySuInputElement = () => {
    if (this.suInputRef) {
      this.suInputRef.focus();
    }
    document.getElementById('su-pcp-input-elem').value = '';
  }
  handleSuBarKeyDown = (ev) => {
    if (ev.key === 'Enter') {
      const barcode = ev.target.value;
      const { suSetting } = this.props;
      if (barcode === suSetting.submit_key) {
        this.handleSubmit();
        this.emptySuInputElement();
        return;
      }
      const suKeys = ['serial_no', 'product_no'];
      Object.keys(suSetting).forEach((suKey) => {
        if (suSetting[suKey].enabled === true || suSetting[suKey].enabled === 'subarcode') {
          suKeys.push(suKey);
        }
      });
      const suScan = {};
      let barcodeParts = [barcode];
      if (suSetting.separator) {
        barcodeParts = barcode.split(suSetting.separator);
      }
      for (let i = 0; i < suKeys.length; i++) {
        const suKey = suKeys[i];
        const suConf = suSetting[suKey];
        const barcodePart = barcodeParts[suConf.part || 0];
        if (barcodePart) {
          suScan[suKey] = barcodePart.slice(suConf.start, barcodePart.length - suConf.end);
        } else {
          suScan[suKey] = null;
        }
        if (!suScan[suKey]) {
          this.setState({
            alertMsg: '错误条码',
          });
          if (this.warnAudio) {
            this.warnAudio.play();
          }
          this.emptySuInputElement();
          return;
        }
      }
      if (this.state.dataSource.filter(ds => ds.serial_no === suScan.serial_no).length > 0) {
        this.setState({
          alertMsg: `序列号${suScan.serial_no}已经扫描`,
        });
        this.emptySuInputElement();
        return;
      }
      if (!this.state.serialDetailMap.has(suScan.serial_no)) {
        const dataSource = [{
          serial_no: suScan.serial_no,
          seqno: this.state.dataSource.length + 1,
          error: true,
          errorMsg: '拣货序列号不存在',
        }].concat(this.state.dataSource);
        if (this.warnAudio) {
          this.warnAudio.play();
        }
        this.setState({
          alertMsg: `拣货明细无此序列号:${suScan.serial_no}`,
          dataSource,
        });
        this.emptySuInputElement();
        return;
      }
      const serialDetails = this.state.serialDetailMap.get(suScan.serial_no);
      const unpickDetails = serialDetails.filter(srd => !srd.packed_no);
      if (unpickDetails.length === 0) {
        this.setState({
          alertMsg: `序列号${suScan.serial_no}已装箱`,
        });
        this.emptySuInputElement();
        return;
      }
      const dataSource = unpickDetails.map(pd => ({
        id: pd.id,
        trace_id: pd.trace_id,
        serial_no: suScan.serial_no,
        product_no: suScan.product_no,
        qty: pd.qty,
        seqno: this.state.dataSource.length + 1,
      })).concat(this.state.dataSource);
      this.setState({
        alertMsg: null,
        dataSource,
      });
      this.emptySuInputElement();
      if (window.localStorage) {
        window.localStorage.setItem('subarcode-pickchkpack', JSON.stringify(dataSource));
      }
    }
  }
  handlePackChange = (ev) => {
    this.setState({
      packedNo: ev.target.value,
    });
  }
  handlePackListPrint = () => {
    this.props.loadPackedNoDetails(this.props.outboundNo, this.state.packedNo).then((result) => {
      if (!result.error) {
        const packDetails = result.data;
        if (packDetails.length === 0) {
          message.warn(`${this.state.packedNo}箱单明细为空`);
          return;
        }
        printPackListPdf(packDetails);
      } else {
        message.error(result.error.message);
      }
    });
  }
  barColumns = [{
    title: '序号',
    dataIndex: 'seqno',
    width: 100,
  }, {
    title: '序列号',
    dataIndex: 'serial_no',
    render: (serial, row) => {
      if (row.error) {
        return <Tooltip title={row.errorMsg}><Tag color="#f50">{serial}</Tag></Tooltip>;
      }
      return serial;
    },
  }, {
    title: '追踪ID',
    dataIndex: 'trace_id',
    width: 300,
  }, {
    title: '货号',
    dataIndex: 'product_no',
    width: 350,
  }, {
    title: '数量',
    dataIndex: 'qty',
    width: 300,
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => (<RowAction onClick={this.handleDeleteDetail} label={<Icon type="delete" />} row={record} />),
  }]
  render() {
    const { saveLoading, visible } = this.props;
    if (!visible) {
      return null;
    }
    const {
      alertMsg, dataSource, packedNo,
    } = this.state;
    dataSource.sort((dsa, dsb) => {
      if (dsa.error && !dsb.error) {
        return -1;
      } else if (!dsa.error && dsb.error) {
        return 1;
      }
      return dsa.seqno - dsb.seqno;
    });
    const unsubmitable = dataSource.length === 0 || dataSource.filter(ds => ds.error).length > 0
      || !packedNo;
    const title = (<div>
      <span>条码拣货集箱</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>取消</Button>
        <Button disabled={unsubmitable} loading={saveLoading} type="primary" onClick={this.handleSubmit}>保存</Button>
        <Button disabled={!packedNo} loading={saveLoading} type="primary" onClick={this.handlePackListPrint}>打印箱单</Button>
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
    return (
      <Modal
        maskClosable={false}
        title={title}
        width="100%"
        wrapClassName="fullscreen-modal"
        closable={false}
        visible={visible}
        footer={null}
      >
        <Card bodyStyle={{ paddingBottom: 16 }} >
          <Form>
            {alertMsg && <Alert message={alertMsg} type="error" showIcon /> }
            <FormItem label="箱号" {...formItemLayout}>
              <Input
                value={packedNo}
                onChange={this.handlePackChange}
              />
            </FormItem>
            <FormItem label="商品条码" {...formItemLayout}>
              <Input
                id="su-pcp-input-elem"
                addonBefore={<Icon type="barcode" />}
                ref={this.handleSuInputRef}
                onKeyDown={this.handleSuBarKeyDown}
              />
            </FormItem>
          </Form>
        </Card>
        <Card bodyStyle={{ padding: 0 }} >
          <Table
            size="middle"
            columns={this.barColumns}
            dataSource={dataSource}
            rowKey="seqno"
            pagination={{ showTotal: total => `共 ${total} 条`, showSizeChanger: true, defaultPageSize: 20 }}
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

