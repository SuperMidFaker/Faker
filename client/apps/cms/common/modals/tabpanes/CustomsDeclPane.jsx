import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Card, Col, Icon, Row, Table, Tag, Tooltip, message } from 'antd';
import moment from 'moment';
import { DECL_I_TYPE, DECL_E_TYPE, CMS_DELEGATION_STATUS } from 'common/constants';
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
    const columns = [{
      title: '预报关单号',
      dataIndex: 'pre_entry_seq_no',
      width: 160,
    }, {
      title: '海关编号',
      dataIndex: 'entry_id',
      width: 160,
    }, {
      title: '通关状态',
      width: 100,
      dataIndex: 'note',
    }, {
      title: '海关查验',
      dataIndex: 'customs_inspect',
      width: 70,
      render: (o) => {
        if (o === 1) {
          return <Tag color="#F04134">是</Tag>;
        } else if (o === 2) {
          return <Tag color="rgba(39, 187, 71, 0.65)">通过</Tag>;
        } else {
          return <Tag>否</Tag>;
        }
      },
    }];
    return (
      <div className="pane-content tab-pane">
        <Row gutter={16}>
          <Col span={18}>
            <Card title={panelHeader} extra={this.button()} bodyStyle={{ padding: 0 }}>
              <Table size="small" columns={columns} pagination={false} dataSource={tableDatas} scroll={{ x: 580 }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card bodyStyle={{ padding: 0 }}>
              <Row gutter={8} style={{ padding: 16 }}>
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
