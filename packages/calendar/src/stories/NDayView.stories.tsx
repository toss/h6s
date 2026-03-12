import type { Meta, StoryObj } from "@storybook/react";

import React from "react";
import { NDayView } from "./NDayView";

const meta = {
  title: "Calendar/N-Day View",
  component: NDayView,
  argTypes: {
    numberOfDays: {
      control: { type: "select" },
      options: [3, 5, 7, 14],
      description: "Number of consecutive days to display",
    },
  },
} satisfies Meta<typeof NDayView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    numberOfDays: 3,
  },
};

export const FiveDays: Story = {
  args: {
    numberOfDays: 5,
  },
};

export const WeekView: Story = {
  args: {
    numberOfDays: 7,
  },
};

export const TwoWeeks: Story = {
  args: {
    numberOfDays: 14,
  },
};
