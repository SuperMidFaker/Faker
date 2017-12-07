import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import './index.less';
import toolbar from './toolbar';
import extra from './extra';


export default class DataPane extends React.Component {
  static defaultProps = {
    baseCls: 'welo-form-pane',
    scrollOffset: 470,
    layout: 'horizontal',
    hideRequiredMark: false,
  }
  static propTypes = {
    children: PropTypes.any,
    header: PropTypes.string,
    fullscreen: PropTypes.bool,
    scrollOffset: PropTypes.number,
  }
  state = { scrollY: 0 }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - this.props.scrollOffset,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.fullscreen !== this.props.fullscreen) {
      if (nextProps.fullscreen) {
        this.setState({
          scrollY: window.innerHeight - this.props.scrollOffset,
        });
      } else {
        this.setState({
          scrollY: window.innerHeight - 200,
        });
      }
    }
  }
  render() {
    const { baseCls, children, header, layout, hideRequiredMark } = this.props;
    return (
      <div className={baseCls}>
        {header ? <div className={`${baseCls}-header`}>{header}</div> : null}
        <Form layout={layout} hideRequiredMark={hideRequiredMark} className={`${baseCls}-form`}>
          {children}
        </Form>
      </div>
    );
  }
}

DataPane.Toolbar = toolbar;
DataPane.Extra = extra;
