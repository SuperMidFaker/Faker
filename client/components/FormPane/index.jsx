import React from 'react';
import PropTypes from 'prop-types';
import { Form, Spin } from 'antd';
import './index.less';
import toolbar from './toolbar';
import extra from './extra';


export default class FormPane extends React.Component {
  static defaultProps = {
    baseCls: 'welo-form-pane',
    layout: 'horizontal',
    hideRequiredMark: false,
  }
  static propTypes = {
    baseCls: PropTypes.string,
    children: PropTypes.node,
    header: PropTypes.node,
    layout: PropTypes.string,
    hideRequiredMark: PropTypes.bool,
  }
  state = { submitting: false }
  render() {
    const {
      baseCls, children, header, layout, hideRequiredMark,
    } = this.props;
    return (
      <div className={baseCls}>
        <Spin spinning={this.state.submitting}>
          {header ? <div className={`${baseCls}-header`}>{header}</div> : null}
          <Form layout={layout} hideRequiredMark={hideRequiredMark} className={`${baseCls}-form`}>
            {children}
          </Form>
        </Spin>
      </div>
    );
  }
}

FormPane.Toolbar = toolbar;
FormPane.Extra = extra;
