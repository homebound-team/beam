import { Meta } from "@storybook/react";
import { Fragment, useState } from "react";
import { Route, useHistory, useLocation, useParams } from "react-router";
import { Link } from "react-router-dom";
import { RouteTabWithContent, TabContent, Tabs, TabsWithContent, TabWithContent } from "src/components";
import { Button } from "src/components/Button";
import { Css } from "src/Css";
import { withBeamDecorator, withRouter } from "src/utils/sb";
import { Icon } from "./Icon";
import { getTabStyles } from "./Tabs";
import { TabValue, TestTabContent, testTabs } from "./testData";

export default {
  component: TabsWithContent,
  parameters: {
    // To better view the icon hover state
    backgrounds: { default: "white" },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36087%3A106217",
    },
  },
  decorators: [withRouter(), withBeamDecorator],
} as Meta;

export function TabBaseStates() {
  const styles = getTabStyles();
  return (
    <div css={Css.df.gap5.$}>
      <div css={Css.df.fdc.gap2.$}>
        <h2>
          Rendered as <pre css={Css.dib.$}>&lt;Button /&gt;</pre>
        </h2>
        <div css={{ ...styles.baseStyles, ...styles.activeStyles }}>{getChildren("active")}</div>
        <div css={{ ...styles.baseStyles, ...styles.focusRingStyles }}>{getChildren("focus ring")}</div>
        <div css={styles.baseStyles}>{getChildren("default")}</div>
        <div css={{ ...styles.baseStyles, ...styles.disabledStyles }}>{getChildren("disabled")}</div>
        <div css={{ ...styles.baseStyles, ...styles.hoverStyles }}>{getChildren("hovered")}</div>
        <div css={{ ...styles.baseStyles, ...styles.activeHoverStyles }}>{getChildren("active hover")}</div>
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h2>
          Rendered as <pre css={Css.dib.$}>&lt;a /&gt;</pre>
        </h2>
        <div css={{ ...styles.baseStyles, ...styles.activeStyles }}>{getChildren("active")}</div>
        <div css={{ ...styles.baseStyles, ...styles.focusRingStyles }}>{getChildren("focus ring")}</div>
        <div css={styles.baseStyles}>{getChildren("default")}</div>
        <div css={{ ...styles.baseStyles, ...styles.disabledStyles }}>{getChildren("disabled")}</div>
        <div css={{ ...styles.baseStyles, ...styles.hoverStyles }}>{getChildren("hovered")}</div>
        <div css={{ ...styles.baseStyles, ...styles.activeHoverStyles }}>{getChildren("active hover")}</div>
      </div>
    </div>
  );
}

export function TabsWithJustNames() {
  const [tab, setTab] = useState<TabValue>("tab1");
  return <TabsWithContent tabs={testTabs} onChange={setTab} selected={tab} ariaLabel="Sample Tabs" />;
}

export function TabsWithIconAndMargin() {
  const [tab, setTab] = useState<TabValue>("tab1");
  return <TabsWithContent tabs={tabsWithIconsAndContent} onChange={setTab} selected={tab} contentXss={Css.m3.p0.$} />;
}

export function TabsWithEndAdornment() {
  const redCircle = <div css={Css.br8.bgRed400.wPx(16).hPx(16).$} />;
  const greenCircle = <div css={Css.br8.bgGreen400.wPx(16).hPx(16).$} />;
  const tabsWithAdornment: TabWithContent<TabValue>[] = [
    { name: "Tab 1", value: "tab1", endAdornment: redCircle, render: () => <TestTabContent content="Tab 1 Content" /> },
    {
      name: "Tab 2",
      value: "tab2",
      endAdornment: greenCircle,
      render: () => <TestTabContent content="Tab 2 Content" />,
    },
  ];
  const [tab, setTab] = useState<TabValue>("tab1");
  return <TabsWithContent tabs={tabsWithAdornment} onChange={setTab} selected={tab} contentXss={Css.m3.p0.$} />;
}

export function TabsSeparateFromContent() {
  const [tab, setTab] = useState<TabValue>("tab1");
  return (
    <div>
      <Tabs tabs={testTabs} onChange={setTab} selected={tab} />
      <hr />
      <TabContent contentXss={Css.mt3.$} tabs={testTabs} selected={tab} />
    </div>
  );
}

export function TabsWithBottomBorder() {
  const [tab, setTab] = useState<TabValue>("tab1");
  return (
    <div>
      <Tabs tabs={tabsWithIconsAndContent} onChange={setTab} selected={tab} includeBottomBorder />
      <TabContent contentXss={Css.mt3.$} tabs={testTabs} selected={tab} />
    </div>
  );
}

export function TabsAsLinks() {
  return <TestComponent />;
}
// Use `/` as the root path in order to ensure the Tab's component provides a <Route /> wrapper for matching.
TabsAsLinks.decorators = [withRouter("/ce:2")];

