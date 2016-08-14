import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Card } from 'antd';
import { TENANT_ASPECT } from 'common/constants';
import './pane.less';

function getColCls(col) {
  if (col) {
    const { span, offset } = col;
    const spanCls = span ? `col-${span}` : '';
    const offsetCls = offset ? `col-offset-${offset}` : '';
    return `${spanCls} ${offsetCls}`;
  }
  return '';
}
function PaneFormItem(props) {
  const { label, labelCol, field, fieldCol } = props;
  const labelCls = getColCls(labelCol);
  const fieldCls = `pane-field ${getColCls(fieldCol)}`;
  return (
    <div className="pane-form-item">
      <label className={labelCls} htmlFor="pane">{label}：</label>
      <div className={fieldCls}>{field}</div>
    </div>
  );
}
PaneFormItem.propTypes = {
  label: PropTypes.string.isRequired,
  labelCol: PropTypes.object,
  fieldCol: PropTypes.object,
};
@injectIntl
@connect(
  state => ({
    aspect: state.account.aspect,
    delegation: state.cmsDelegation.previewer.delegation,
  })
)
export default class BasicPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    aspect: PropTypes.number.isRequired,
    delegation: PropTypes.object.isRequired,
  }

  render() {
    const { delegation } = this.props;
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 16 }}>
          <Row>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="提运单号"
                field={delegation.delg_no} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="合同号"
                field={delegation.contract_no} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="发票号"
                field={delegation.invoice_no} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="运输方式"
                field={delegation.trans_mode} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="船名航次"
                field={delegation.voyage_no} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="件数"
                field={delegation.pieces} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="重量"
                field={`${delegation.weight ? delegation.weight : ''} 公斤`} fieldCol={{ span: 9 }}
              />
            </Col>
           </Row>
          <Row>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="报关类型"
                field={delegation.delg_type} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="贸易方式"
                field={delegation.trade_mode} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="备案号"
                field={delegation.ems_no} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="企业内部编号"
                field={this.props.aspect === TENANT_ASPECT.BO ? delegation.ref_delg_external_no : delegation.ref_recv_external_no}
                fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 3 }} label="备注"
                field={delegation.remark}
                fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
