import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Spin, List } from 'antd';
import { loadciqSups, setDispStatus } from 'common/reducers/cmsDelegation';
import { loadDeclCiqPanel } from 'common/reducers/cmsDelegationDock';
import CiqDeclCard from '../card/ciqDeclCard';

@connect(
  state => ({
    ciqPanel: state.cmsDelegationDock.ciqPanel,
    tenantId: state.account.tenantId,
    tabKey: state.cmsDelegationDock.tabKey,
    ciqSpinning: state.cmsDelegationDock.ciqPanelLoading,
    delegation: state.cmsDelegationDock.previewer.delegation,
  }),
  { loadDeclCiqPanel, loadciqSups, setDispStatus }
)
export default class CiqDeclPane extends React.Component {
  static propTypes = {
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
    const {
      ciqPanel, ciqSpinning,
    } = this.props;
    return (
      <div className="pane-content tab-pane">
        <Spin spinning={ciqSpinning}>
          <List
            itemLayout="horizontal"
            dataSource={ciqPanel.ciqlist}
            renderItem={item => (
              <List.Item>
                <CiqDeclCard ciqDecl={item} />
              </List.Item>
            )}
          />
        </Spin>
      </div>
    );
  }
}
