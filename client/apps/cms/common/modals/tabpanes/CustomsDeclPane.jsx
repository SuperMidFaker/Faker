import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Card, Col, Collapse, Icon, Row, Table, Tag, Tooltip } from 'antd';
import moment from 'moment';
import { DELG_SOURCE, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import { loadSubdelgsTable, loadCustPanel } from 'common/reducers/cmsDelegation';
import InfoItem from 'client/components/InfoItem';

const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    delgNo: state.cmsDelegation.previewer.delgNo,
    delgPanel: state.cmsDelegation.delgPanel,
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
  }
  componentWillMount() {
    this.props.loadCustPanel({
      delgNo: this.props.delgNo,
      tenantId: this.props.tenantId,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tabKey === 'customsDecl' &&
      nextProps.tabKey !== this.props.tabKey) {
      nextProps.loadCustPanel({
        delgNo: nextProps.delgNo,
        tenantId: this.props.tenantId,
      });
    }
  }
  render() {
    const { delgPanel } = this.props;
    const delgBills = delgPanel.bills;
    const columns = [{
      title: '统一编号',
      dataIndex: 'pre_entry_seq_no',
      width: 120,
    }, {
      title: '海关编号',
      dataIndex: 'entry_id',
      width: 120,
    }, {
      title: '通关状态',
      dataIndex: 'note',
    }, {
      title: '海关查验',
      dataIndex: 'customs_inspect',
      width: 70,
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
        <Card bodyStyle={{ padding: 0 }}>
          <Row gutter={8} style={{ padding: 8 }}>
            <Col span="12">
              <InfoItem labelCol={{ span: 3 }} label="报关服务商"
                field={delgPanel.recv_name} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="6">
              <InfoItem labelCol={{ span: 3 }} label="接单日期" fieldCol={{ span: 9 }}
                field={delgPanel.acpt_time
                  && moment(delgPanel.acpt_time).format('YYYY.MM.DD')}
              />
            </Col>
            <Col span="6">
              <InfoItem labelCol={{ span: 3 }} label="操作人"
                field={sourceText} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <div className="card-footer">
            <div className="toolbar-right">
              <Tooltip title="分配操作人员">
                <Button type="ghost" shape="circle"><Icon type="user" /></Button>
              </Tooltip>
            </div>
          </div>
        </Card>
        {
          delgBills.length > 0 &&
          <Card bodyStyle={{ padding: 0 }}>
            <Collapse defaultActiveKey={delgBills[0].key}>
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
                  const panelHeader = (
                    <div>
                      <span>{declTypes.length > 0 ? declTypes[0].value : ''}：{bill.pack_count}件/{bill.gross_wt}千克</span>
                      <div className="toolbar-right">
                        <Button type="primary" icon="addfile">创建清单</Button>
                        <Button type="default" icon="edit">编辑清单</Button>
                        <Button icon="eye">查看清单</Button>
                      </div>
                    </div>
                  );
                  return (
                    <Panel header={panelHeader} key={bill.key} className="table-panel" >
                      <Table size="small" columns={columns} pagination={false} dataSource={tableDatas} scroll={{ x: 580 }} />
                    </Panel>);
                })
              }
            </Collapse>
          </Card>
        }
      </div>
    );
  }
}
