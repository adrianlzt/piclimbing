import React from 'react';
import Chrome from './src/components/chrome/chrome';

// TODO needde to make the build, but should be commented to use the develop mode
export const wrapRootElement = ({ element }) => {
  return <Chrome>{element}</Chrome>;
};
