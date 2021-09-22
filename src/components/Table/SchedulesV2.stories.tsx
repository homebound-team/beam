import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { arrayMoveImmutable } from "array-move";
import { DragEventHandler, useLayoutEffect, useRef, useState } from "react";
import { DragDropContext, DragDropContextProps, Draggable, Droppable } from "react-beautiful-dnd";
import { CollapseToggle, GridStyle, GridTable } from "src/components/Table";
import { Css, Palette } from "src/Css";
import { Checkbox } from "src/inputs";
import { zeroTo } from "src/utils/sb";
import { Icon } from "../Icon";
import { actionColumn, column, dateColumn } from "./columns";
import { GridDataRow } from "./GridTable";

export default {
  title: "Pages / SchedulesV2",
  parameters: { backgrounds: { default: "white" } },
} as Meta;

// TODO: Is it possible drag above a group and let it go in.
// TODO: Moving milestones and subgroups around too

/** Types */
type HeaderRow = { kind: "header" };
type MilestoneRow = {
  kind: "milestone";
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
};
type SubGroupRow = {
  kind: "subgroup";
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
};
type TaskRow = {
  kind: "task";
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  milestone: string;
  subGroup: string;
  status: string;
};
type AddRow = { kind: "add" };
type Row = HeaderRow | MilestoneRow | SubGroupRow | TaskRow | AddRow;

/** Rows */
// TODO: Handle all 4 situations
const rows: GridDataRow<Row>[] = [{ kind: "header", id: "header" }, ...createMilestones(1, 1, 5)];

/** Columns */
// FIXME: This column is not vertically aligned
const arrowColumn = actionColumn<Row>({
  header: (row) => <CollapseToggle row={row} />,
  milestone: (row) => <CollapseToggle row={row} />,
  subgroup: (row) => <CollapseToggle row={row} />,
  task: "",
  add: "",
  w: "32px",
});
const selectColumn = actionColumn<Row>({
  header: (row) => <Checkbox label="" onChange={action("Select All")} />,
  milestone: "",
  subgroup: "",
  task: (task) => <Checkbox label="" onChange={action(`Select ${task.name}`)} />,
  add: "",
  w: "20px",
});
// TODO: Skipping selectable row
const idColumn = column<Row>({
  header: "",
  milestone: "",
  subgroup: "",
  task: (row) => row.id,
  add: "",
  w: "20px",
  align: "center",
});
const nameColumn = column<Row>({
  header: "Task",
  milestone: (row) => <div css={Css.baseEm.gray900.df.aic.$}>{row.name}</div>,
  subgroup: (row) => <div css={Css.smEm.gray900.df.aic.$}>{row.name}</div>,
  task: (row) => row.name,
  add: "Add",
});
const startColumn = dateColumn<Row>({
  header: "Start",
  milestone: (row) => <div css={Css.smEm.gray900.$}>{row.startDate}</div>,
  subgroup: (row) => <div css={Css.smEm.gray900.$}>{row.startDate}</div>,
  task: (row) => row.startDate,
  add: "",
});
const endColumn = dateColumn<Row>({
  header: "End",
  milestone: (row) => <div css={Css.smEm.gray900.$}>{row.endDate}</div>,
  subgroup: (row) => <div css={Css.smEm.gray900.$}>{row.endDate}</div>,
  task: (row) => row.endDate,
  add: "",
});
const durationColumn = column<Row>({
  header: "Duration",
  milestone: (row) => <div css={Css.smEm.gray900.$}>{row.duration} days</div>,
  subgroup: (row) => <div css={Css.smEm.gray900.$}>{row.duration} days</div>,
  task: (row) => `${row.duration} days`,
  add: "",
});
const milestoneColumn = column<Row>({
  header: "Milestone",
  // TODO: Would be great if we can omit these
  milestone: "",
  subgroup: "",
  task: (row) => row.milestone,
  add: "",
});
const subCategoryColumn = column<Row>({
  header: "SubCategory",
  // TODO: Would be great if we can omit these
  milestone: "",
  subgroup: "",
  task: (row) => row.subGroup,
  add: "",
});
const statusColumn = column<Row>({
  header: "Status",
  milestone: "",
  subgroup: "",
  task: (row) => row.status,
  add: "",
});
const progressColumn = actionColumn<Row>({
  header: "",
  milestone: "",
  subgroup: "",
  task: "",
  add: "",
  w: "150px",
});

