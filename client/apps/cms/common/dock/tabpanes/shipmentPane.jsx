import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, message } from 'antd';
import { loadBasicInfo, loadCustPanel, loadDeclCiqPanel, updateCertParam, exchangeBlNo } from 'common/reducers/cmsDelegationDock';
import { loadDeclHead, setInspect } from 'common/reducers/cmsCustomsDeclare';
import { loadPaneExp } from 'common/reducers/cmsExpense';
import MainInfoCard from '../card/mainInfoCard';

@connect(state => ({
  tenantId: state.account.tenantId,
  previewer: state.cmsDelegationDock.previewer,
  tabKey: state.cmsDelegationDock.tabKey,
  declHeadsPane: state.cmsCustomsDeclare.decl_heads,
}), {
  exchangeBlNo,
  loadDeclHead,
  setInspect,
  loadCustPanel,
  loadBasicInfo,
  updateCertParam,
  loadDeclCiqPanel,
  loadPaneExp,
})
@Form.create()
export default class ShipmentPane extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    tabKey: PropTypes.string.isRequired,
  }
  state = {
    tabKey: 'message',
  }
  handleTabChange = (tabKey) => {
    const delgNo = this.props.previewer.delegation.delg_no;
    this.setState({ tabKey });
    if (tabKey === 'inspect') {
      this.props.loadDeclHead(delgNo);
    }
  }
  handleCancel = () => {
    this.props.form.resetFields();
  }
  handleInspectSave = ({
    preEntrySeqNo, delgNo, enabled, field,
  }) => {
    this.props.setInspect({
      preEntrySeqNo, delgNo, field, enabled,
    }).then((result) => {
      if (result.error) {
        if (result.error.message === 'repeated') {
          if (enabled === 'passed') {
            message.error('查验结果重复通过');
          } else if (enabled === true) {
            message.error('重复设置查验');
          } else if (enabled === false) {
            message.error('重复删除查验结果');
          }
        } else {
          message.error(result.error.message, 5);
        }
      } else {
        message.info('保存成功', 5);
        this.props.loadBasicInfo(
          this.props.tenantId,
          this.props.previewer.delegation.delg_no,
          this.props.tabKey
        );
        if (enabled === true || enabled === false) {
          this.props.loadPaneExp(this.props.previewer.delegation.delg_no, this.props.tenantId);
        }
        if (field === 'hgcy' && this.props.tabKey === 'customsDecl') {
          this.props.loadCustPanel({
            delgNo: this.props.previewer.delegation.delg_no,
            tenantId: this.props.tenantId,
          });
        }
        if ((field === 'pzcy' || field === 'djcy') && this.props.tabKey === 'ciqDecl') {
          this.props.loadDeclCiqPanel(this.props.previewer.delegation.delg_no, this.props.tenantId);
        }
      }
    });
  }
  handleSaveCert = ({ field, value }) => {
    const certQty = value || null;
    this.props.updateCertParam(
      this.props.previewer.delegation.delg_no,
      this.props.previewer.delgDispatch.id, field, certQty
    ).then((result) => {
      if (result.error) {
        if (result.error.message === 'repeated') {
          if (certQty === null) {
            message.error('该证已删除');
          }
        } else {
          message.error(result.error.message, 5);
        }
      } else {
        message.info('保存成功', 5);
        this.props.loadBasicInfo(
          this.props.tenantId,
          this.props.previewer.delegation.delg_no,
          this.props.tabKey
        );
      }
    });
  }
  handleBlNoExchange = ({ value }) => {
    this.props.exchangeBlNo(this.props.previewer.delegation.delg_no, value).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.props.loadBasicInfo(
          this.props.tenantId,
          this.props.previewer.delegation.delg_no,
          this.props.tabKey
        );
      }
    });
  }

  handleSave = () => {
    const { previewer } = this.props;
    const key = this.state.tabKey;
    const formVals = this.props.form.getFieldsValue();
    if (key === 'exchange') {
      this.handleBlNoExchange({ value: formVals.bl_wb_no });
    } else if (key === 'certs') {
      if (formVals.certs) {
        this.handleSaveCert({ field: formVals.certs, value: formVals.certsNum });
      }
    } else if (key === 'inspect') {
      this.handleInspectSave({
        preEntrySeqNo: formVals.pre_entry_no,
        delgNo: previewer.delegation.delg_no,
        field: formVals.inspect_field,
        enabled: true,
      });
    }
  }
  render() {
    return (
      <div className="pane-content tab-pane">
        <MainInfoCard />
      </div>
    );
  }
}
