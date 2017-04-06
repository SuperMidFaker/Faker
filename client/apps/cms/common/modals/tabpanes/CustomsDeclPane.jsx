import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Spin, Badge, Button, Card, Col, Icon, Progress, Row, Table, Tag, Steps, message } from 'antd';
import moment from 'moment';
import { CMS_DELEGATION_STATUS, CMS_DECL_STATUS } from 'common/constants';
import { openAcceptModal, ensureManifestMeta, loadDelgOperators } from 'common/reducers/cmsDelegation';
import { loadCustPanel } from 'common/reducers/cmsDelgInfoHub';
import InfoItem from 'client/components/InfoItem';

const Step = Steps.Step;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    delgNo: state.cmsDelgInfoHub.previewer.delgNo,
    customsPanel: state.cmsDelgInfoHub.customsPanel,
    tabKey: state.cmsDelgInfoHub.tabKey,
    customsSpinning: state.cmsDelgInfoHub.customsPanelLoading,
    delegation: state.cmsDelgInfoHub.previewer.delegation,
  }),
  { loadCustPanel, openAcceptModal, ensureManifestMeta, loadDelgOperators }
)
export default class CustomsDeclPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    delgNo: PropTypes.string.isRequired,
    customsPanel: PropTypes.object.isRequired,
    customsSpinning: PropTypes.bool.isRequired,
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
  handleOperatorAssign = () => {
    this.props.openAcceptModal({
      tenantId: this.props.tenantId,
      dispatchIds: [this.props.customsPanel.id],
      delg_no: this.props.delgNo,
      type: 'delg',
      opt: 'operator',
    });
  }
  renderManifestAction() {
    const { customsPanel } = this.props;
    const bill = customsPanel.bill; // todo
    if (customsPanel.recv_tenant_id === customsPanel.customs_tenant_id || customsPanel.customs_tenant_id === -1) {
      if (customsPanel.status === CMS_DELEGATION_STATUS.accepted) {
        return <Button type="primary" ghost icon="addfile" onClick={this.handleMake}>创建</Button>;
      } else if (customsPanel.status > CMS_DELEGATION_STATUS.accepted && bill.bill_status < 3) {
        return (
          <Button type="primary" ghost icon="edit" onClick={this.handleMake}>编辑</Button>
        );
      } else if (bill.bill_status === 100) {
        return <Button icon="eye" onClick={ev => this.handleView(ev)}>查看</Button>;
      }
    } else if (customsPanel.status > CMS_DELEGATION_STATUS.accepted) {
      return <Button icon="eye" onClick={ev => this.handleView(ev)}>查看</Button>;
    }
  }
  render() {
    const { customsPanel, customsSpinning } = this.props;
    const bill = customsPanel.bill;
    const tableDatas = (bill.children || []);
    // const declTypes = DECL_I_TYPE.concat(DECL_E_TYPE).filter(dt => dt.key === bill.decl_way_code);
    // const panelHeader = (
    //  <span>{declTypes.length > 0 ? declTypes[0].value : ''}：{bill.pack_count}件/{bill.gross_wt}千克</span>
    // );
    const manifestProgress = (<div style={{ width: 220 }}>报关清单 <Progress strokeWidth={5} percent={bill.bill_status} /></div>);
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
        const decl = CMS_DECL_STATUS.filter(st => st.value === record.status)[0];
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
        const declNo = (record.entry_id) ?
          <span>海关编号# {record.entry_id} {sheetType}</span> :
          <span className="mdc-text-grey">预报关编号# {record.pre_entry_seq_no} {sheetType}</span>;
        if (o === 1) {
          inspectFlag = <Tag color="#F04134">是</Tag>;
        } else if (o === 2) {
          inspectFlag = <Tag color="rgba(39, 187, 71, 0.65)">通过</Tag>;
        }
        return (<Card title={declNo} className="with-card-footer">
          <Row style={{ marginBottom: 16 }}>
            <Col span="24">
              <Steps progressDot current={1}>
                <Step title="录入日期" description={record.created_date
                    && moment(record.created_date).format('YYYY.MM.DD')}
                />
                <Step title="申报日期" description={record.d_date
                    && moment(record.d_date).format('YYYY.MM.DD')}
                />
                <Step title="放行日期" description={record.clear_date
                    && moment(record.clear_date).format('YYYY.MM.DD')}
                />
              </Steps>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span="12">
              <InfoItem label="收发货人" field={record.trade_name} />
            </Col>
            <Col span="12">
              <InfoItem label="申报单位" field={record.agent_name} />
            </Col>
            <Col span="8">
              <InfoItem label="进出口岸" field={record.i_e_port} />
            </Col>
            <Col span="8">
              <InfoItem label="监管方式" field={record.trade_mode} />
            </Col>
            <Col span="8">
              <InfoItem label="海关查验" field={inspectFlag} />
            </Col>
          </Row>
          <div className="card-footer">
            {declStatus} {record.note}
          </div>
        </Card>);
      },
    }];
    const assignable = (customsPanel.type === 1 || customsPanel.customs_tenant_id === -1);
    // const assigneeOptions = this.state.data.map(d => <Option key={d.value}>{d.text}</Option>);
    return (
      <div className="pane-content tab-pane">
        <Spin spinning={customsSpinning}>
          <Row gutter={16}>
            <Col span={18} className="table-list">
              <Card title={manifestProgress} extra={this.renderManifestAction()} bodyStyle={{ padding: 16 }}>
                <Row gutter={8}>
                  <Col span="6">
                    <InfoItem type="select" label="制单人" placeholder="分配制单人" addonBefore={<Icon type="user" />}
                      field={customsPanel.recv_login_name} editable={assignable}
                    />
                  </Col>
                  <Col span="6">
                    <InfoItem label="制单日期" addonBefore={<Icon type="calendar" />}
                      field={customsPanel.acpt_time
                    && moment(customsPanel.acpt_time).format('YYYY.MM.DD')}
                    />
                  </Col>
                  <Col span="6">
                    <InfoItem label="物料数量" suffix="项"
                      field={customsPanel.itemCount}
                    />
                  </Col>
                  <Col span="6">
                    <InfoItem label="申报货值" suffix="人民币"
                      field={customsPanel.declValue}
                    />
                  </Col>
                </Row>
              </Card>
              <Table size="middle" showHeader={false} columns={columns} pagination={false} dataSource={tableDatas} />
            </Col>
            <Col span={6}>
              <Card bodyStyle={{ padding: 16 }} className="secondary-card">
                <Row gutter={8}>
                  <Col span="24">
                    <InfoItem label="报关服务商"
                      field={customsPanel.recv_name}
                    />
                  </Col>
                  <Col span="24">
                    <InfoItem label="接单日期"
                      field={customsPanel.acpt_time
                    && moment(customsPanel.acpt_time).format('YYYY.MM.DD')}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
    );
  }
}
