import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Card, Radio, Checkbox, Select, message, Row, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { closeMergeSplitModal, submitBillMegeSplit } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;

function MSCheckbox(props) {
  const { state, fieldOpt, field, text, onChange } = props;
  function handleChange(ev) {
    onChange(fieldOpt, field, ev.target.checked);
  }
  return (
    <div>
      <Checkbox onChange={handleChange} checked={state[fieldOpt][field]}>
      {text}
      </Checkbox>
    </div>
  );
}

MSCheckbox.propTypes = {
  fieldOpt: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  state: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

@injectIntl
@connect(
  state => ({
    visible: state.cmsDeclare.visibleMSModal,
    isCustomRegisted: !!state.cmsDeclare.billHead.manual_no,
    billNo: state.cmsDeclare.billHead.bill_seq_no,
  }),
  { closeMergeSplitModal, submitBillMegeSplit }
)
export default class MergeSplitModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    isCustomRegisted: PropTypes.bool.isRequired,
    billNo: PropTypes.string,
  }
  state = {
    mergeOpt: {
      checked: false,
      byHsCode: false,
      byGName: false,
      byCurr: false,
      byCountry: false,
      byCopGNo: false,
      byEmGNo: false,
    },
    splitOpt: {
      byHsCode: false,
      byCustom: false,
    },
    sortOpt: {
      customControl: false,
      decTotal: false,
      decPriceDesc: false,
      hsCodeAsc: false,
    },
    sortSelectValue: '',
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  mergeConditions = [{
    label: this.msg('codeT'),
    value: 'byHsCode',
  }, {
    label: this.msg('productName'),
    value: 'byGName',
  }, {
    label: this.msg('currency'),
    value: 'byCurr',
  }, {
    label: this.msg('icountry'),
    value: 'byCountry',
  }, {
    label: this.msg('productCode'),
    value: 'byCopGNo',
  }]
  handleCancel = () => {
    this.props.closeMergeSplitModal();
  }
  handleMergeRadioChange = () => {
    this.setState({
      mergeOpt: { checked: !this.state.mergeOpt.checked },
    });
  }
  handleMergeCheck = (checkeds) => {
    const opt = {
      checked: this.state.mergeOpt.checked, byHsCode: false, byGName: false,
      byCurr: false, byCountry: false, byCopGNo: false, byEmGNo: false,
    };
    checkeds.forEach((chk) => {
      opt[chk] = true;
    });
    this.setState({
      mergeOpt: opt,
    });
  }
  handleSortSelectChange = (value) => {
    const sortOpt = { ...this.state.sortOpt };
    if (value === 'hsCodeAsc') {
      sortOpt.hsCodeAsc = true;
      sortOpt.decPriceDesc = false;
    } else if (value === 'decPriceDesc') {
      sortOpt.decPriceDesc = true;
      sortOpt.hsCodeAsc = false;
    }
    this.setState({
      sortOpt,
      sortSelectValue: value,
    });
  }
  handleCheckChange = (fieldOpt, field, value) => {
    const opt = { ...this.state[fieldOpt] };
    opt[field] = value;
    this.setState({
      [fieldOpt]: opt,
    });
  }
  handleOk = () => {
    const { billNo } = this.props;
    const { splitOpt, mergeOpt, sortOpt } = this.state;
    this.props.submitBillMegeSplit({ billNo, splitOpt, mergeOpt, sortOpt }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.closeMergeSplitModal();
      }
    });
  }
  render() {
    const { mergeOpt } = this.state;
    let mergeConditions = this.mergeConditions;
    if (this.props.isCustomRegisted) {
      mergeConditions = [...mergeConditions, { label: this.msg('emGNo'), value: 'byEmGNo' }];
    }
    return (
      <Modal onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible}
      >
        <Row style={{ paddingTop: '20px' }}>
          <Col span="24" style={{ marginBottom: '10px' }}>
            <Card title={this.msg('mergePrinciple')} bordered>
              <Row>
                <Col span="3">
                  <Radio checked={mergeOpt.checked} onChange={this.handleMergeRadioChange}>
                  {this.msg('conditionalMerge')}
                  </Radio>
                </Col>
                <Col offset="2" span="19">
                  <CheckboxGroup options={mergeConditions} disabled={!mergeOpt.checked}
                    onChange={this.handleMergeCheck}
                  />
                </Col>
              </Row>
              <Row>
                <Col span="3">
                  <Radio checked={!mergeOpt.checked} onChange={this.handleMergeRadioChange}>
                  {this.msg('nonMerge')}
                  </Radio>
                </Col>
                <Col offset="2" span="19">
                  按清单数据直接生成报关单（并按原数据排序）
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span="12">
            <Card title={this.msg('splitPrinciple')} bordered>
              <MSCheckbox fieldOpt="splitOpt" field="byHsCode"
                text={this.msg('specialHscodeDeclare')}
                onChange={this.handleCheckChange} state={this.state}
              />
              <MSCheckbox fieldOpt="splitOpt" field="byCustom"
                text={this.msg('customControlDeclare')}
                onChange={this.handleCheckChange} state={this.state}
              />
            </Card>
          </Col>
          <Col span="11" offset="1">
            <Card title={this.msg('sortPrinciple')} bordered>
              <MSCheckbox fieldOpt="sortOpt" field="customControl"
                text={this.msg('customOnTop')}
                onChange={this.handleCheckChange} state={this.state}
              />
              <MSCheckbox fieldOpt="sortOpt" field="decTotal"
                text={this.msg('totalPriceOnTop')}
                onChange={this.handleCheckChange} state={this.state}
              />
              <Select onChange={this.handleSortSelectChange} value={this.state.sortSelectValue}
                style={{ width: '100%' }}
              >
                <Option value="hsCodeAsc">{this.msg('hsCodeAscSort')}</Option>
                <Option value="decPriceDesc">{this.msg('priceDescSort')}</Option>
              </Select>
            </Card>
          </Col>
        </Row>
      </Modal>
    );
  }
}
