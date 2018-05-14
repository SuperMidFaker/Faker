import React from 'react';
import PropTypes from 'prop-types';
import { Button, DatePicker, Form, Radio, Select, Steps } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import { formatMsg } from './message.i18n';
import './style.less';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;

@injectIntl
export default class ExportDataPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    title: PropTypes.string,
    onClose: PropTypes.func,
  }
  state = {

  }
  msg = formatMsg(this.props.intl)

  handleClose = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  render() {
    const {
      visible, title, dataObjects, dataFields,
    } = this.props;

    return (
      <DockPanel
        title={title || this.msg('export')}
        size="middle"
        visible={visible}
        onClose={this.handleClose}
        className="welo-export-data-panel"
      ><Form layout="vertical">
        <Steps direction="vertical" size="small">
          <Step
            title={this.msg('dataObjects')}
            status="wait"
            description={<Form.Item><Select
              allowClear
              showSearch
              onChange={this.handleAdaptorChange}
            >
              {dataObjects && dataObjects.map(opt =>
                <Option value={opt.code} key={opt.code}>{opt.name}</Option>)}
            </Select></Form.Item>}
          />
          <Step
            title={this.msg('exportOptions')}
            status="wait"
            description={
              <div>
                <Form.Item>
                  <Radio.Group onChange={this.handleSkipModeChange}>
                    <Radio value={1}>{this.msg('allData')}</Radio>
                    <Radio value={2}>{this.msg('specificPeriod')}</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item>
                  <RangePicker format="YYYY/MM/DD" />
                </Form.Item>
                <Form.Item label={this.msg('selectedFields')}>
                  <Select
                    allowClear
                    mode="multiple"
                    onChange={this.handleAdaptorChange}
                  >
                    {dataFields && dataFields.map(opt =>
                      <Option value={opt.code} key={opt.code}>{opt.name}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item label={this.msg('exportFormat')}>
                  <Radio.Group onChange={this.handleSkipModeChange}>
                    <Radio value={1}>CSV (Comma Separated Value)</Radio>
                    <Radio value={2}>XLSX (Microsoft Excel)</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
            }
          />
          <Step
            title=""
            status="wait"
            description={<Button type="primary">{this.msg('export')}</Button>}
          />
        </Steps>
      </Form>
      </DockPanel>
    );
  }
}
