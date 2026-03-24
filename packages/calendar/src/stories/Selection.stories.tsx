import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { MultipleSelectionCalendar, RangeSelectionCalendar, SingleSelectionCalendar } from "./SelectionCalendar";

const meta: Meta = {
  title: "Calendar/useSelection",
};

export default meta;

export const Single: StoryObj = {
  render: () => <SingleSelectionCalendar />,
};

export const Range: StoryObj = {
  render: () => <RangeSelectionCalendar />,
};

export const Multiple: StoryObj = {
  render: () => <MultipleSelectionCalendar />,
};
