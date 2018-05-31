import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Alert, Card, Table, Tooltip, Tag, Icon, Modal, Form, Input, Button, message } from 'antd';
import Audio from 'browser-audio';
import RowAction from 'client/components/RowAction';
import { viewSuBarPutawayModal, batchPutaways } from 'common/reducers/cwmReceive';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    username: state.account.username,
    visible: state.cwmReceive.suBarPutawayModal.visible,
    inboundHead: state.cwmReceive.inboundFormHead,
    inboundNo: state.cwmReceive.suBarPutawayModal.inboundNo,
    putawayList: state.cwmReceive.inboundPutaways.list,
    saveLoading: state.cwmReceive.submitting,
  }),
  { viewSuBarPutawayModal, batchPutaways }
)
export default class SuBarPutawayModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    putawayList: PropTypes.arrayOf(PropTypes.shape({
      product_no: PropTypes.string.isRequired,
      trace_id: PropTypes.string.isRequired,
      serial_no: PropTypes.string.isRequired,
      inbound_qty: PropTypes.number.isRequired,
      result: PropTypes.oneOf([0, 1]),
    })).isRequired,
  }
  state = {
    serialDetailMap: new Map(),
    alertMsg: null,
    dataSource: [],
    location: null,
  }
  componentDidMount() {
    this.warnAudio = Audio.create(`${__CDN__}/assets/img/error.mp3`);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      const serialDetailMap = new Map();
      nextProps.putawayList.forEach((putaway) => {
        let details = [{
          trace_id: putaway.trace_id,
          qty: putaway.inbound_qty,
          result: putaway.result,
        }];
        if (putaway.children) {
          details = details.concat(putaway.children.map(putad => ({
            trace_id: putad.trace_id,
            qty: putad.inbound_qty,
            result: putad.result,
          })));
        }
        if (serialDetailMap.has(putaway.serial_no)) {
          details = details.concat(serialDetailMap.get(putaway.serial_no));
        }
        serialDetailMap.set(putaway.serial_no, details);
      });
      let dataSource = [];
      if (window.localStorage) {
        const subarDataSource = window.localStorage.getItem('subarcode-putaway');
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
    this.setState({
      serialDetailMap: new Map(),
      dataSource: [],
      location: null,
      alertMsg: null,
    });
    this.emptySuInputElement();
    if (window.localStorage) {
      window.localStorage.removeItem('subarcode-putaway');
    }
    this.props.viewSuBarPutawayModal({ visible: false });
  }
  handleSubmitSave =() => {
    const serialDetailMap = new Map(this.state.serialDetailMap);
    this.state.dataSource.forEach((ds) => {
      if (serialDetailMap.has(ds.serial_no)) {
        const details = serialDetailMap.get(ds.serial_no).map(sdet => ({
          ...sdet,
          result: 1,
        }));
        serialDetailMap.set(ds.serial_no, details);
      }
    });
    this.setState({
      serialDetailMap,
      dataSource: [],
      location: null,
      alertMsg: null,
    });
    this.emptySuInputElement();
    if (window.localStorage) {
      window.localStorage.removeItem('subarcode-putaway');
    }
  }
  handleDeleteDetail = (row) => {
    const dataSource = this.state.dataSource.filter(ds => ds.serial_no !== row.serial_no)
      .map((ds, idx) => ({ ...ds, seqno: idx + 1 }));
    this.setState({ dataSource });
  }
  handleSubmit = () => {
    const { dataSource, location } = this.state;
    const unsubmitable = dataSource.length === 0 || dataSource.filter(ds => ds.error).length > 0
      || !location;
    if (unsubmitable) {
      if (this.warnAudio) {
        this.warnAudio.play();
      }
      return;
    }
    const {
      username, inboundNo,
    } = this.props;
    const traceIds = this.state.dataSource.map(ds => ds.trace_id);
    this.props.batchPutaways(
      traceIds, this.state.location, username,
      new Date(), username, inboundNo
    ).then((result) => {
      if (!result.error) {
        message.success('条码上架成功', 5);
        this.handleSubmitSave();
      } else {
        if (result.error.message === 'location_not_found') {
          this.setState({ alertMsg: `库位${location}不存在` });
          return;
        }
        this.setState({ alertMsg: '条码拣货保存失败' });
        if (this.warnAudio) {
          this.warnAudio.play();
        }
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
  handleLocationInputRef = (input) => { this.locationInputRef = input; }
  emptySuInputElement = () => {
    if (this.suInputRef) {
      this.suInputRef.focus();
    }
    document.getElementById('su-putaway-input-elem').value = '';
  }
  handleSuBarKeyDown = (ev) => {
    if (ev.key === 'Enter') {
      const barcode = ev.target.value;
      const suSetting = this.props.inboundHead.su_setting;
      if (barcode === suSetting.submit_key) {
        this.handleSubmit();
        this.emptySuInputElement();
        return;
      } else if (barcode === suSetting.location_focus_key && this.locationInputRef) {
        this.emptySuInputElement();
        this.setState({ location: null });
        this.locationInputRef.focus();
        return;
      }
      const suKeys = ['serial_no', 'product_no'];
      Object.keys(suSetting).forEach((suKey) => {
        if (suSetting[suKey].enabled === true || suSetting[suKey].enabled === 'subarcode') {
          suKeys.push(suKey);
        }
      });
      let barcodeParts = [barcode];
      if (suSetting.separator) {
        barcodeParts = barcode.split(suSetting.separator);
      }
      const suScan = {};
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
          errorMsg: '待上架列表无此序列号',
        }].concat(this.state.dataSource);
        this.setState({
          dataSource,
          alertMsg: `收货明细无此序列号:${suScan.serial_no}`,
        });
        this.emptySuInputElement();
        return;
      }
      const serialDetails = this.state.serialDetailMap.get(suScan.serial_no);
      const unputawayDetails = serialDetails.filter(srd => srd.result === 0);
      if (unputawayDetails.length === 0) {
        this.setState({
          alertMsg: `序列号${suScan.serial_no}已上架`,
        });
        this.emptySuInputElement();
        return;
      }
      const dataSource = unputawayDetails.map(pd => ({
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
        window.localStorage.setItem('subarcode-putaway', JSON.stringify(dataSource));
      }
    }
  }
  handleScanLocationChange = (ev) => {
    this.setState({
      location: ev.target.value,
    });
  }
  handleScanLocationKeyDown= (ev) => {
    if (ev.key === 'Enter' && this.suInputRef) {
      this.suInputRef.focus();
    }
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
      alertMsg, dataSource, location,
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
      || !location;
    const title = (<div>
      <span>条码扫描上架</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>取消</Button>
        <Button disabled={unsubmitable} loading={saveLoading} type="primary" onClick={this.handleSubmit}>保存</Button>
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
            <FormItem label="商品条码" {...formItemLayout}>
              <Input
                id="su-putaway-input-elem"
                addonBefore={<Icon type="barcode" />}
                ref={this.handleSuInputRef}
                onKeyDown={this.handleSuBarKeyDown}
              />
            </FormItem>
            <FormItem label="库位" {...formItemLayout}>
              <Input
                addonBefore={<Icon type="barcode" />}
                ref={this.handleLocationInputRef}
                value={location}
                onChange={this.handleScanLocationChange}
                onKeyDown={this.handleScanLocationKeyDown}
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

