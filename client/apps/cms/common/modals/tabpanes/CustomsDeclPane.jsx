import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Spin, Badge, Button, Card, Col, Icon, Progress, Row, Table, Tag, Steps, message } from 'antd';
import moment from 'moment';
import { CMS_DECL_STATUS } from 'common/constants';
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
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { loadCustPanel, openAcceptModal, ensureManifestMeta, loadDelgOperators }
)
export default class CustomsDeclPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    delgNo: PropTypes.string.isRequired,
    customsPanel: PropTypes.shape({
      customs_name: PropTypes.string,
      acpt_time: PropTypes.date,
      accepted: PropTypes.bool,
      bill: PropTypes.shape({ bill_status: PropTypes.number }),
      decls: PropTypes.arrayOf(PropTypes.shape({ gross_wt: PropTypes.number })),
    }).isRequired,
    customsSpinning: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.props.loadCustPanel({
      delgNo: this.props.delgNo,
      tenantId: this.props.tenantId,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tabKey === 'customsDecl' && nextProps.delgNo !== this.props.delgNo) {
      nextProps.loadCustPanel({
        delgNo: nextProps.delgNo,
        tenantId: this.props.tenantId,
      });
    }
  }
  handleView = (ev) => {
    ev.stopPropagation();
    const bill = this.props.customsPanel.bill;
    const clearType = bill.i_e_type === 0 ? 'import' : 'export';
    const link = `/clearance/${clearType}/manifest/view/`;
    this.context.router.push(`${link}${bill.bill_seq_no}`);
  }
  handleMake = (ev) => {
    ev.stopPropagation();
    const { loginId, loginName, delgNo } = this.props;
    this.props.ensureManifestMeta({ delg_no: delgNo, loginId, loginName }).then((result) => {
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
  handleManfestEdit = (ev) => {
    ev.stopPropagation();
    const { customsPanel } = this.props;
    const clearType = customsPanel.bill.i_e_type === 0 ? 'import' : 'export';
    const link = `/clearance/${clearType}/manifest/`;
    this.context.router.push(`${link}${customsPanel.bill.bill_seq_no}`);
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
    const bill = customsPanel.bill;
    if (customsPanel.accepted) {
      if (bill.bill_status === 0) {
        return <Button type="primary" ghost icon="addfile" onClick={this.handleMake}>创建</Button>;
      } else if (bill.bill_status < 100) {
        return (
          <Button type="primary" ghost icon="edit" onClick={this.handleManfestEdit}>编辑</Button>
        );
      } else if (bill.bill_status === 100 && bill.bill_seq_no) {
        return <Button icon="eye" onClick={this.handleView}>查看</Button>;
      }
    }
  }
  render() {
    const { customsPanel, customsSpinning, tenantId } = this.props;
    const bill = customsPanel.bill;
    const tableDatas = customsPanel.decls;
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
        const declStatus = decl && <Badge status="default" text={decl.text} />;
        const declNo = (record.entry_id) ?
          <span>海关编号# {record.entry_id} {sheetType}</span> :
          <span className="mdc-text-grey">预报关编号# {record.pre_entry_seq_no} {sheetType}</span>;
        if (o === 1) {
          inspectFlag = <Tag color="#F04134">是</Tag>;
        } else if (o === 2) {
          inspectFlag = <Tag color="rgba(39, 187, 71, 0.65)">通过</Tag>;
        }
        let step = 0;
        if (record.status === CMS_DECL_STATUS[3].value) {
          step = 1;
        } else if (record.passed) {
          step = 2;
        }
        return (<Card title={declNo} className="with-card-footer">
          <Row style={{ marginBottom: 16 }}>
            <Col span="24">
              <Steps progressDot current={step}>
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
    const assignable = (customsPanel.customs_tenant_id === tenantId || customsPanel.customs_tenant_id === -1);
    // const assigneeOptions = this.state.data.map(d => <Option key={d.value}>{d.text}</Option>);
    // todo declValue
    return (
      <div className="pane-content tab-pane">
        <Spin spinning={customsSpinning}>
          <Row gutter={16}>
            <Col span={18} className="table-list">
              <Card title={manifestProgress} extra={this.renderManifestAction()} bodyStyle={{ padding: 16 }}>
                <Row gutter={8}>
                  <Col span="6">
                    <InfoItem type="select" label="制单人" placeholder="分配制单人" addonBefore={<Icon type="user" />}
                      field={bill.preparer_name} editable={assignable}
                    />
                  </Col>
                  <Col span="6">
                    <InfoItem label="制单日期" addonBefore={<Icon type="calendar" />}
                      field={bill.created_date && moment(bill.created_date).format('YYYY.MM.DD')}
                    />
                  </Col>
                  <Col span="6">
                    <InfoItem label="物料数量" suffix="项" field={bill.pack_count} />
                  </Col>
                  <Col span="6">
                    <InfoItem label="申报货值" suffix="人民币" field={bill.declValue} />
                  </Col>
                </Row>
              </Card>
              <Table size="middle" showHeader={false} columns={columns} pagination={false} dataSource={tableDatas} />
            </Col>
            <Col span={6}>
              <Card bodyStyle={{ padding: 16 }} className="secondary-card">
                <Row gutter={8}>
                  <Col span="24">
                    <InfoItem label="报关服务商" field={customsPanel.customs_name} />
                  </Col>
                  <Col span="24">
                    <InfoItem label="接单日期" field={customsPanel.acpt_time && moment(customsPanel.acpt_time).format('YYYY.MM.DD')} />
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
