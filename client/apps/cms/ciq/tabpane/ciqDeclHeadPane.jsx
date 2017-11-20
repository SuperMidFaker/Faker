import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, DatePicker, Form, Icon, Input, Select, Row, Col, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import { fillEntryId } from 'common/reducers/cmsManifest';
import { updateMark } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const InputGroup = Input.Group;

@injectIntl
@connect(
  state => ({
    formRequire: state.cmsManifest.params,
  }),
  { fillEntryId, updateMark }
)
export default class CiqDeclHeadPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ioType: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    formRequire: PropTypes.object.isRequired,
    fillEntryId: PropTypes.func.isRequired,
    updateMark: PropTypes.func.isRequired,
  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      event.stopPropagation();
      event.preventDefault();
      const inputs = document.forms[0].elements;
      for (let i = 0; i < inputs.length; i++) {
        if (i === (inputs.length - 1)) {
          inputs[0].focus();
          inputs[0].select();
          break;
        } else if (event.target === inputs[i]) {
          inputs[i + 1].focus();
          inputs[i + 1].select();
          break;
        }
      }
    } else if (event.keyCode === 8) {
      event.target.select();
    }
  }
  handleEntryFill = (entryNo) => {
    const { formData } = this.props;
    this.props.fillEntryId({
      entryNo,
      entryHeadId: formData.id,
      billSeqNo: formData.bill_seq_no,
      delgNo: formData.delg_no,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleMarkFill = (val, field) => {
    const change = {};
    change[field] = val;
    this.props.updateMark(change, this.props.formData.id);
  }
  render() {
    const { formData, ioType } = this.props;
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
    const formItemSpan2Layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    const formItemSpan3Layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 21 },
      },
    };
    return (
      <div className="pane">
        <Form layout="horizontal" hideRequiredMark>
          <div className="panel-header">
            <Row>
              <Col span="6">
                <InfoItem size="small" field={formData.pre_entry_id}
                  addonBefore={this.msg('统一编号')}
                />
              </Col>
              <Col span="6">
                <InfoItem size="small" field={formData.entry_id} placeholder="点击回填"
                  addonBefore={this.msg('报检号')} editable={!formData.entry_id} onEdit={this.handleEntryFill}
                />
              </Col>
              <Col span="6">
                <InfoItem size="small" field={formData.entry_id} placeholder="点击回填"
                  addonBefore={this.msg('通关单号')} editable={!formData.entry_id} onEdit={this.handleEntryFill}
                />
              </Col>
            </Row>
          </div>
          <div className="pane-content form-layout-multi-col">
            <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} noHovering>
              <Row>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'报检类别'} required >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'报检机构'} required >
                    <Input prefix={<Icon type="safety" />} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'口岸机构'} required >
                    <Input prefix={<Icon type="safety" />} />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'报检日期'} required >
                    <DatePicker style={{ width: '100%' }} />
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'报检单位'} required >
                    <InputGroup compact>
                      <Input placeholder="报检登记号" style={{ width: '30%' }} />
                      <Input placeholder="中文名称" style={{ width: '70%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'报检员'} >
                    <InputGroup compact>
                      <Input placeholder="编码" style={{ width: '50%' }} />
                      <Input placeholder="姓名" style={{ width: '50%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'联系人'} >
                    <InputGroup compact>
                      <Input placeholder="姓名" style={{ width: '50%' }} />
                      <Input placeholder="电话" style={{ width: '50%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
              </Row>
              {ioType === 'in' && <Row>
                <Col span="18">
                  <FormItem {...formItemSpan3Layout} label={'收货人'} required >
                    <InputGroup compact>
                      <Select placeholder="收货人代码" style={{ width: '20%' }} />
                      <Input placeholder="收货人中文" style={{ width: '40%' }} />
                      <Input placeholder="收货人英文" style={{ width: '40%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'企业性质'} >
                    <Input />
                  </FormItem>
                </Col>
              </Row>}
              {ioType === 'in' && <Row>
                <Col span="18">
                  <FormItem {...formItemSpan3Layout} label={'发货人'} >
                    <InputGroup compact>
                      <Select placeholder="发货人代码" style={{ width: '20%' }} />
                      <Input placeholder="发货人中文" style={{ width: '40%' }} />
                      <Input placeholder="发货人英文" style={{ width: '40%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'发货人地址'} >
                    <Input />
                  </FormItem>
                </Col>
              </Row>}
              {ioType === 'out' && <Row>
                <Col span="18">
                  <FormItem {...formItemSpan3Layout} label={'发货人'} required >
                    <InputGroup compact>
                      <Select placeholder="发货人代码" style={{ width: '20%' }} />
                      <Input placeholder="发货人中文" style={{ width: '40%' }} />
                      <Input placeholder="发货人英文" style={{ width: '40%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'企业性质'} >
                    <Input />
                  </FormItem>
                </Col>
              </Row>}
              {ioType === 'out' && <Row>
                <Col span="18">
                  <FormItem {...formItemSpan3Layout} label={'收货人'} >
                    <InputGroup compact>
                      <Select placeholder="收货人代码" style={{ width: '20%' }} />
                      <Input placeholder="收货人中文" style={{ width: '40%' }} />
                      <Input placeholder="收货人英文" style={{ width: '40%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'收货人地址'} >
                    <Input />
                  </FormItem>
                </Col>
              </Row>}
            </Card>
            <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} noHovering>
              <Row>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'运输方式'} required >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'运输工具名称'} >
                    <Input />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'运输工具号码'} >
                    <Input />
                  </FormItem>
                </Col>
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'提货单号'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'提/运单号'} required >
                    <Input />
                  </FormItem>
                </Col>}
                <Col span="6">
                  <FormItem {...formItemLayout} label={'合同号'} required >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'贸易方式'} required >
                    <Input />
                  </FormItem>
                </Col>
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'贸易国别'} required >
                    <Input />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'启运口岸'} required >
                    <Input />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'启运国家'} >
                    <Input />
                  </FormItem>
                </Col>}
                {ioType === 'out' && <Col span="6">
                  <FormItem {...formItemLayout} label={'施检机构'} required >
                    <Input prefix={<Icon type="safety" />} />
                  </FormItem>
                </Col>}
                {ioType === 'out' && <Col span="6">
                  <FormItem {...formItemLayout} label={'输往国家/地区'} >
                    <Input />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'停经口岸'} >
                    <Input />
                  </FormItem>
                </Col>}
                <Col span="6">
                  <FormItem {...formItemLayout} label={ioType === 'in' ? '入境口岸' : '离境口岸'} required >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'目的地'} required >
                    <Input />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'目的机构'} required >
                    <Input prefix={<Icon type="safety" />} />
                  </FormItem>
                </Col>}
                {ioType === 'out' && <Col span="6">
                  <FormItem {...formItemLayout} label={'到达口岸'} required >
                    <Input />
                  </FormItem>
                </Col>}
                <Col span="6">
                  <FormItem {...formItemLayout} label={'存放地点'} required >
                    <Input />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'领证机构'} required >
                    <Input prefix={<Icon type="safety" />} />
                  </FormItem>
                </Col>
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'启运日期'} required >
                    <DatePicker style={{ width: '100%' }} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'到货日期'} required >
                    <DatePicker style={{ width: '100%' }} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'卸毕日期'} >
                    <DatePicker style={{ width: '100%' }} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'索赔截止日期'} >
                    <DatePicker style={{ width: '100%' }} />
                  </FormItem>
                </Col>}
                {ioType === 'out' && <Col span="6">
                  <FormItem {...formItemLayout} label={'发货日期'} >
                    <DatePicker style={{ width: '100%' }} />
                  </FormItem>
                </Col>}
                <Col span="6">
                  <FormItem {...formItemLayout} label={'报关海关'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'海关注册号'} >
                    <Input />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'关联报检号'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'关联理由'} >
                    <Input />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'分运单号'} >
                    <Input />
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'特殊业务标识'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'特殊通关模式'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'特殊检验检疫要求'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'标记号码'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'所需单证'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'随附单据'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
              </Row>
            </Card>
          </div>
        </Form>
      </div>
    );
  }
}
