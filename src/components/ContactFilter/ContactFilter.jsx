import React from 'react';
import PropTypes from 'prop-types';

export const ContactFilter = ({validator}) => {
  return (
    <label htmlFor="search">
      Find contact by name
      <input onChange={validator} id="search" type="search" />
    </label>
  );
};

ContactFilter.propTypes = {
  validator: PropTypes.string
}