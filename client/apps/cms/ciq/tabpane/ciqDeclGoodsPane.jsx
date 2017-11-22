import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Col, DatePicker, Form, Row, Button, Tag, Input, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import Summary from 'client/components/Summary';
import DataPane from 'client/components/DataPane';
import { showDeclElementsModal } from 'common/reducers/cmsManifest';
import { getElementByHscode } from 'common/reducers/cmsHsCode';
import messages from '../message.i18n';

const formatMsg = format(messages);
const Option = Select.Option;
const FormItem = Form.Item;
const InputGroup = Input.Group;

function ColumnInput(props) {
  const { inEdit, edit, record, field, onChange, type, autosize, decimal } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(field, ev.target.value);
    }
  }
  const typeStr = (!type) ? 'text' : type;
  if (inEdit) {
    return (<Input type={typeStr} autosize={autosize} value={edit[field] || ''} onChange={handleChange} />);
  } else if (decimal) {
    return <span>{record[field] ? parseFloat(record[field]).toFixed(decimal) : ''}</span>;
  } else {
    return <span>{record[field] || ''}</span>;
  }
}
ColumnInput.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  edit: PropTypes.object,
  onChange: PropTypes.func,
  type: PropTypes.oneOf(['text', 'textarea']),
  autosize: PropTypes.bool,
  decimal: PropTypes.number,
};

function ColumnSelect(props) {
  const { inEdit, edit, record, field, options, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(field, value);
    }
  }
  if (inEdit) {
    return (
      <Select showSearch showArrow optionFilterProp="search" value={edit[field] || ''} onChange={handleChange} style={{ width: '100%' }}>
        {
          options.map(opt => <Option search={opt.search} value={opt.value} key={opt.value}>{`${opt.value}|${opt.text}`}</Option>)
        }
      </Select>
    );
  } else {
    const foundOpts = options.filter(opt => opt.value === record[field]);
    const label = foundOpts.length === 1 ? `${foundOpts[0].value}|${foundOpts[0].text}` : '';
    return label && label.length > 0 ? <Tag>{label}</Tag> : <span />;
  }
}

ColumnSelect.proptypes = {
  inEdit: PropTypes.bool,
  edit: PropTypes.object,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
};

