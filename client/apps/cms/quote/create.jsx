import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { DECL_I_TYPE, DECL_E_TYPE, TRANS_MODE, QUOTE_TYPE } from 'common/constants';
import { Form, Select, Col, Row, Table, Card, Button } from 'antd';

const formatMsg = format(messages);
const Option = Select.Option;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

function getRowKey(row) {
  return row.id;
}

@injectIntl
@connect(
  state => ({
    partners: state.cmsDelegation.partners,
    clients: state.cmsDelegation.formRequire.clients,
  }),
)
@connectNav({
  depth: 3,
  text: props => formatMsg(props.intl, 'newPrice'),
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'quote', action: 'create' })
@Form.create()
export default class QuotingCreate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    clients: PropTypes.array.isRequired,
    partners: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleClientChange = () => {}
  render() {
    const { form: { getFieldProps }, clients, partners } = this.props;
    const msg = key => formatMsg(this.props.intl, key);
    const DECL_TYPE = DECL_I_TYPE.concat(DECL_E_TYPE);
    const linkers = clients.concat(partners);
    const columns = [
      {
        title: msg('feeName'),
        dataIndex: 'fee_name',
      }, {
        title: msg('feeCode'),
        dataIndex: 'fee_code',
      }, {
        title: msg('chargeMode'),
        dataIndex: 'charge_mode',
      }, {
        title: msg('lotNum'),
        dataIndex: 'lot_num',
      }, {
        title: msg('freeNum'),
        dataIndex: 'free_num',
      }, {
        title: msg('unitPrice'),
        dataIndex: 'unit_price',
      }, {
        title: msg('modifiedBy'),
        dataIndex: 'modified_by',
      }, {
        title: msg('modifiedTime'),
        dataIndex: 'modification_time',
      }, {
        title: msg('enabledOp'),
        dataIndex: 'enabled',
      }, {
        title: msg('operation'),
        dataIndex: 'operation',
      },
    ];
    return (
      <div className="main-content">
        <Card bodyStyle={{ padding: 16 }}>
          <Row>
            <Col sm={6}>
              <FormItem label={msg('quoteStyle')} {...formItemLayout}>
                <Select style={{ width: '80%' }}
                  {...getFieldProps('quote_style', {
                    rules: [{ required: true, message: '报价类型必选', type: 'number' }],
                  })}
                >
                {
                  QUOTE_TYPE.map(qt =>
                    <Option value={qt.key} key={qt.key}>{qt.text}</Option>
                  )
                }
                </Select>
              </FormItem>
            </Col>
            <Col sm={6}>
              <FormItem label={msg('partners')} {...formItemLayout}>
                <Select showSearch showArrow optionFilterProp="searched"
                  style={{ width: '80%' }}
                  {...getFieldProps('partners', {
                    rules: [{ required: true, message: '必选' }],
                  })}
                >
                {
                  linkers.map(pt => (
                    <Option searched={`${pt.partner_code}${pt.name}`}
                      value={pt.partner_id} key={pt.partner_id}
                    >{pt.name}</Option>)
                  )
                }
                </Select>
              </FormItem>
            </Col>
            <Col sm={6}>
              <FormItem label={msg('declareWay')} {...formItemLayout}>
                <Select style={{ width: '80%' }}
                  {...getFieldProps('decl_way_code', {
                    rules: [{ required: true, message: '报关类型必选' }],
                  })}
                >
                {
                  DECL_TYPE.map(dw =>
                    <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                  )
                }
                </Select>
              </FormItem>
            </Col>
            <Col sm={6}>
              <FormItem label={msg('transMode')} {...formItemLayout}>
                <Select style={{ width: '80%' }} {...getFieldProps('trans_mode', {
                  rules: [{ required: true, message: '运输方式必选', type: 'number' }],
                })}>
                {
                  TRANS_MODE.map(tr =>
                    <Option value={tr.value} key={tr.value}>{tr.text}</Option>
                  )
                }
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Table rowKey={getRowKey} columns={columns} scroll={{ y: 3280 }} />
          </Row>
          <Row style={{ padding: 16 }}>
            <Button size="large" type="primary">{msg('addCosts')}</Button>
          </Row>
        </Card>
        <div className="footer">
          <Button size="large" type="primary" style={{ marginRight: 20 }}>{msg('save')}</Button>
          <Button size="large" type="primary">{msg('cancel')}</Button>
        </div>
      </div>
    );
  }
}
