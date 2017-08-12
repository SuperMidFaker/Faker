import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Spin, Badge, Button, Card, Col, Icon, Row, Table, Tag, Tooltip } from 'antd';
import moment from 'moment';
import { loadciqSups, setDispStatus } from 'common/reducers/cmsDelegation';
import { loadDeclCiqPanel } from 'common/reducers/cmsDelgInfoHub';
import InfoItem from 'client/components/InfoItem';
import CiqDispModal from '../ciqDispModal';

@injectIntl
@connect(
  state => ({
    ciqPanel: state.cmsDelgInfoHub.ciqPanel,
    tenantId: state.account.tenantId,
    tabKey: state.cmsDelgInfoHub.tabKey,
    ciqSpinning: state.cmsDelgInfoHub.ciqPanelLoading,
    delegation: state.cmsDelgInfoHub.previewer.delegation,
  }),
  { loadDeclCiqPanel, loadciqSups, setDispStatus }
)
export default class CiqDeclPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    delegation: PropTypes.object,
    ciqPanel: PropTypes.shape({
      ciq_name: PropTypes.string,
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
    this.props.loadDeclCiqPanel(this.props.delegation.delg_no, this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tabKey === 'ciqDecl' && nextProps.delegation.delg_no !== this.props.delegation.delg_no) {
      this.props.loadDeclCiqPanel(nextProps.delegation.delg_no, this.props.tenantId);
    }
  }
  handleCiqAssign = () => {
    this.props.loadciqSups(this.props.tenantId, 'CIB');
    this.props.setDispStatus({ ciqDispShow: true });
  }
  render() {
    const { ciqPanel, ciqSpinning, delegation, tenantId } = this.props;
    const columns = [{
      title: '内部编号',
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
        <Spin spinning={ciqSpinning}>
          <Row gutter={16}>
            <Col span={18}>
              <Card bodyStyle={{ padding: 0 }} noHovering>
                <Table size="middle" columns={columns} pagination={false} dataSource={ciqPanel.ciqlist} scroll={{ x: 580 }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card bodyStyle={{ padding: 16, paddingBottom: 40 }} className="secondary-card">
                <Row gutter={8}>
                  <Col span="24">
                    <InfoItem label="报检服务商" field={ciqPanel.ciq_name} />
                  </Col>
                  <Col span="24">
                    <InfoItem label="受理日期" field={ciqPanel.acpt_time && moment(ciqPanel.acpt_time).format('YYYY.MM.DD HH:mm')} />
                  </Col>
                  <Col span="24">
                    <InfoItem label="操作人" field={ciqPanel.recv_login_name} />
                  </Col>
                </Row>
                <div className="card-footer">
                  <Badge status="warning" text="报检待处理" />
                  <div className="toolbar-right">
                    {delegation.appointed_option === 0 && ciqPanel.ciq_tenant_id === tenantId &&
                    <Tooltip title="分配报检供应商">
                      <Button type="ghost" onClick={this.handleCiqAssign}><Icon type="share-alt" /> 分配</Button>
                    </Tooltip>}
                    {/*
                    {(ciqPanel.type === 1 || ciqPanel.ciq_tenant_id === -1) &&
                    <Tooltip title="指派执行者">
                      <Button type="ghost" shape="circle" onClick={this.handleOperatorAssign}><Icon type="user" /></Button>
                    </Tooltip>}
                  */}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Spin>
        <CiqDispModal />
      </div>
    );
  }
}