function TestComponent() {
  const location = useLocation();
  const history = useHistory();
  const routeTabs: RouteTabWithContent[] = [
    {
      name: "Tab 1",
      href: "/ce:2/overview",
      path: ["/:ceId/overview", "/:ceId"],
      render: () => <RouteTab1 />,
    },
    {
      name: "Tab 2",
      href: "/ce:2/line-items",
      path: ["/:ceId/line-items", "/:ceId/line-items/*"],
      render: () => <RouteTab2 />,
    },
    {
      name: "Tab 3",
      href: "/ce:2/history",
      path: "/:ceId/history",
      render: () => <RouteTab3 />,
    },
    {
      name: "Disabled Tab",
      href: "/ce:2/disabled",
      path: "/:ceId/disabled",
      disabled: "Disabled reason",
      render: () => <TestTabContent content="Disabled Tab" />,
    },
  ];
  return (
    <div>
      <div css={Css.bb.bcGray200.py1.mb2.$}>
        <div>
          <strong>Current URL:</strong> <pre css={Css.dib.$}>{location?.pathname}</pre>
        </div>
        <Button label="Reset to root path" onClick={() => history.push("/ce:2")} /> (Will match Tab 1)
      </div>
      <TabsWithContent tabs={routeTabs} />
    </div>
  );
}

export const TabsHiddenIfOnlyOneActive = () => {
  const testTabs: TabWithContent<TabValue>[] = [
    { name: "Tab 1", value: "tab1", render: () => <TestTabContent content="Tab 1 Content" /> },
    { name: "Tab 2", value: "tab2", disabled: true, render: () => <TestTabContent content="Tab 2 Content" /> },
    { name: "Tab 3", value: "tab3", disabled: true, render: () => <TestTabContent content="Tab 3 Content" /> },
    { name: "Tab 4", value: "tab4", disabled: true, render: () => <TestTabContent content="Tab 4 Content" /> },
  ];
  return <TabsWithContent tabs={testTabs} onChange={() => {}} selected={"tab1"} ariaLabel="Sample Tabs" />;
};

export const TabWithRightContent = () => {
  const [selectedTab, setSelectedTab] = useState("tab1");
  const testTabs: TabWithContent<TabValue>[] = [
    {
      name: "Tab 1",
      value: "tab1",
      render: () => <div css={Css.bgGray100.bt.bcGray800.p2.$}>Tab 1 Content</div>,
    },
    {
      name: "Tab 2",
      value: "tab2",
      render: () => <div css={Css.bgGray100.bt.bcGray800.p2.$}>Tab 2 Content</div>,
    },
  ];
  const right = (
    <>
      <Button variant="secondary" label="Add New" onClick={() => {}} />
      <Button variant="secondary" label="Edit" onClick={() => {}} />
    </>
  );
  return (
    <>
      <Tabs
        includeBottomBorder
        tabs={testTabs}
        onChange={setSelectedTab}
        selected={selectedTab}
        ariaLabel="Sample Tabs"
        right={right}
      />
      {/* The tabs will be hidden, which causes the TabContent default top margin to be removed. But we are adding in actions, so add the margin back in ourselves. */}
      <TabContent contentXss={Css.mt3.$} tabs={testTabs} selected={selectedTab} />
    </>
  );
};

const tabsWithIconsAndContent: TabWithContent<TabValue>[] = [
  { name: "Tab 1", value: "tab1", icon: "camera", render: () => <TestTabContent content="Tab 1 Content" /> },
  { name: "Tab 2", value: "tab2", icon: "dollar", render: () => <TestTabContent content="Tab 2 Content" /> },
  { name: "Tab 3", value: "tab3", icon: "check", render: () => <TestTabContent content="Tab 3 Content" /> },
  { name: "Tab 4", value: "tab4", icon: "plus", render: () => <TestTabContent content="Tab 4 Content" /> },
];

function getChildren(label: string) {
  return (
    <Fragment>
      {label}
      <Icon icon="checkCircle" />
    </Fragment>
  );
}

function RouteTab1() {
  const { ceId } = useParams<{ ceId: string }>();
  return (
    <>
      <h1 css={Css.lgSb.$}>Tab 1 Content</h1>
      <h2>Params ceId = {ceId}</h2>
      <div>
        <pre css={Css.dib.$}>tab.path = ["/:ceId/overview", "/:ceId"]</pre>
      </div>
    </>
  );
}

function RouteTab2() {
  const { ceId } = useParams<{ ceId: string }>();
  return (
    <>
      <h1 css={Css.lgSb.$}>Tab 2 Content</h1>
      <h2>Params ceId = {ceId}</h2>
      <div>
        <pre css={Css.dib.$}>tab.path = ["/:ceId/line-items", "/:ceId/line-items/*"]</pre>
      </div>
      <div css={Css.mt2.$}>
        <p>Click below to load a sub route of this tab, which should keep this tab as "active"</p>
        <Link to="/ce:1/line-items/celi:1/overview">Line Item Details</Link>
        <div>
          <Route path="/:ceId/line-items/:celiId">Loaded Line Items Overview!</Route>
        </div>
      </div>
    </>
  );
}

function RouteTab3() {
  const { ceId } = useParams<{ ceId: string }>();
  return (
    <>
      <h1 css={Css.lgSb.$}>Tab 3 Content</h1>
      <h2>Params ceId = {ceId}</h2>
      <div>
        <pre css={Css.dib.$}>tab.path = "/:ceId/history"</pre>
      </div>
    </>
  );
}
