import React, { PropTypes } from 'react';
import BaseListWrapper from './BaseListWrapper';
import { PARTNERSHIP_TYPE_INFO } from '../../../../../common/constants';

const config = {
  type: PARTNERSHIP_TYPE_INFO.customer
};

const CustomerList = BaseListWrapper(config);

export default CustomerList;
