import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal, Checkbox } from 'antd';
import { toggleExportModal } from 'common/reducers/cmsTradeitem';
import { createFilename } from 'client/util/dataTransform';


@connect(
  state => ({
    visible: state.cmsTradeitem.exportModal.visible,
  }),
  { toggleExportModal }
)

export default class ExportModal extends React.Component {
  static propTypes = {
    repoId: PropTypes.number.isRequired,
  }
  state = {
    fork: false,
    history: false,
  }
  handleCancel = () => {
    this.props.toggleExportModal(false);
    this.setState({
      fork: false,
      history: false,
    });
  }
  handleOk = () => {
    const { repoId } = this.props;
    const { fork, history } = this.state;
    window.open(`${API_ROOTS.default}v1/cms/tranditem/export/${createFilename('tradeItem')}.xlsx?repoId=${repoId}&fork=${fork}&history=${history}`);
    this.handleCancel();
  }
  handleForkChange = (e) => {
    this.setState({
      fork: e.target.checked,
    });
  }
  handleHistoryChange = (e) => {
    this.setState({
      history: e.target.checked,
    });
  }
  render() {
    const { visible } = this.props;
    return (
      <Modal title="导出" visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
        <Checkbox checked={this.state.fork} onChange={this.handleForkChange}>分支版本</Checkbox>
        <Checkbox checked={this.state.history} onChange={this.handleHistoryChange}>历史版本</Checkbox>
      </Modal>
    );
  }
}
