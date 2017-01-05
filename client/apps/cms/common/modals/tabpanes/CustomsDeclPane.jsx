import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Card, Col, Collapse, Icon, Row, Table, Tag, Tooltip, message } from 'antd';
import moment from 'moment';
import { DECL_I_TYPE, DECL_E_TYPE, CMS_DELEGATION_STATUS } from 'common/constants';
import { loadSubdelgsTable, loadCustPanel, setPreviewStatus, hidePreviewer, openAcceptModal, loadBillMakeModal } from 'common/reducers/cmsDelegation';
import InfoItem from 'client/components/InfoItem';
import SetOperatorModal from '../operatorModal';

const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    delgNo: state.cmsDelegation.previewer.delgNo,
    delgPanel: state.cmsDelegation.delgPanel,
    tabKey: state.cmsDelegation.previewer.tabKey,
  }),
  { loadSubdelgsTable, loadCustPanel, setPreviewStatus, hidePreviewer, openAcceptModal, loadBillMakeModal }
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
      nextProps.tabKey !== this.props.tabKey ||
      nextProps.delgNo !== this.props.delgNo) {
      nextProps.loadCustPanel({
        delgNo: nextProps.delgNo,
        tenantId: this.props.tenantId,
      });
    }
  }
  handleView = () => {
    this.props.loadBillMakeModal({
      delg_no: this.props.delgNo,
    }, 'view').then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  handleMake = () => {
    this.props.loadBillMakeModal({
      delg_no: this.props.delgNo,
    }, 'make').then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }
  button() {
    const { delgPanel } = this.props;
    if (delgPanel.recv_tenant_id === delgPanel.customs_tenant_id || delgPanel.customs_tenant_id === -1) {
      if (delgPanel.status === CMS_DELEGATION_STATUS.accepted) {
        return <Button type="primary" icon="addfile" onClick={this.handleMake}>创建清单</Button>;
      } else if (delgPanel.status === CMS_DELEGATION_STATUS.processing ||
          (delgPanel.status === CMS_DELEGATION_STATUS.declaring && delgPanel.sub_status === 1)) {
        return (
          <Button type="default" icon="edit" onClick={this.handleMake}>编辑清单</Button>
        );
      } else if (delgPanel.status > CMS_DELEGATION_STATUS.declaring) {
        return <Button icon="eye" onClick={ev => this.handleView(ev)}>查看清单</Button>;
      }
    } else if (delgPanel.status > CMS_DELEGATION_STATUS.accepted) {
      return <Button icon="eye" onClick={ev => this.handleView(ev)}>查看清单</Button>;
    }
  }
  handleOperatorAssign = () => {
    this.props.openAcceptModal({
      tenantId: this.props.tenantId,
      dispatchIds: [this.props.delgPanel.id],
      type: 'delg',
    });
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
                field={delgPanel.recv_login_name} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          {(delgPanel.type === 1 || delgPanel.customs_tenant_id === -1) && <div className="card-footer">
            <div className="toolbar-right">
              <Tooltip title="分配操作人员">
                <Button type="ghost" shape="circle" onClick={this.handleOperatorAssign}><Icon type="user" /></Button>
              </Tooltip>
            </div>
          </div>}
        </Card>
        { delgBills.length > 0 &&
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
                    customs_inspect: decl.customs_inspect,
                    ciq_ap_inspect: decl.ciq_ap_inspect,
                    ciq_quality_inspect: decl.ciq_quality_inspect,
                  }));
                  const declTypes = DECL_I_TYPE.concat(DECL_E_TYPE).filter(dt => dt.key === bill.decl_way_code);
                  const panelHeader = (
                    <div>
                      <span>{declTypes.length > 0 ? declTypes[0].value : ''}：{bill.pack_count}件/{bill.gross_wt}千克</span>
                      <div className="toolbar-right">
                        {this.button()}
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
        <SetOperatorModal />
      </div>
    );
  }
}
