import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Button, Card, Col, Icon, Progress, Row, Table, Tag, Tooltip, message } from 'antd';
import moment from 'moment';
import { DECL_I_TYPE, DECL_E_TYPE, CMS_DELEGATION_STATUS, CMS_DECL_STATUS } from 'common/constants';
import { openAcceptModal, ensureManifestMeta } from 'common/reducers/cmsDelegation';
import { loadCustPanel } from 'common/reducers/cmsDelgInfoHub';
import InfoItem from 'client/components/InfoItem';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    delgNo: state.cmsDelgInfoHub.previewer.delgNo,
    customsPanel: state.cmsDelgInfoHub.customsPanel,
    tabKey: state.cmsDelgInfoHub.tabKey,
    billMake: state.cmsDelegation.billMake,
    delegation: state.cmsDelgInfoHub.previewer.delegation,
  }),
  { loadCustPanel, openAcceptModal, ensureManifestMeta }
)
export default class CustomsDeclPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    delgNo: PropTypes.string.isRequired,
    customsPanel: PropTypes.object.isRequired,
    billMake: PropTypes.object.isRequired,
    delegation: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
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
  handleView = (ev) => {
    ev.stopPropagation();
    this.props.ensureManifestMeta(this.props.delgNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        const { i_e_type: ietype, bill_seq_no: seqno } = result.data;
        const clearType = ietype === 0 ? 'import' : 'export';
        const link = `/clearance/${clearType}/manifest/view/`;
        this.context.router.push(`${link}${seqno}`);
      }
    });
  }
  handleMake = (ev) => {
    ev.stopPropagation();
    this.props.ensureManifestMeta(this.props.delgNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        const { i_e_type: ietype, bill_seq_no: seqno } = result.data;
        const clearType = ietype === 0 ? 'import' : 'export';
        const link = `/clearance/${clearType}/manifest/`;
        this.context.router.push(`${link}${seqno}`);
      }
    });
  }
  button() {
    const { customsPanel } = this.props;
    const bill = customsPanel.bill;
    if (customsPanel.recv_tenant_id === customsPanel.customs_tenant_id || customsPanel.customs_tenant_id === -1) {
      if (customsPanel.status === CMS_DELEGATION_STATUS.accepted) {
        return <Button type="primary" size="small" ghost icon="addfile" onClick={this.handleMake}>创建清单</Button>;
      } else if (customsPanel.status > CMS_DELEGATION_STATUS.accepted && bill.bill_status < 3) {
        return (
          <Button type="primary" size="small" ghost icon="edit" onClick={this.handleMake}>编辑清单</Button>
        );
      } else if (bill.bill_status >= 3) {
        return <Button icon="eye" size="small" onClick={ev => this.handleView(ev)}>查看清单</Button>;
      }
    } else if (customsPanel.status > CMS_DELEGATION_STATUS.accepted) {
      return <Button icon="eye" size="small" onClick={ev => this.handleView(ev)}>查看清单</Button>;
    }
  }
  handleOperatorAssign = () => {
    this.props.openAcceptModal({
      tenantId: this.props.tenantId,
      dispatchIds: [this.props.customsPanel.id],
      delg_no: this.props.delgNo,
      type: 'delg',
      opt: 'operator',
    });
  }
  render() {
    const { customsPanel } = this.props;
    const bill = customsPanel.bill;
    const tableDatas = (bill.children || []);
    const declTypes = DECL_I_TYPE.concat(DECL_E_TYPE).filter(dt => dt.key === bill.decl_way_code);
    const panelHeader = (
      <span>{declTypes.length > 0 ? declTypes[0].value : ''}：{bill.pack_count}件/{bill.gross_wt}千克</span>
    );
    const perVal = (bill.bill_status * 25) > 100 ? 100 : bill.bill_status * 25;
    const manifestProgress = (<Progress percent={perVal} strokeWidth={5} showInfo={false} />);
    const columns = [{
      title: '报关单',
      dataIndex: 'customs_inspect',
      render: (o, record) => {
        let inspectFlag = <Tag>否</Tag>;
        let sheetType = '';
        if (record.sheet_type === 'CDF') {
          sheetType = <Tag color="blue-inverse">报关单</Tag>;
        } else if (record.sheet_type === 'FTZ') {
          sheetType = <Tag color="blue">备案清单</Tag>;
        }
        const decl = CMS_DECL_STATUS.filter(st => st.value === o)[0];
        let declStatus = '';
        if (record.status === 0) {
          declStatus = <Badge status="default" text={decl && decl.text} />;
        } else if (record.status === 1) {
          declStatus = <Badge status="warning" text={decl && decl.text} />;
        } else if (record.status === 2) {
          declStatus = <Badge status="processing" text={decl && decl.text} />;
        } else if (record.status === 3) {
          declStatus = <Badge status="success" text={decl && decl.text} />;
        }
        const declNo = (record.entry_id) ? <span>{sheetType} 海关编号# {record.entry_id}</span> : <span className="mdc-text-grey">{sheetType} 预报关编号# {record.pre_entry_seq_no}</span>;
        if (o === 1) {
          inspectFlag = <Tag color="#F04134">是</Tag>;
        } else if (o === 2) {
          inspectFlag = <Tag color="rgba(39, 187, 71, 0.65)">通过</Tag>;
        }
        return (<Card title={declNo} className="with-card-footer">
          {record.note}
          {inspectFlag}
          <div className="card-footer">
            {declStatus}
          </div>
        </Card>);
      },
    }];
    return (
      <div className="pane-content tab-pane">
        <Row gutter={16}>
          <Col span={18} className="table-list">
            <Card bodyStyle={{ padding: 16 }}>
              {manifestProgress}{panelHeader}{this.button()}
            </Card>
            <Table size="middle" showHeader={false} columns={columns} pagination={false} dataSource={tableDatas} />
          </Col>
          <Col span={6}>
            <Card bodyStyle={{ padding: 16 }} className="secondary-card with-card-footer">
              <Row gutter={8}>
                <Col span="24">
                  <InfoItem labelCol={{ span: 3 }} label="报关服务商"
                    field={customsPanel.recv_name} fieldCol={{ span: 9 }}
                  />
                </Col>
                <Col span="24">
                  <InfoItem labelCol={{ span: 3 }} label="接单日期" fieldCol={{ span: 9 }}
                    field={customsPanel.acpt_time
                  && moment(customsPanel.acpt_time).format('YYYY.MM.DD')}
                  />
                </Col>
                <Col span="24">
                  <InfoItem labelCol={{ span: 3 }} label="制单人"
                    field={customsPanel.recv_login_name} fieldCol={{ span: 9 }}
                  />
                </Col>
              </Row>
              {(customsPanel.type === 1 || customsPanel.customs_tenant_id === -1) && <div className="card-footer">
                <div className="toolbar-right">
                  <Tooltip title="分配制单人">
                    <Button type="ghost" shape="circle" onClick={this.handleOperatorAssign}><Icon type="user" /></Button>
                  </Tooltip>
                </div>
              </div>}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}
