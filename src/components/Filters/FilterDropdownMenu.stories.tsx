import { Meta } from "@storybook/react-vite";
import { useCallback, useMemo, useState } from "react";
import { FilterDropdownMenu } from "src/components/Filters/FilterDropdownMenu";
import { multiFilter } from "src/components/Filters/MultiFilter";
import { Css } from "src/Css";
import { withRouter } from "src/utils/sb";

export default {
  component: FilterDropdownMenu,
  decorators: [withRouter()],
} as Meta;

type AssigneeFilter = { assignee?: string[] };
type AssigneeOption = { label: string; value: string };

/** Preselected assignee with lazy options — chip label comes from `current`, full list loads on demand. */
export function LazySelectedAssigneeChip() {
  const [loaded, setLoaded] = useState<AssigneeOption[]>();

  const loadAssignees = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoaded(createAssigneeOptions());
  }, []);

  const filterDefs = useMemo(
    () => ({
      assignee: multiFilter({
        options: {
          current: currentForValues(["u:2"], createAssigneeOptions()),
          // Production load() runs on first MultiSelect open; button here loads the full list for demo.
          load: loadAssignees,
          options: loaded,
        },
        getOptionLabel: (a) => a.label,
        getOptionValue: (a) => a.value,
        label: "Assignee",
      }),
    }),
    [loaded, loadAssignees],
  );

  return (
    <div css={Css.df.fdc.gap2.$}>
      <FilterDropdownMenu<AssigneeFilter> filterDefs={filterDefs} filter={{ assignee: ["u:2"] }} onChange={() => {}} />
      <div>
        Chip shows &quot;Jane Smith&quot; immediately via <code>current</code>. Open the assignee field (or wait) to
        load the full option list.
      </div>
    </div>
  );
}

function createAssigneeOptions() {
  return [
    { label: "John Doe", value: "u:1" },
    { label: "Jane Smith", value: "u:2" },
    { label: "Bob Johnson", value: "u:3" },
  ];
}

function currentForValues(values: string[], options: AssigneeOption[]) {
  return values.flatMap((value) => {
    const option = options.find((o) => o.value === value);
    return option ? [option] : [];
  });
}
