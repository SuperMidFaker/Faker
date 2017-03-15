/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Table, Card, Col, Icon, Row, Select, Input, Tooltip, Popconfirm } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;

class EditableCell extends React.Component {
  static propTypes = { editable: PropTypes.bool }
  state = {
    value: this.props.value,
    editable: this.props.editable || false,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.editable !== this.state.editable) {
      this.setState({ editable: nextProps.editable });
      if (nextProps.editable) {
        this.cacheValue = this.state.value;
      }
    }
    if (nextProps.status && nextProps.status !== this.props.status) {
      if (nextProps.status === 'save') {
        this.props.onChange(this.state.value);
      } else if (nextProps.status === 'cancel') {
        this.setState({ value: this.cacheValue });
        this.props.onChange(this.cacheValue);
      }
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.editable !== this.state.editable ||
           nextState.value !== this.state.value;
  }
  handleChange(e) {
    const value = e.target.value;
    this.setState({ value });
  }
  render() {
    const { value, editable } = this.state;
    return (
      <div>
        {
          editable ?
            <div>
              <Select
                value={value}
                onChange={e => this.handleChange(e)}
              >
                <Option key="cmsDelegation">cmsDelegation</Option>
              </Select>
            </div>
            :
            <div className="editable-row-text">
              {value.toString() || ' '}
            </div>
        }
      </div>
    );
  }
}

class ConditionTable extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [{
      // title: this.msg('bizObject'),
      dataIndex: 'name',
      width: '50%',
      render: (text, record, index) => this.renderColumns(this.state.data, index, 'name', text),
    }, {
      // title: this.msg('bizEvent'),
      dataIndex: 'event',
      render: (text, record, index) => this.renderColumns(this.state.data, index, 'event', text),
    }, {
      title: '',
      dataIndex: 'operation',
      width: 80,
      render: (text, record, index) => {
        const { editable } = this.state.data[index].name;
        return (
          <div className="editable-row-operations">
            {
              editable ?
                <span>
                  <a onClick={() => this.editDone(index, 'save')}><Icon type="save" /></a>
                  <span className="ant-divider" />
                  <Popconfirm title="Sure to cancel?" onConfirm={() => this.editDone(index, 'cancel')}>
                    <a><Icon type="close" /></a>
                  </Popconfirm>
                </span>
                :
                <span>
                  <a onClick={() => this.edit(index)}><Icon type="edit" /></a>
                  <span className="ant-divider" />
                  <a onClick={() => this.delete(index)}><Icon type="delete" /></a>
                </span>
            }
          </div>
        );
      },
    }];
    this.state = {
      data: [{
        key: '0',
        name: {
          editable: false,
          value: '清关委托',
        },
        event: {
          editable: false,
          value: '已放行',
        },
      }],
      count: 1,
    };
  }
  handleAdd = () => {
    const { count, data } = this.state;
    const newData = {
      key: count,
      name: {
        editable: false,
        value: '报关单',
      },
      event: {
        editable: false,
        value: '已回填',
      },
    };
    this.setState({
      data: [...data, newData],
      count: count + 1,
    });
  }
  handleChange(key, index, value) {
    const { data } = this.state;
    data[index][key].value = value;
    this.setState({ data });
  }
  edit(index) {
    const { data } = this.state;
    Object.keys(data[index]).forEach((item) => {
      if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
        data[index][item].editable = true;
      }
    });
    this.setState({ data });
  }
  editDone(index, type) {
    const { data } = this.state;
    Object.keys(data[index]).forEach((item) => {
      if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
        data[index][item].editable = false;
        data[index][item].status = type;
      }
    });
    this.setState({ data }, () => {
      Object.keys(data[index]).forEach((item) => {
        if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
          delete data[index][item].status;
        }
      });
    });
  }
  delete(index) {
    const { data } = this.state;
    Object.keys(data[index]).forEach((item) => {
      if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
        data[index][item].editable = true;
      }
    });
    this.setState({ data });
  }
  renderColumns(data, index, key, text) {
    const { editable, status } = data[index][key];
    if (typeof editable === 'undefined') {
      return text;
    }
    return (<EditableCell
      editable={editable}
      value={text}
      onChange={value => this.handleChange(key, index, value)}
      status={status}
    />);
  }
  render() {
    const { data } = this.state;
    const dataSource = data.map((item) => {
      const obj = {};
      Object.keys(item).forEach((key) => {
        obj[key] = key === 'key' ? item[key] : item[key].value;
      });
      return obj;
    });
    const columns = this.columns;
    return (
      <Table dataSource={dataSource} columns={columns} pagination={false} size="middle"
        footer={() => <Button type="dashed" onClick={this.handleAdd} icon="plus" style={{ width: '100%' }} />}
      />);
  }
}

@injectIntl
@connect(
  state => ({
    edge: state.scofFlow.activeEdge,
    nodesMap: state.scofFlow.nodesMap,
  })
)
export default class FlowEdgePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    datas: [],
  };
  msg = formatMsg(this.props.intl)
  render() {
    const { source, target } = this.props;
    return (
      <Card title={this.msg('flowEdge')} bodyStyle={{ padding: 16 }}>
        <Row gutter={16}>
          <Col sm={12}>
            <FormItem label={this.msg('sourceNode')}>
              <Input defaultValue={source.get('model').name} />
            </FormItem>
          </Col>
          <Col sm={12}>
            <FormItem label={this.msg('targetNode')}>
              <Input defaultValue={target.get('model').name} />
            </FormItem>
          </Col>
          <Col sm={24}>
            <FormItem label={<span>
              {this.msg('edgeCondition')}&nbsp;
              <Tooltip title={this.msg('tooltipEdgeCondition')}>
                <Icon type="question-circle-o" />
              </Tooltip></span>}
            >
              <ConditionTable />
            </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
