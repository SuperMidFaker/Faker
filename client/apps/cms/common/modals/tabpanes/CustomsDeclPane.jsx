import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Card, Tabs, Table } from 'antd';

const TabPane = Tabs.TabPane;

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
  const labelCls = `info-label ${getColCls(labelCol)}`;
  const fieldCls = `info-data ${getColCls(fieldCol)}`;
  return (
    <div className="info-item">
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
    files: state.cmsDelegation.previewer.files,
    delegateTracking: state.cmsDelegation.previewer.delegateTracking,
  })
)
export default class CustomsDeclPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    aspect: PropTypes.number.isRequired,
    delegation: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    delegateTracking: PropTypes.object.isRequired,
  }
  render() {
    const { delegation, delegateTracking } = this.props;
    const columns = [{
      title: '报关单号',
      dataIndex: 'fee_name',
      key: 'fee_name',
    }, {
      title: '申报日期',
      dataIndex: 'charge_count',
      key: 'charge_count',
    }, {
      title: '通关状态',
      dataIndex: 'unit_price',
      key: 'unit_price',
    }, {
      title: '海关查验',
      dataIndex: 'unit_price',
      key: 'unit_price',
    }];
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 16 }}>
          <Row>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="报关企业"
                field={delegateTracking.recv_name} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="受理日期"
                field={delegateTracking.acpt_time} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="来源"
                field={delegateTracking.source} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
        </Card>
        <Tabs defaultActiveKey="IB1600002021000000" tabPosition="left">
          <TabPane tab="IB1600002021000000" key="IB1600002021000000" style={{ padding: 8 }}>
            <Card bodyStyle={{ padding: 8 }}>
              <Row>
                <Col span="6">
                  <PaneFormItem labelCol={{ span: 3 }} label="报关类型"
                    field={delegation.order_no} fieldCol={{ span: 9 }}
                  />
                </Col>
                <Col span="6">
                  <PaneFormItem labelCol={{ span: 3 }} label="备案号"
                    field={delegation.order_no} fieldCol={{ span: 9 }}
                  />
                </Col>
                <Col span="6">
                  <PaneFormItem labelCol={{ span: 3 }} label="件数"
                    field={delegation.pieces} fieldCol={{ span: 9 }}
                  />
                </Col>
                <Col span="6">
                  <PaneFormItem labelCol={{ span: 3 }} label="毛重"
                    field={delegation.weight} fieldCol={{ span: 9 }}
                  />
                </Col>
              </Row>
              <Table size="small" columns={columns} pagination={false} />
            </Card>
          </TabPane>
          <TabPane tab="IB1600002021000001" key="IB1600002021000001" style={{ padding: 8 }}>
            <Card bodyStyle={{ padding: 8 }}>
              <Row>
                <Col span="6">
                  <PaneFormItem labelCol={{ span: 3 }} label="报关类型"
                    field={delegation.order_no} fieldCol={{ span: 9 }}
                  />
                </Col>
                <Col span="6">
                  <PaneFormItem labelCol={{ span: 3 }} label="备案号"
                    field={delegation.order_no} fieldCol={{ span: 9 }}
                  />
                </Col>
                <Col span="6">
                  <PaneFormItem labelCol={{ span: 3 }} label="件数"
                    field={delegation.pieces} fieldCol={{ span: 9 }}
                  />
                </Col>
                <Col span="6">
                  <PaneFormItem labelCol={{ span: 3 }} label="毛重"
                    field={delegation.weight} fieldCol={{ span: 9 }}
                  />
                </Col>
              </Row>
              <Table size="small" columns={columns} pagination={false} />
            </Card>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
