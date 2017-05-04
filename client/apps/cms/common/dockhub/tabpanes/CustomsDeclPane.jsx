import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import Avatar from 'react-avatar';
import { Spin, Button, Card, Col, Icon, Progress, Row, Table, message } from 'antd';
import moment from 'moment';
import { openAcceptModal, ensureManifestMeta, loadDelgOperators } from 'common/reducers/cmsDelegation';
import { loadCustPanel } from 'common/reducers/cmsDelgInfoHub';
import CustomsDeclSheetCard from './customsDeclSheetCard';
import InfoItem from 'client/components/InfoItem';

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
    if (nextProps.tabKey === 'customsDecl') {
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
        return <Button type="primary" ghost icon="addfile" onClick={this.handleMake}>创建清单</Button>;
      } else if (bill.bill_status < 100) {
        return (
          <Button type="primary" ghost icon="edit" onClick={this.handleManfestEdit}>编辑清单</Button>
        );
      } else if (bill.bill_status === 100 && bill.bill_seq_no) {
        return <Button icon="eye" onClick={this.handleView}>查看清单</Button>;
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
    const manifestProgress = (<div style={{ width: 200 }}>制单进度 <Progress strokeWidth={5} percent={bill.bill_status} /></div>);
    const columns = [{
      title: '报关单',
      dataIndex: 'customs_inspect',
      render: (o, record) => <CustomsDeclSheetCard customsDecl={record} />,
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
                    <InfoItem type="select" label="制单人" placeholder="分配制单人" addonBefore={<Avatar name={bill.preparer_name} size={28} round />}
                      field={bill.preparer_name} editable={assignable}
                    />
                  </Col>
                  <Col span="6">
                    <InfoItem label="制单日期" addonBefore={<Icon type="calendar" />}
                      field={bill.created_date && moment(bill.created_date).format('YYYY.MM.DD')}
                    />
                  </Col>
                  <Col span="6">
                    <InfoItem label="商品数量" suffix="项" field={bill.pack_count} />
                  </Col>
                  <Col span="6">
                    <InfoItem label="申报货值" suffix="人民币" field={bill.declValue} />
                  </Col>
                </Row>
              </Card>
              <Table size="middle" showHeader={false} columns={columns} pagination={false} dataSource={tableDatas} locale={{ emptyText: '尚未生成报关草单' }} />
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