// TODO: Potentially add 8px spacer between each row
const spacing = { brPx: 8, pxPx: 16, spacerPx: 8 };
const style: GridStyle = {
  headerCellCss: Css.xsEm.gray700.py1.df.aic.$,
  firstNonHeaderRowCss: Css.mt2.$,
  cellCss: Css.h100.gray700.xs.aic.$,
  nestedCards: {
    topLevelSpacerPx: 8,
    kinds: {
      header: { bgColor: Palette.Gray100, brPx: 0, spacerPx: 0, pxPx: 0 },
      // TODO: It would be nice if this used CSS Properties so that we can use TRUSS
      milestone: { bgColor: Palette.Gray100, ...spacing },
      subgroup: { bgColor: Palette.White, ...spacing },
      // TODO: Validate with Dare regarding nested 3rd child.
      task: { bgColor: Palette.White, bColor: Palette.Gray200, ...spacing, pxPx: 0 },
      // Purposefully leave out the `add` kind
    },
  },
};

export function SchedulesV2() {
  return (
    <div css={Css.h("100vh").$}>
      <GridTable<Row>
        rows={rows}
        columns={[
          arrowColumn,
          selectColumn,
          idColumn,
          nameColumn,
          startColumn,
          endColumn,
          durationColumn,
          milestoneColumn,
          subCategoryColumn,
          statusColumn,
          progressColumn,
        ]}
        style={style}
        rowStyles={{
          task: {
            cellCss: Css.py1.$,
          },
        }}
        // FIXME: `firstNonHeaderRowCss` does not work when virtual is enabled
        // Possible fix is to use an ref/class/id for this row
        // as="virtual"
        stickyHeader
      />
    </div>
  );
}
SchedulesV2.storyName = "SchedulesV2";

/**
 * Example table using the same approach as GridTable to test out drag libraries
 *
 * Approach #1: HTML Draggable Attribute on Row
 * The basic HTML `draggable`, `onDrag`, `onDragOver` was a great idea from @bdow
 * to try to get a basic native drag and drop working. The nice thing about this
 * is that when dragging an element it looked like you were dragging the row! The
 * reason this did not work is that `display: contents` does not support this type
 * of behaviour. See https://github.com/atlassian/react-beautiful-dnd/issues/2025#issuecomment-792291635
 *
 * Learnings:
 * - We do know that JS events like onMouseOver and onClick do still work. This means
 * that a fully JS solution might be the only key.
 */
