import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Alert, Card, Table, Icon, Modal, Form, Input, Button, message } from 'antd';
import RowAction from 'client/components/RowAction';
import { showSubarPickChkModal, pickConfirm } from 'common/reducers/cwmOutbound';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cwmOutbound.subarPickChkModal.visible,
    pickDetails: state.cwmOutbound.pickDetails,
    saveLoading: state.cwmOutbound.submitting,
  }),
  { showSubarPickChkModal, pickConfirm }
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
      pack_no: PropTypes.string,
    })).isRequired,
  }
  state = {
    serialDetailMap: null,
    alertMsg: null,
    dataSource: [],
    packedNo: null,
    pickSubmit: false,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      const serialDetailMap = new Map();
      nextProps.pickDetails.forEach((pick) => {
        let details = [{
          id: pick.id,
          trace_id: pick.trace_id,
          qty: pick.alloc_qty - pick.picked_qty,
          pack_no: pick.pack_no,
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
    this.handleSuCancel();
    this.setState({
      serialDetailMap: null,
      packedNo: null,
      pickSubmit: false,
    });
    this.props.showSubarPickChkModal({ visible: false });
  }
  handleDeleteDetail = (row) => {
    const dataSource = this.state.dataSource.filter(ds => ds.serial_no !== row.serial_no);
    this.setState({ dataSource });
  }
  handleSuCancel = () => {
    this.setState({
      dataSource: [],
      alertMsg: null,
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
        this.setState({ pickSubmit: true });
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
      for (let i = 0; i < suKeys.length; i++) {
        const suKey = suKeys[i];
        const suConf = suSetting[suKey];
        suScan[suKey] = barcode.slice(suConf.start, suConf.end);
        if (!suScan[suKey]) {
          this.setState({
            alertMsg: '错误条码',
          });
          this.emptySuInputElement();
          return;
        }
      }
      if (!this.state.serialDetailMap.has(suScan.serial_no)) {
        this.setState({
          alertMsg: `拣货明细无此序列号:${suScan.serial_no}`,
        });
        this.emptySuInputElement();
        return;
      }
      if (this.state.dataSource.filter(ds => ds.serial_no === suScan.serial_no).length > 0) {
        this.setState({
          alertMsg: `序列号${suScan.serial_no}已经扫描`,
        });
        this.emptySuInputElement();
        return;
      }
      const serialDetails = this.state.serialDetailMap.get(suScan.serial_no);
      const unpickDetails = serialDetails.filter(srd => !srd.pack_no);
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
  barColumns = [{
    title: '序号',
    dataIndex: 'seqno',
    width: 100,
    render: (id, row, index) => this.state.dataSource.length - index,
  }, {
    title: '追踪ID',
    dataIndex: 'trace_id',
    width: 300,
  }, {
    title: '序列号',
    dataIndex: 'serial_no',
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
      alertMsg, dataSource, packedNo, pickSubmit,
    } = this.state;
    const title = (<div>
      <span>条码拣货集箱</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>取消</Button>
        <Button disabled={dataSource.length === 0 || !packedNo} loading={saveLoading} type="primary" onClick={this.handleSubmit}>保存</Button>
        <Button disabled={!pickSubmit} loading={saveLoading} type="primary" onClick={this.handleSubmit}>打印箱单</Button>
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

