import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Checkbox, Modal } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { createFilename } from 'client/util/dataTransform';

const formatMsg = format(messages);
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { })
export default class ExportPDF extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    publickKey: PropTypes.string.isRequired,
  }
  state = {
    visible: false,
    checkedValues: ['detail'],
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible || this.state.visible,
    });
  }
  onChange = (checkedValues) => {
    this.setState({ checkedValues });
  }
  handleOk = () => {
    const { shipmtNo, publickKey } = this.props;
    const domain = window.location.host;
    window.open(`${API_ROOTS.default}v1/transport/tracking/exportShipmentPDF/${createFilename('shipment')}.pdf?shipmtNo=${shipmtNo}&publickKey=${publickKey}&domain=${domain}`);
    this.handleClose();
  }
  handleClose = () => {
    this.setState({
      visible: false,
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  render() {
    const { shipmtNo } = this.props;
    const options = [
      { label: '运单', value: 'detail', disabled: true },
    ];
    return (
      <span>
        <Modal maskClosable={false} title={`${this.msg('exportPDF')} ${shipmtNo}`}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleClose}
        >
          <Form layout="horizontal">
            <FormItem
              label="类型"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
              <CheckboxGroup options={options} defaultValue={this.state.checkedValues} onChange={this.onChange} />
            </FormItem>
          </Form>
        </Modal>
      </span>
    );
  }
}
