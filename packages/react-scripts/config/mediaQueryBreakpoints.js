'use strict';

const breakpoints = {
  sm: 415,
  md: 768,
  lg: 1025,
  xl: 9999999999,
};

const breakpointsVariables = Object.keys(breakpoints)
  .map(
    bp =>
      `$${bp}-breakpoint: ${
        breakpoints[bp]
      }px; $pre-${bp}-breakpoint: ${breakpoints[bp] - 1}px;`
  )
  .join(' ');

module.exports = {
  breakpoints: breakpoints,
  breakpointsVariables: breakpointsVariables,
};
