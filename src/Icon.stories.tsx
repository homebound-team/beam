import React from 'react';
import { Meta } from '@storybook/react';
import { Icon as IconComponent, IconProps, Icons } from './';

export default {
  title: 'Icon',
  component: IconComponent,
  args: {
    icon: 'account',
  },
  argTypes: {
    color: { control: { type: 'color' } },
    secondaryColor: { control: { type: 'color' } },
    testId: { control: { type: 'text' } },
    icon: { control: { type: 'select', options: Object.keys(Icons) } },
    tabIndex: { control: { type: 'number' } },
    xss: { control: { type: 'object' } },
  },
} as Meta<IconProps>;

export const Icon = (args: IconProps) => <IconComponent {...args} />;
