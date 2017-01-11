import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Button, Card, Col, Icon, Row, Table, Tag, Tooltip } from 'antd';
import moment from 'moment';
import { openAcceptModal, loadciqSups, setDispStatus } from 'common/reducers/cmsDelegation';
import { loadDeclCiqPanel } from 'common/reducers/cmsDelgInfoHub';
import InfoItem from 'client/components/InfoItem';
import CiqDispModal from '../ciqDispModal';

@injectIntl
@connect(
  state => ({
    delgNo: state.cmsDelgInfoHub.previewer.delgNo,
    ciqdecl: state.cmsDelgInfoHub.previewer.ciqdecl,
    tenantId: state.account.tenantId,
    tabKey: state.cmsDelgInfoHub.previewer.tabKey,
    delegation: state.cmsDelgInfoHub.previewer.delegation,
  }),
  { loadDeclCiqPanel, openAcceptModal, loadciqSups, setDispStatus }
)
export default class CiqDeclPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    delgNo: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    delegation: PropTypes.object,
    ciqdecl: PropTypes.shape({
      inspection_name: PropTypes.string,
      acpt_time: PropTypes.date,
      source: PropTypes.number,
      status: PropTypes.number,
      recv_tenant_id: PropTypes.number,
      ciqlist: PropTypes.arrayOf(PropTypes.shape({
        pre_entry_seq_no: PropTypes.string,
      })),
    }),
  }
  componentDidMount() {
    this.props.loadDeclCiqPanel(this.props.delgNo, this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tabKey === 'ciqDecl' &&
      nextProps.tabKey !== this.props.tabKey) {
      this.props.loadDeclCiqPanel(nextProps.delgNo, this.props.tenantId);
    }
  }
  handleOperatorAssign = () => {
    this.props.openAcceptModal({
      tenantId: this.props.tenantId,
      dispatchIds: [this.props.ciqdecl.id],
      delg_no: this.props.delgNo,
      type: 'ciq',
      opt: 'operator',
    });
  }
  handleCiqAssign = () => {
    this.props.loadciqSups(this.props.tenantId, 'CIB');
    this.props.setDispStatus({ ciqDispShow: true });
  }
  render() {
    const { ciqdecl, delegation, tenantId } = this.props;
    const columns = [{
      title: '统一编号',
      dataIndex: 'pre_entry_seq_no',
      width: 120,
    }, {
      title: '海关编号',
      dataIndex: 'entry_id',
      width: 120,
    }, {
      title: '通关单号',
      dataIndex: 'ciq_no',
      width: 120,
    }, {
      title: '品质查验',
      dataIndex: 'ciq_quality_inspect',
      width: 60,
      render: (o) => {
        switch (o) {
          case 2: return <Tag color="rgba(39, 187, 71, 0.65)">通过</Tag>;
          case 1: return <Tag color="#F04134">是</Tag>;
          case 0: return <Tag>否</Tag>;
          default: return null;
        }
      },
    }, {
      title: '动检查验',
      dataIndex: 'ciq_ap_inspect',
      width: 60,
      render: (o) => {
        switch (o) {
          case 2: return <Tag color="rgba(39, 187, 71, 0.65)">通过</Tag>;
          case 1: return <Tag color="#F04134">是</Tag>;
          case 0: return <Tag>否</Tag>;
          default: return null;
        }
      },
    }];
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }}>
          <Row gutter={8} style={{ padding: 8 }}>
            <Col span="12">
              <InfoItem labelCol={{ span: 3 }} label="报检服务商"
                field={ciqdecl.ciq_name} fieldCol={{ span: 9 }}
              />
            </Col>
            <Col span="8">
              <InfoItem labelCol={{ span: 3 }} label="受理日期" fieldCol={{ span: 9 }}
                field={ciqdecl.acpt_time && moment(ciqdecl.acpt_time).format('YYYY.MM.DD HH:mm')}
              />
            </Col>
            <Col span="4">
              <InfoItem labelCol={{ span: 3 }} label="操作人"
                field={ciqdecl.recv_login_name} fieldCol={{ span: 9 }}
              />
            </Col>
          </Row>
          <div className="card-footer">
            <Badge status="warning" text="报检待处理" />
            <div className="toolbar-right">
              {delegation.appointed_option === 0 && ciqdecl.ciq_tenant_id === tenantId &&
                <Tooltip title="分配报检供应商">
                  <Button type="ghost" onClick={this.handleCiqAssign}><Icon type="share-alt" /> 分配</Button>
                </Tooltip>
              }
              {(ciqdecl.type === 1 || ciqdecl.ciq_tenant_id === -1) &&
                <Tooltip title="指派操作人员">
                  <Button type="ghost" shape="circle" onClick={this.handleOperatorAssign}><Icon type="user" /></Button>
                </Tooltip>
              }
            </div>
          </div>
        </Card>
        <Card bodyStyle={{ padding: 0 }}>
          <Table size="middle" columns={columns} pagination={false} dataSource={ciqdecl.ciqlist} scroll={{ x: 580 }} />
        </Card>
        <CiqDispModal />
      </div>
    );
  }
}
