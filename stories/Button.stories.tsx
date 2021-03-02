import React from 'react';
import { Meta } from '@storybook/react';
import { Button as ButtonComponent, ButtonProps } from '../';

export default {
  title: 'Button',
  component: ButtonComponent,
  args: {
    icon: 'close',
    label: 'Submit',
  },
} as Meta<ButtonProps>;

export const Button = (args: ButtonProps) => <ButtonComponent {...args} />;