function calculateTotal(bodies, currencies) {
  let totGrossWt = 0;
  let totWetWt = 0;
  let totTrade = 0;
  let totPcs = 0;
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    if (body.gross_wt) {
      totGrossWt += Number(body.gross_wt);
    }
    if (body.wet_wt) {
      totWetWt += Number(body.wet_wt);
    }
    if (body.trade_total) {
      const currency = currencies.find(curr => curr.value === body.trade_curr);
      const rate = currency ? currency.rate_cny : 1;
      totTrade += Number(body.trade_total * rate);
    }
    if (body.qty_pcs) {
      totPcs += Number(body.qty_pcs);
    }
  }
  return { totGrossWt, totWetWt, totTrade, totPcs };
}

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    units: state.cmsManifest.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
      search: `${un.unit_code}${un.unit_name}`,
    })),
    countries: state.cmsManifest.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
      search: `${tc.cntry_co}${tc.cntry_name_en}${tc.cntry_name_cn}${tc.cntry_en_short}`,
    })),
    currencies: state.cmsManifest.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
      search: `${cr.curr_code}${cr.curr_symb}${cr.curr_name}`,
      rate_cny: cr.rate_CNY,
    })),
    exemptions: state.cmsManifest.params.exemptionWays.map(ep => ({
      value: ep.value,
      text: ep.text,
      search: `${ep.value}${ep.text}`,
    })),
    loginId: state.account.loginId,
    billHead: state.cmsManifest.billHead,
    bodyItem: state.cmsTradeitem.bodyItem,
    bodyHscode: state.cmsTradeitem.bodyHscode,
    entryHead: state.cmsManifest.entryHead,
  }), { showDeclElementsModal, getElementByHscode }
)
export default class CiqDeclGoodsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    ioType: PropTypes.oneOf(['in', 'out']),
    data: PropTypes.array.isRequired,
    headNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    loginId: PropTypes.number.isRequired,
    units: PropTypes.array,
    countries: PropTypes.array,
    currencies: PropTypes.array,
    exemptions: PropTypes.array,
    billHead: PropTypes.object,
    entryHead: PropTypes.object,
    bodyItem: PropTypes.object,
    bodyHscode: PropTypes.object,
    headForm: PropTypes.object,
  }
  constructor(props) {
    super(props);
    const bodies = props.data;
    const calresult = calculateTotal(bodies, props.currencies);
    this.state = {
      editIndex: -1,
      editBody: {},
      bodies,
      totGrossWt: calresult.totGrossWt,
      totWetWt: calresult.totWetWt,
      totTrade: calresult.totTrade,
      totPcs: calresult.totPcs,
      pagination: {
        current: 1,
        total: 0,
        pageSize: 8,
        showQuickJumper: false,
        onChange: this.handlePageChange,
      },

    };
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({ scrollY: window.innerHeight - 320 });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      const bodies = [...nextProps.data];
      const calresult = calculateTotal(bodies, this.props.currencies);
      this.setState({
        bodies,
        totGrossWt: calresult.totGrossWt,
        totWetWt: calresult.totWetWt,
        totTrade: calresult.totTrade,
        totPcs: calresult.totPcs,
        pagination: { ...this.state.pagination, total: bodies.length },
      });
    }
    if (nextProps.bodyItem !== this.props.bodyItem) {
      const item = nextProps.bodyItem;
      if (item) {
        const unit1 = this.props.units.filter(unit => unit.value === item.unit_1)[0];
        const unit1Val = unit1 ? unit1.value : '';
        const unit2 = this.props.units.filter(unit => unit.value === item.unit_2)[0];
        const unit2Val = unit2 ? unit2.value : '';
        const unitg = this.props.units.filter(unit => unit.value === item.g_unit)[0];
        const gunitVal = unitg ? unitg.value : '';
        this.setState({
          editBody: {
            ...this.state.editBody,
            codes: item.hscode,
            g_name: item.g_name,
            g_model: item.g_model,
            element: item.element,
            g_unit: gunitVal,
            unit_1: unit1Val,
            unit_2: unit2Val,
            fixed_unit: item.fixed_unit,
            fixed_qty: item.fixed_qty,
          },
        });
      } else {
        this.setState({
          editBody: {
            ...this.state.editBody,
            codes: '',
            g_name: '',
            g_model: '',
            element: '',
            g_unit: '',
            unit_1: '',
            unit_2: '',
          },
        });
      }
    }
    if (nextProps.bodyHscode !== this.props.bodyHscode) {
      const hscode = nextProps.bodyHscode;
      if (hscode) {
        const unit1 = this.props.units.filter(unit => unit.text === hscode.first_unit)[0];
        const unit1Val = unit1 ? unit1.value : '';
        const unit2 = this.props.units.filter(unit => unit.text === hscode.second_unit)[0];
        const unit2Val = unit2 ? unit2.value : '';
        this.setState({
          editBody: {
            ...this.state.editBody,
            g_name: hscode.product_name,
            element: hscode.declared_elements,
            unit_1: unit1Val,
            unit_2: unit2Val,
          },
        });
      } else {
        this.setState({
          editBody: {
            ...this.state.editBody,
            g_name: '',
            element: '',
            unit_1: '',
            unit_2: '',
          },
        });
      }
    }
  }
  getColumns() {
    const columns = [{
      title: this.msg('序号'),
      dataIndex: 'goods_no',
      fixed: 'left',
      width: 45,
      className: 'cell-align-center',
    }, {
      title: this.msg('HS编码'),
      dataIndex: 'hs_code',
      width: 120,
      fixed: 'left',

    }, {
      title: this.msg('CIQ代码'),
      dataIndex: 'ciq_code',
      width: 150,

    }, {
      title: this.msg('货物名称'),
      dataIndex: 'decl_goods_cname',
      width: 150,
    }, {
      title: <div className="cell-align-right">{this.msg('数量')}</div>,
      dataIndex: 'qty',
      width: 100,
      className: 'cell-align-right',
    }, {
      title: this.msg('数量单位'),
      dataIndex: 'qty_meas_unit',
      width: 100,
      className: 'cell-align-center',
    }, {
      title: <div className="cell-align-right">{this.msg('重量')}</div>,
      dataIndex: 'weight',
      width: 100,
      className: 'cell-align-right',
    }, {
      title: this.msg('重量单位'),
      dataIndex: 'wt_meas_unit',
      width: 100,
      className: 'cell-align-center',
    }, {
      title: <div className="cell-align-right">{this.msg('HS标准量')}</div>,
      dataIndex: 'std_qty',
      width: 100,
      className: 'cell-align-right',
    }, {
      title: this.msg('HS标准量单位'),
      dataIndex: 'std_meas_unit',
      width: 120,
      className: 'cell-align-center',
    }, {
      title: <div className="cell-align-right">{this.msg('单价')}</div>,
      dataIndex: 'unit_price',
      width: 100,
      className: 'cell-align-right',
    }, {
      title: <div className="cell-align-right">{this.msg('货物总值')}</div>,
      dataIndex: 'total_val',
      width: 100,
      className: 'cell-align-right',
    }, {
      title: this.msg('币制'),
      dataIndex: 'currency',
      width: 100,
      className: 'cell-align-center',
    }, {
      title: this.msg('原产国'),
      dataIndex: 'ori_ctry_code',
      width: 100,

    }, {
      title: this.msg('产地'),
      dataIndex: 'ori_place_code',
      width: 120,
    }, {
      title: this.msg('货物属性'),
      dataIndex: 'goods_attr',
      width: 120,
    }];
    return columns;
  }
  handleShowDeclElementModal = (record) => {
    this.props.getElementByHscode(record.codes).then((result) => {
      if (!result.error) {
        this.props.showDeclElementsModal(result.data.declared_elements, record.id, record.g_model, true, record.g_name);
      }
    });
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handlePageChange = (current) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current,
      },
    });
  }
  render() {
    const { ioType } = this.props;
    const { totGrossWt, totWetWt, totTrade } = this.state;
    const columns = this.getColumns();
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
    return (
      <div className="pane">
        <div className="pane-content">
          <Form layout="horizontal" hideRequiredMark className="form-layout-multi-col">
            <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} style={{ marginBottom: 0 }} hoverable={false}>
              <Row>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'HS编码'} required >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'CIQ代码'} required >
                    <Input />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'监管条件'} >
                    <Input disabled />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'货物属性'} required >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem {...formItemSpan2Layout} label={'货物名称'} required >
                    <Input />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'英文名称'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'货物品牌'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'货物规格'} >
                    <Input />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'货物型号'} >
                    <Input />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'用途'} required >
                    <Input />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'成分/原料'} >
                    <Input />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'报检数量'} required >
                    <InputGroup compact>
                      <Input style={{ width: '40%' }} />
                      <Select style={{ width: '60%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'报检重量'} >
                    <InputGroup compact>
                      <Input style={{ width: '40%' }} />
                      <Select style={{ width: '60%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'HS标准量'} required >
                    <InputGroup compact>
                      <Input style={{ width: '40%' }} />
                      <Select style={{ width: '60%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'包装数量'} >
                    <InputGroup compact>
                      <Input style={{ width: '40%' }} />
                      <Select style={{ width: '60%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'货物单价'} >
                    <Input />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'货物总值'} required >
                    <InputGroup compact>
                      <Input style={{ width: '40%' }} />
                      <Select mode="combobox" style={{ width: '60%' }} />
                    </InputGroup>
                  </FormItem>
                </Col>
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'原产国'} required >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'原产地区'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'境外生产企业'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>}
                {ioType === 'out' && <Col span="6">
                  <FormItem {...formItemLayout} label={'产地'} >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>}
                {ioType === 'out' && <Col span="6">
                  <FormItem {...formItemLayout} label={'生产单位'} required >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>}
                {ioType === 'out' && <Col span="6">
                  <FormItem {...formItemLayout} label={'生产单位注册号'} required >
                    <Select mode="combobox" />
                  </FormItem>
                </Col>}
                <Col span="6">
                  <FormItem {...formItemLayout} label={'生产批号'} >
                    <Input />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem {...formItemLayout} label={'生产日期'} >
                    <DatePicker style={{ width: '100%' }} />
                  </FormItem>
                </Col>
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'产品有效期'} >
                    <DatePicker style={{ width: '100%' }} />
                  </FormItem>
                </Col>}
                {ioType === 'in' && <Col span="6">
                  <FormItem {...formItemLayout} label={'产品保质期'} >
                    <Input addonAfter="天" />
                  </FormItem>
                </Col>}
              </Row>
            </Card>
          </Form>
        </div>
        <DataPane fullscreen={this.props.fullscreen}
          columns={columns} bordered scrollOffset={312}
          dataSource={this.state.bodies} rowKey="id" loading={this.state.loading}
        >
          <DataPane.Toolbar>
            <Button icon="export" onClick={this.handleEntrybodyExport}>导出表体数据</Button>
            <DataPane.Actions>
              <Summary>
                <Summary.Item label="总数量" addonAfter="KG">{totGrossWt.toFixed(2)}</Summary.Item>
                <Summary.Item label="总重量" addonAfter="KG">{totWetWt.toFixed(3)}</Summary.Item>
                <Summary.Item label="总HS标准量" addonAfter="元">{totTrade.toFixed(2)}</Summary.Item>
              </Summary>
            </DataPane.Actions>
          </DataPane.Toolbar>
        </DataPane>
      </div>
    );
  }
}
