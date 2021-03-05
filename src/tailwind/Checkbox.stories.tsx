import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Checkbox, CheckboxProps } from './Checkbox';

export default {
  title: 'Checkbox',
  component: Checkbox,
  argTypes: {

  }
} as Meta<CheckboxProps>;

const Template: Story<CheckboxProps> = (args) => <Checkbox {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Toggle me',

};

export const Secondary = Template.bind({});
Secondary.args = {
  children: 'Indeterminate',
  isIndeterminate: true
};


