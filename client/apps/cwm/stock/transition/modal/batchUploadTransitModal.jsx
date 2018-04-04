import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import superagent from 'superagent';
import { message, Upload, Button, Col, Select, Input, Modal, Form } from 'antd';
import { showUploadTransitModal, moveTransit, splitTransit } from 'common/reducers/cwmTransition';
import { commonTraceColumns } from '../../commonColumns';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    defaultWhse: state.cwmContext.defaultWhse,
    uploadTransitModal: state.cwmTransition.batchUploadTransitModal,
  }),
  { showUploadTransitModal, moveTransit, splitTransit }
)
export default class BatchUploadTransitModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    uploadTransitModal: PropTypes.shape({ visible: PropTypes.bool }),
  }
  state = {
    transitKey: null,
    transitKeyFile: null,
    transitBodyList: [{ key: null, value: null }],
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.showUploadTransitModal({ visible: false });
  }
  handleTransitKeyChange = (tkey) => {
    this.setState({ transitKey: tkey });
  }
  handleTransitBodyChange = (index, field, bkey) => {
    const bodyList = [...this.state.transitBodyList];
    const body = bodyList[index];
    body[field] = bkey;
    this.setState({ transitBodyList: bodyList });
  }
  handleTransitBodyAdd = () => {
    const bodyList = [...this.state.transitBodyList];
    bodyList.push({ key: null, value: null });
    this.setState({ transitBodyList: bodyList });
  }
  handleTransitBodyRemove = (index) => {
    const bodyList = this.state.transitBodyList.filter((tb, tbidx) => tbidx !== index);
    this.setState({ transitBodyList: bodyList });
  }
  handleUploadIntercept = (file) => {
    this.setState({ transitKeyFile: file });
    return false;
  }
  handleSubmit = () => {
    const { transitKeyFile, transitKey, transitBodyList } = this.state;
    if (!transitKey) {
      message.error('导入字段未选');
      return;
    }
    if (!transitKeyFile) {
      message.error('导入文件未上传');
      return;
    }
    const bodyList = transitBodyList.filter(tb => tb.key && tb.value);
    if (bodyList.length === 0) {
      message.error('更新字段和值未填');
      return;
    }
    const metaData = JSON.stringify({
      key: transitKey,
      bodyList: transitBodyList,
      whseCode: this.props.defaultWhse.code,
    });
    superagent.post(`${API_ROOTS.default}v1/cwm/stock/transition/batchupload`)
      .field('data', metaData)
      .attach('file', transitKeyFile)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          if (err.crossDomain) {
            message.error('网络断开/服务异常');
            return;
          }
          message.error(err.message);
        } else if (res.body.status !== 200) {
          message.error(res.body.msg);
        } else {
          this.props.showUploadTransitModal({ needReload: true, visible: false });
        }
      });
  }
  render() {
    const { uploadTransitModal, intl } = this.props;
    const { transitKey, transitKeyFile, transitBodyList } = this.state;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    const commonColDefine = commonTraceColumns(intl);
    const transitUpdateKeyOptions = ['cust_order_no', 'po_no', 'invoice_no', 'external_lot_no', 'serial_no',
      'virtual_whse', 'attrib_1_string', 'attrib_2_string', 'attrib_3_string', 'attrib_4_string',
      'attrib_5_string', 'attrib_6_string', 'attrib_7_date', 'attrib_8_date',
    ].map((tuk) => {
      const coldef = commonColDefine.filter(ccd => ccd.dataIndex === tuk)[0];
      if (coldef) {
        return { key: tuk, text: coldef.title };
      }
      return null;
    }).filter(tuk => tuk);
    const transitKeyOptions = [{ key: 'product_no', text: this.msg('productNo') }, {
      key: 'trace_id', text: this.msg('traceId'),
    }].concat(transitUpdateKeyOptions);
    const nonChoseUpdateKeyOptions = transitUpdateKeyOptions.filter(tuk =>
      transitBodyList.filter(tb => tb.key === tuk.key).length === 0);
    return (
      <Modal
        maskClosable={false}
        title="批量导入属性调整"
        width={960}
        visible={uploadTransitModal.visible}
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
        okText="确认调整"
      >
        <Form>
          <FormItem {...formItemLayout} label="导入字段">
            <Col span={8}>
              <Select onChange={this.handleTransitKeyChange} showSearch value={transitKey} optionFilterProp="children">
                {transitKeyOptions.map(tko => (<Option key={tko.key} value={tko.key}>
                  {tko.text}</Option>))}
              </Select>
            </Col>
            <Col span={15} offset={1}>
              <Upload accept=".xlsx,.csv" beforeUpload={this.handleUploadIntercept} fileList={transitKeyFile ? [transitKeyFile] : []}>
                <Button icon="cloud-upload-o">上传字段值文件 </Button>
              </Upload>
            </Col>
          </FormItem>
          {transitBodyList.map((trb, bodyIdx) => {
            let chosableUpdateKeyOptions = nonChoseUpdateKeyOptions;
            if (trb.key) {
              const selOptionList = transitUpdateKeyOptions.filter(tuk => tuk.key === trb.key);
              chosableUpdateKeyOptions = selOptionList.concat(chosableUpdateKeyOptions);
            }
            return (<FormItem {...formItemLayout} label="更新字段" key={trb.key || `${Date.now()}`}>
              <Col span={8}>
                <Select
                  onChange={val => this.handleTransitBodyChange(bodyIdx, 'key', val)}
                  showSearch
                  value={trb.key}
                >
                  {chosableUpdateKeyOptions.map(tko => (<Option key={tko.key} value={tko.key}>
                    {tko.text}</Option>))}
                </Select>
              </Col>
              <Col span={14} style={{ marginLeft: 10 }}>
                <Input onChange={ev => this.handleTransitBodyChange(bodyIdx, 'value', ev.target.value)} placeholder="更新值" value={trb.value} />
              </Col>
              <Col span={1} style={{ marginLeft: 10 }}>
                {bodyIdx === 0 ?
                  <Button type="dashed" onClick={this.handleTransitBodyAdd} icon="plus-circle-o" />
                  : <Button type="dashed" onClick={() => this.handleTransitBodyRemove(bodyIdx)} icon="minus-circle-o" />}
              </Col>
            </FormItem>);
          })}
        </Form>
      </Modal>
    );
  }
}