export function Draggable1() {
  const columns = ["Task", "Start", "End", "Duration", "Milestone"];
  const rows = zeroTo(5).map((i) => columns.map((c) => `${c}#${i}`));

  return (
    // Grid Container
    <div css={Css.dg.gtc(`repeat(${columns.length}, 1fr)`).$}>
      {/* Grid Items - Headers */}
      {columns.map((column) => (
        <div key={column.toString()} css={Css.bgGray100.bb.mb1.$}>
          {column}
        </div>
      ))}
      {/* Grid Items - Rows */}
      {rows.map((row) => (
        <div
          key={row.toString()}
          style={{
            cursor: "grab",
            paddingTop: "10px",
            // This allows us to wrap all of the children for a single row
            display: "contents",
          }}
          draggable
        >
          {row.map((cell) => (
            <div key={cell.toString()}>{cell}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
Draggable1.storyName = "Draggability - HTML Draggable Attribute on Row";

/**
 * Example table using the same approach as GridTable to test out drag libraries
 *
 * Approach #2: HTML Draggable Attribute on First Cell
 * This approach does work, we do lose the niceness of the row drag image since we
 * are only dragging the cell itself vs the rows.
 *
 * Learnings:
 * - `display: contents` rows can still be used for hover detection.
 * - Div's withing `display: contents` are fully draggable.
 * - Changing the dragImage is very usable.
 *
 * TODO:
 * - Remove row highlight styles on end
 */
export function Draggable2() {
  const columns = ["", "Task", "Start", "End", "Duration", "Milestone"];
  const [rows, setRows] = useState(() => zeroTo(5).map((i) => columns.map((c) => `${c}#${i}`)));

  const addDragHoverStyles: DragEventHandler<HTMLDivElement> = (e) =>
    e.currentTarget.childNodes.forEach((cn) => {
      // Set border bottom
      cn.style.borderBottom = "1px solid red";
    });
  const removeDragHoverStyles: DragEventHandler<HTMLDivElement> = (e) =>
    e.currentTarget!.childNodes.forEach((cn) => {
      // Remove border bottom
      cn.style.borderBottom = null;
    });

  return (
    // Grid Container
    <div css={Css.dg.gtc(`50px repeat(${columns.length - 1}, 1fr)`).$}>
      {/* Grid Items - Headers */}
      {columns.map((column) => (
        <div key={column.toString()} css={Css.bgGray100.bb.mb1.$}>
          {column}
        </div>
      ))}
      {/* Grid Items - Rows */}
      {rows.map((row, rowIndex) => (
        <div
          key={row.toString()}
          style={{
            paddingTop: "10px",
            // This allows us to wrap all of the children for a single row
            display: "contents",
          }}
          onDragEnter={addDragHoverStyles}
          onDragLeave={removeDragHoverStyles}
          // This allows us to drop on a row
          onDragOver={(e) => e.preventDefault()}
          // Handle when an element is dropped over it
          onDrop={(e) => {
            // Find the dropped row index
            const fromRowIndex = parseInt(e.dataTransfer.getData("text"));
            // Find where the dropped row wants to be
            const toRowIndex = rowIndex;

            // Reorder rows
            setRows((prev) => arrayMoveImmutable(prev, fromRowIndex, toRowIndex));
          }}
        >
          {/* Grid Item - Cell */}
          {row.map((cell, cellIndex) => (
            // Only making the first column draggable
            <div
              key={cell.toString()}
              // Setting borders so drag row highlights won't vertically shift
              css={Css.bt.bb.bc("transparent").$}
              // Setting the first cell to be draggable
              draggable={cellIndex % columns.length === 0}
              // Setting the first cell to use a drag cursor
              style={{ cursor: cellIndex % columns.length === 0 ? "grab" : "auto" }}
              onDragStart={async (e) => {
                // This removed the + icon which appears when dragging
                e.dataTransfer.dropEffect = "none";
                e.dataTransfer.effectAllowed = "move";

                // Save the rowIndex
                e.dataTransfer.setData("text", String(rowIndex));

                // Setting the drag image as the task column
                e.dataTransfer.setDragImage(e.currentTarget.nextSibling!, 0, 0);

                /* TODO: Attempting to use html2Canvas to get an image of the row
                  did not result an a render-able image (because of `display: contents`)
                  since we can render an image of the body or table.

                  On way around this could be to take an image of the table and
                  crop the image to the row only to get around the `display: contents`.

                  Below does not work.
                */
                // const parentRow = e.currentTarget.parentElement!;
                // const canvas = await html2canvas(parentRow);
                // const img = new Image();
                // img.src = canvas.toDataURL();
                // document.body.append(img);
                // e.dataTransfer.setDragImage(img, 0, 0);

                // Here's an example of using the table as the drag image
                // e.dataTransfer.setDragImage(document.getElementById("table")!, 0, 0);
              }}
            >
              {cellIndex % columns.length === 0 ? <Icon icon="drag" /> : cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
Draggable2.storyName = "Draggability - HTML Draggable Attribute on First Cell";

/**
 * Example table using the same approach as GridTable to test out drag libraries
 *
 * Approach #3: React DND
 * react-beautiful-dnd does not seem to work nicely with `display: contents` as
 * the following issue https://github.com/atlassian/react-beautiful-dnd/issues/2025
 * describes.
 *
 * Learnings:
 * - If we can circumvent the `display: contents` approach that would be great
 */
export function Draggable3() {
  const columns = ["", "Task", "Start", "End", "Duration", "Milestone"];
  const [rows, setRows] = useState(() => zeroTo(5).map((i) => columns.map((c) => `${c}#${i}`)));

  const onDragEnd: DragDropContextProps["onDragEnd"] = (result, provided) => {
    // TODO: reorder our columns
    console.log("onDragEnd");
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Grid Container */}
      <div css={Css.dg.gtc(`50px repeat(${columns.length - 1}, 1fr)`).$}>
        {/* Grid Items - Header */}
        {columns.map((column) => (
          <div key={column.toString()} css={Css.bgGray100.bb.mb1.$}>
            {column}
          </div>
        ))}
        <Droppable key="droppable" droppableId="droppable">
          {(provided) => (
            // Grid Items - Rows Container
            <div ref={provided.innerRef} {...provided.droppableProps} css={{ display: "contents" }}>
              {/* Grid Items - Row */}
              {rows.map((row, rowIndex) => (
                <Draggable key={row.toString()} draggableId={row[1]} index={rowIndex}>
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      style={{
                        paddingTop: "10px",
                        // This allows us to wrap all of the children for a single row
                        display: "contents",
                      }}
                      ref={provided.innerRef}
                    >
                      {row.map((cell, cellIndex) => (
                        <div key={cell.toString()}>
                          {cellIndex % columns.length === 0 ? (
                            <div {...provided.dragHandleProps}>
                              <Icon icon="drag" />
                            </div>
                          ) : (
                            cell
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
Draggable3.storyName = "Draggability - React DND";

/**
 * Example table using the same approach as GridTable to test out drag libraries
 *
 * Approach #4: React DND - Hack
 * Since `display: contents` is causing so many issues, this approach tries to
 * recreate the row itself but without the need to use `display: contents`
 *
 * Learnings:
 * -
 */
export function Draggable4() {
  const columns = ["", "Task", "Start", "End", "Duration", "Milestone"];
  const [rows, setRows] = useState(() => zeroTo(5).map((i) => columns.map((c) => `${c}#${i}`)));
  const headerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [columnWidths, setColumnWidths] = useState([]);

  useLayoutEffect(() => {
    const newColumnWidths = headerRefs.current.map((hr) => hr?.clientWidth);
    setColumnWidths(newColumnWidths);
  }, [headerRefs.current]);

  const onDragEnd: DragDropContextProps["onDragEnd"] = (result, provided) => {
    // TODO: reorder our columns
    console.log("onDragEnd");
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Table - Headers */}
      <div css={Css.dg.gtc(`50px repeat(${columns.length - 1}, 1fr)`).$}>
        {columns.map((column, columnIndex) => (
          <div
            key={column.toString()}
            ref={(el) => (headerRefs.current[columnIndex] = el)}
            css={Css.bgGray100.bb.mb1.$}
          >
            {column}
          </div>
        ))}
      </div>
      {/* Table - Body */}
      <Droppable key="droppable" droppableId="droppable">
        {(provided) => (
          // Table - Body - Container
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {/* Fake Chrome Row */}
            <div css={Css.bgGray200.hPx(20).$} />
            {/* Table - Body - Container - Row */}
            {rows.map((row, rowIndex) => (
              <Draggable key={row.toString()} draggableId={row[1]} index={rowIndex}>
                {(provided) => (
                  <div {...provided.draggableProps} ref={provided.innerRef} css={Css.df.$}>
                    {row.map((cell, cellIndex) => (
                      // Table - Body - Container - Row
                      <div key={cell.toString()} style={{ width: columnWidths[cellIndex] }}>
                        {cellIndex % columns.length === 0 ? (
                          <div {...provided.dragHandleProps}>
                            <Icon icon="drag" />
                          </div>
                        ) : (
                          cell
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
Draggable4.storyName = "Draggability - React DND Hack";

/**** Utils *****/
function createTasks(howMany: number, subGroup: string, milestone: string, COUNTER: number): TaskRow[] {
  return zeroTo(howMany).map((id) => ({
    kind: "task",
    id: String(COUNTER++),
    name: `Task #${id}`,
    startDate: "May. 1, 2021",
    endDate: "May. 10, 2021",
    duration: 10,
    milestone,
    subGroup,
    status: "Active",
  }));
}

function createSubGroups(howMany: number, howManyTasks: number, milestone: string, COUNTER: number) {
  return zeroTo(howMany).map<SubGroupRow>((id) => {
    const name = `SubGroup #${id}`;

    return {
      kind: "subgroup",
      id: String(COUNTER++),
      name,
      startDate: "May. 1, 2021",
      endDate: "May. 10, 2021",
      duration: 10,
      children: createTasks(howManyTasks, name, milestone, COUNTER++),
    } as SubGroupRow;
  });
}

function createMilestones(howMany: number, howManySubGroups: number, howManyTasks: number) {
  let COUNTER = 0;

  return zeroTo(howMany).map<MilestoneRow>((id) => {
    const name = `Milestone #${id}`;
    return {
      kind: "milestone",
      id: String(COUNTER++),
      name,
      startDate: "May 1, 2021",
      endDate: "May 10, 2021",
      duration: 10,
      children: createSubGroups(howManySubGroups, howManyTasks, name, COUNTER++),
    } as MilestoneRow;
  });
}
