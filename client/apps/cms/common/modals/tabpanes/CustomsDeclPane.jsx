import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Tag, Row, Col, Card, Tabs, Table } from 'antd';
import moment from 'moment';
import { DELG_SOURCE, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import { loadSubdelgsTable, loadCustPanel } from 'common/reducers/cmsDelegation';

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
    tenantId: state.account.tenantId,
    delgNo: state.cmsDelegation.previewer.delgNo,
    delgPanel: state.cmsDelegation.delgPanel,
    delgBillsMap: state.cmsDelegation.delgBillsMap,
    tabKey: state.cmsDelegation.previewer.tabKey,
  }),
  { loadSubdelgsTable, loadCustPanel }
)
export default class CustomsDeclPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    delgNo: PropTypes.string.isRequired,
    delgPanel: PropTypes.object.isRequired,
    delgBillsMap: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.props.loadCustPanel({
      delgNo: this.props.delgNo,
      tenantId: this.props.tenantId,
    });
    this.props.loadSubdelgsTable({
      delg_no: this.props.delgNo,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tabKey === 'customsDecl' &&
      nextProps.tabKey !== this.props.tabKey) {
      nextProps.loadCustPanel({
        delgNo: nextProps.delgNo,
        tenantId: this.props.tenantId,
      });
      nextProps.loadSubdelgsTable({
        delg_no: nextProps.delgNo,
      });
    }
  }
  render() {
    const { delgPanel, delgBillsMap } = this.props;
    const delgBills = delgBillsMap[this.props.delgNo];
    const columns = [{
      title: '统一编号',
      dataIndex: 'pre_entry_seq_no',
    }, {
      title: '海关编号',
      dataIndex: 'entry_id',
    }, {
      title: '申报日期',
      dataIndex: 'd_date',
      render: o => o && moment(o).format('YYYY.MM.DD HH:mm'),
    }, {
      title: '通关状态',
      dataIndex: 'note',
    }, {
      title: '海关查验',
      dataIndex: 'customs_inspect',
      render: (o) => {
        if (o === 1) {
          return <Tag color="red">是</Tag>;
        } else {
          return <Tag>否</Tag>;
        }
      },
    }];
    let sourceText = '';
    if (delgPanel.source === DELG_SOURCE.consigned) {
      sourceText = '委托';
    } else if (delgPanel.source === DELG_SOURCE.subcontracted) {
      sourceText = '分包';
    } else {
      sourceText = '转包';
    }
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 16 }}>
          <Row>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="报关企业"
                field={delgPanel.recv_name} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="受理日期" fieldCol={{ span: 9 }}
                field={delgPanel.acpt_time
                  && moment(delgPanel.acpt_time).format('YYYY.MM.DD HH:mm')}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 3 }} label="来源"
                field={sourceText} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
        </Card>
        {
          delgBills.length > 0 &&
          <Tabs defaultActiveKey={delgBills[0].key} tabPosition="left">
            {
              delgBills.map((bill) => {
                const tableDatas = (bill.children || []).map(decl => ({
                  key: decl.key,
                  pre_entry_seq_no: decl.pre_entry_seq_no,
                  entry_id: decl.entry_id,
                  note: decl.note,
                  process_date: decl.process_date,
                }));
                const declTypes = DECL_I_TYPE.concat(DECL_E_TYPE).filter(dt => dt.key === bill.decl_way_code);
                return (
                  <TabPane tab={bill.bill_seq_no} key={bill.key} style={{ padding: 8 }}>
                    <Card bodyStyle={{ padding: 8 }}>
                      <Row>
                        <Col span="6">
                          <PaneFormItem labelCol={{ span: 3 }} label="报关类型"
                            field={declTypes.length > 0 ? declTypes[0].value : ''} fieldCol={{ span: 9 }}
                          />
                        </Col>
                        <Col span="6">
                          <PaneFormItem labelCol={{ span: 3 }} label="备案号"
                            field={bill.manual_no} fieldCol={{ span: 9 }}
                          />
                        </Col>
                        <Col span="6">
                          <PaneFormItem labelCol={{ span: 3 }} label="件数"
                            field={bill.pack_count} fieldCol={{ span: 9 }}
                          />
                        </Col>
                        <Col span="6">
                          <PaneFormItem labelCol={{ span: 3 }} label="毛重"
                            field={bill.gross_wt} fieldCol={{ span: 9 }}
                          />
                        </Col>
                      </Row>
                      <Table size="small" columns={columns} pagination={false} dataSource={tableDatas} />
                    </Card>
                  </TabPane>);
              })
            }
          </Tabs>
        }
      </div>
    );
  }
}
