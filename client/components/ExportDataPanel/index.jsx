import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import { string2Bytes, createFilename } from 'client/util/dataTransform';
import { Button, DatePicker, Form, Radio, Select, Steps, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import { LINE_FILE_ADAPTOR_MODELS } from 'common/constants';
import { handleExport, toggleExportPanel } from 'common/reducers/saasExport';
import { formatMsg } from './message.i18n';
import './style.less';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;

@injectIntl
@connect(
  state => ({
    visible: state.saasExport.visible,
  }),
  {
    handleExport,
    toggleExportPanel,
  }
)
export default class ExportDataPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    title: PropTypes.string,
    type: PropTypes.string.isRequired,
    formData: PropTypes.PropTypes.shape({
      whseCode: PropTypes.string,
    }),
  }
  state = {
    format: 'xlsx',
    exportType: 1,
    disabled: true,
    startDate: null,
    endDate: null,
    selectedThead: [],
    selectedTbody: [],
    loading: false,
  }
  onDateChange = (data, dataString) => {
    this.setState({
      startDate: dataString[0],
      endDate: dataString[1],
    });
  }
  handleFormatChange = (e) => {
    this.setState({
      format: e.target.value,
    });
  }
  handleExportTypeChange = (e) => {
    const updateData = { exportType: e.target.value };
    if (e.target.value === 1) {
      updateData.disabled = true;
      updateData.startDate = null;
      updateData.endDate = null;
    } else {
      updateData.disabled = false;
    }
    this.setState(updateData);
  }
  handleClose = () => {
    this.props.toggleExportPanel(false);
  }
  msg = formatMsg(this.props.intl)
  handleHeaderSelect = (value) => {
    this.setState({
      selectedThead: value,
    });
  }
  handleTbodySelect = (value) => {
    this.setState({
      selectedTbody: value,
    });
  }
  handleExport = () => {
    this.setState({
      loading: true,
    });
    const { type, formData: { whseCode } } = this.props;
    const {
      selectedThead, selectedTbody, startDate, endDate, format,
    } = this.state;
    if (selectedThead.length === 0 && selectedTbody.length === 0) {
      message.warning(this.msg('pleaseSelectFields'));
      return;
    }
    this.props.handleExport({
      type, thead: selectedThead, tbody: selectedTbody, formData: { startDate, endDate, whseCode },
    }).then((result) => {
      if (!result.error) {
        const fields = selectedThead.concat(selectedTbody);
        const { columns } = LINE_FILE_ADAPTOR_MODELS[type];
        const labelMap = {};
        columns.forEach((column) => {
          if (column.exportField) {
            labelMap[column.exportField] = column.exportLabel;
          } else {
            labelMap[column.field] = column.label;
          }
        });
        if (format === 'xlsx') {
          const excelData = [];
          result.data.forEach((dv) => {
            const item = {};
            for (let i = 0; i < fields.length; i++) {
              const field = fields[i];
              item[labelMap[field]] = dv[i];
            }
            excelData.push(item);
          });
          const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
          const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
          wb.Sheets.Sheet1 = XLSX.utils.json_to_sheet(excelData);
          FileSaver.saveAs(
            new window.Blob([string2Bytes(XLSX.write(wb, wopts))], { type: 'application/octet-stream' }),
            `${createFilename(type)}.xlsx`
          );
        } else {
          let csvData = '';
          fields.forEach((field, index) => {
            if (index === fields.length - 1) {
              csvData += `${labelMap[field]}\r\n`;
            } else {
              csvData += `${labelMap[field]},`;
            }
          });
          result.data.forEach((data) => {
            csvData += `${Object.values(data).join(',')}\n`;
          });
          FileSaver.saveAs(
            new window.Blob([csvData], { type: 'text/plain;charset=utf-8' }),
            `${createFilename(type)}.csv`
          );
        }
      }
    });
    this.setState({
      loading: false,
    });
  }
  render() {
    const {
      visible, title, type,
    } = this.props;
    const {
      startDate, endDate, disabled, loading,
    } = this.state;
    const { columns } = LINE_FILE_ADAPTOR_MODELS[type];
    const thead = columns.filter(column => column.thead);
    const tbody = columns.filter(column => column.tbody);
    let rangerValue = [];
    if (startDate && endDate) {
      rangerValue = [moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')];
    }
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
            title={this.msg('exportOptions')}
            status="wait"
            description={
              <div>
                <Form.Item>
                  <Radio.Group onChange={this.handleExportTypeChange} value={this.state.exportType}>
                    <Radio value={1}>{this.msg('allData')}</Radio>
                    <Radio value={2}>{this.msg('specificPeriod')}</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item>
                  <RangePicker format="YYYY/MM/DD" value={rangerValue} onChange={this.onDateChange} disabled={disabled} />
                </Form.Item>
                <Form.Item label={this.msg('headerFields')}>
                  <Select
                    allowClear
                    mode="multiple"
                    onChange={this.handleHeaderSelect}
                  >
                    {thead.map(opt =>
                      (<Option
                        value={opt.exportField || opt.field}
                        key={opt.exportField || opt.field}
                      >
                        {opt.exportLabel || opt.label}
                      </Option>))}
                  </Select>
                </Form.Item>
                <Form.Item label={this.msg('bodyFields')}>
                  <Select
                    allowClear
                    mode="multiple"
                    onChange={this.handleTbodySelect}
                  >
                    {tbody.map(opt =>
                      (<Option
                        value={opt.exportField || opt.field}
                        key={opt.exportField || opt.field}
                      >
                        {opt.exportLabel || opt.label}
                      </Option>))}
                  </Select>
                </Form.Item>
                <Form.Item label={this.msg('exportFormat')}>
                  <Radio.Group onChange={this.handleFormatChange} value={this.state.format}>
                    <Radio value="csv">CSV (Comma Separated Value)</Radio>
                    <Radio value="xlsx">XLSX (Microsoft Excel)</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
            }
          />
          <Step
            title=""
            status="wait"
            description={<Button type="primary" onClick={this.handleExport} loading={loading}>{this.msg('export')}</Button>}
          />
        </Steps>
      </Form>
      </DockPanel>
    );
  }
}
