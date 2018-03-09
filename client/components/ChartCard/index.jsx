import React from 'react';
import { Card, Spin } from 'antd';
import classNames from 'classnames';
import { Link } from 'react-router';
import './style.less';


const ChartCard = ({
  loading = false, grid = false, contentHeight, title, avatar, action, type, link, onClick,
  total, footer, children, ...rest
}) => {
  const content = (
    <div className="chartCard">
      <div
        className={classNames('chartTop', { chartTopMargin: (!children && !footer) })}
      >
        <div className="avatarWrap">
          {
            avatar
          }
        </div>
        <div className="metaWrap">
          <div className="meta">
            <span className="title">{title}</span>
            <span className="action">{action}</span>
          </div>
          {
            // eslint-disable-next-line
            (total !== undefined) && (<div className={`total ${type}`} dangerouslySetInnerHTML={{ __html: total }} />)
          }
        </div>
      </div>
      {
        children && (
          <div className="content" style={{ height: contentHeight || 'auto' }}>
            <div className={contentHeight && 'contentFixed'}>
              {children}
            </div>
          </div>
        )
      }
      {
        footer && (
          <div className={classNames('footer', { footerMargin: !children })}>
            {footer}
          </div>
        )
      }
    </div>
  );

  return grid ? (
    <Card.Grid {...rest} className="chartCardGrid">
      <Spin spinning={loading}><Link to={link} onClick={onClick}>{content}</Link></Spin>
    </Card.Grid>) : (
      <Card
        bodyStyle={{ padding: '20px 24px 8px 24px' }}
        {...rest}
      >
        <Spin spinning={loading}>{content}</Spin>
      </Card>);
};

export default ChartCard;
