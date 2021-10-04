import { Meta } from "@storybook/react";
import { Chart } from "react-google-charts";
import { GoogleDataTableColumn, GoogleDataTableRow } from "react-google-charts/dist/types";

export default {
  title: "Gantt V2",
} as Meta;

export function GoogleGanttChart() {
  function daysToMilliseconds(days: number) {
    return days * 24 * 60 * 60 * 1000;
  }
  // Shape of the data
  const columns: GoogleDataTableColumn[] = [
    { type: "string", label: "Task ID" },
    { type: "string", label: "Task Name" },
    { type: "date", label: "Start Date" },
    { type: "date", label: "End Date" },
    { type: "number", label: "Duration" },
    { type: "number", label: "Percent Complete" },
    { type: "string", label: "Dependencies" },
  ];

  const rows = [
    ["t1", "Task #1", new Date(2015, 0, 1), new Date(2015, 0, 5), null, 100, null],
    ["t2", "Task #2", null, new Date(2015, 0, 9), daysToMilliseconds(3), 25, "t1, t3"],
    ["t3", "Task #3", null, new Date(2015, 0, 7), daysToMilliseconds(3), 20, "t1"],
    ["t4", "Task #4", null, new Date(2015, 0, 10), daysToMilliseconds(2), 0, "t3"],
    ["t5", "Task #5", null, new Date(2015, 0, 6), daysToMilliseconds(1), 100, "t1"],
  ];

  return (
    <Chart
      chartType="Gantt"
      columns={columns}
      rows={rows as GoogleDataTableRow[]}
      width="100vw"
      height="100vh"
      options={{
        gantt: {
          criticalPathEnabled: true,
          criticalPathStyle: {
            stroke: "#e64a19",
            strokeWidth: 2,
          },
          sortTasks: false,
        },
      }}
      legendToggle
    />
  );
}
