import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Spin, Button, Card, Col, Icon, Progress, Row, List, message } from 'antd';
import moment from 'moment';
import { ensureManifestMeta } from 'common/reducers/cmsDelegation';
import { loadCustPanel, setOpetaor } from 'common/reducers/cmsDelegationDock';
import { loadOperators } from 'common/reducers/crmCustomers';
import MemberSelect from 'client/components/MemberSelect';
import InfoItem from 'client/components/InfoItem';
import CusDeclCard from '../card/cusDeclCard';


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    delgNo: state.cmsDelegationDock.previewer.delegation.delg_no,
    customsPanel: state.cmsDelegationDock.customsPanel,
    tabKey: state.cmsDelegationDock.tabKey,
    customsSpinning: state.cmsDelegationDock.customsPanelLoading,
    loginId: state.account.loginId,
    loginName: state.account.username,
    partnerId: state.cmsDelegationDock.previewer.delgDispatch.send_partner_id,
    userMembers: state.account.userMembers,
  }),
  {
    loadCustPanel, ensureManifestMeta, setOpetaor, loadOperators,
  }
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
    this.props.loadOperators(this.props.partnerId, this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.delgNo !== this.props.delgNo) { // fixme 已经翻到当前tab页, 关闭panel再打开, receive在翻到tab页前就会产生
      nextProps.loadCustPanel({
        delgNo: nextProps.delgNo,
        tenantId: this.props.tenantId,
      });
    }
    if (nextProps.partnerId !== this.props.partnerId) {
      this.props.loadOperators(nextProps.partnerId, nextProps.tenantId);
    }
  }
  handleView = (ev) => {
    ev.stopPropagation();
    const { bill } = this.props.customsPanel;
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
  handleMenuClick = (loginId) => {
    const operator = this.props.userMembers.filter(dop => dop.login_id === Number(loginId))[0];
    this.props.setOpetaor(operator.login_id, operator.name, this.props.delgNo);
  }
  renderManifestAction() {
    const { customsPanel } = this.props;
    const { bill } = customsPanel;
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
    const {
      customsPanel, customsSpinning, tenantId, partnerId,
    } = this.props;
    const { bill } = customsPanel;
    const tableDatas = customsPanel.decls;

    const manifestProgress = (<div style={{ width: 200 }}>
      制单进度 <Progress strokeWidth={5} percent={bill.bill_status} /></div>);
    const assignable = (customsPanel.customs_tenant_id === tenantId ||
      customsPanel.customs_tenant_id === -1);
    return (
      <div className="pane-content tab-pane table-list">
        <Spin spinning={customsSpinning}>
          <Card
            title={manifestProgress}
            extra={this.renderManifestAction()}
            bodyStyle={{ padding: 16 }}

          >
            <Row gutter={16} className="info-group-underline">
              <Col span="6">
                <MemberSelect
                  preparerName={bill.preparer_name}
                  editable={assignable}
                  partnerId={partnerId}
                  onSelect={this.handleMenuClick}
                />
              </Col>
              <Col span="2">
                <InfoItem label="清单项数" addonAfter="项" field={bill.g_count} />
              </Col>
              <Col span="2">
                <InfoItem label="总件数" addonAfter="件" field={bill.pack_count} />
              </Col>
              <Col span="4">
                <InfoItem label="总毛重" addonAfter="千克" field={bill.gross_wt} />
              </Col>
              <Col span="4">
                <InfoItem label="总金额" addonAfter="美元" field={bill.total_trades} />
              </Col>
              <Col span="6">
                <InfoItem
                  label="制单时间"
                  addonBefore={<Icon type="clock-circle-o" />}
                  field={bill.created_date && moment(bill.created_date).format('YYYY.MM.DD HH:mm')}
                />
              </Col>
            </Row>
          </Card>
          <List
            itemLayout="horizontal"
            dataSource={tableDatas}
            renderItem={item => (
              <List.Item>
                <CusDeclCard customsDecl={item} manifest={bill} />
              </List.Item>
            )}
          />
        </Spin>
      </div>
    );
  }
}
