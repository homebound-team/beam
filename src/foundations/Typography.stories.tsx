import type { Meta } from "@storybook/react-vite";
import { Css, Tokens, type Properties } from "src/Css";

export default {
  title: "Foundations/Typography",
} as Meta;

export function Typography() {
  const rows = createTypographyRows();
  return (
    <table css={Css.w100.add("borderCollapse", "collapse").$}>
      <thead>
        <tr css={Css.xs.color(Tokens.OnSurfaceMuted).$}>
          <th css={headerCellCss}>Style Name</th>
          <th css={headerCellCss}>Weight</th>
          <th css={headerCellCss}>Size</th>
          <th css={headerCellCss}>Line Height</th>
          <th css={headerCellCss}>Use Case</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.name}-${row.weight}`} css={Css.bt.bc(Tokens.SurfaceSeparator).$}>
            <td css={{ ...bodyCellCss, ...row.sampleCss }}>{row.name}</td>
            <td css={bodyCellCss}>{row.weight}</td>
            <td css={bodyCellCss}>{row.size}</td>
            <td css={bodyCellCss}>{row.lineHeight}</td>
            <td css={{ ...bodyCellCss, ...row.sampleCss }}>
              {row.useCases.map((useCase) => (
                <div key={useCase}>{useCase}</div>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const headerCellCss = Css.tal.pr3.py2.wsnw.$;
const bodyCellCss = Css.tal.pr3.py3.vat.$;

type TypographyRow = {
  name: string;
  weight: "Regular" | "Semibold";
  size: string;
  lineHeight: string;
  sampleCss: Properties;
  useCases: string[];
};

function createTypographyRows(): TypographyRow[] {
  return [
    {
      name: "2XL",
      weight: "Semibold",
      size: "24px",
      lineHeight: "32px",
      sampleCss: Css.xl2.$,
      useCases: ["Header Page Titles"],
    },
    {
      name: "XL",
      weight: "Semibold",
      size: "20px",
      lineHeight: "28px",
      sampleCss: Css.xl.$,
      useCases: ["Page Section Titles", "Sidebar Section Titles"],
    },
    {
      name: "LG",
      weight: "Semibold",
      size: "18px",
      lineHeight: "28px",
      sampleCss: Css.lg.$,
      useCases: ["Page Subsection Titles"],
    },
    {
      name: "MD",
      weight: "Semibold",
      size: "16px",
      lineHeight: "24px",
      sampleCss: Css.mdSb.$,
      useCases: ["Page Navigation", "Page Sub-Subsection Titles"],
    },
    {
      name: "MD",
      weight: "Regular",
      size: "16px",
      lineHeight: "24px",
      sampleCss: Css.md.$,
      useCases: ["Section Descriptions"],
    },
    {
      name: "SM",
      weight: "Semibold",
      size: "14px",
      lineHeight: "20px",
      sampleCss: Css.smSb.$,
      useCases: ["Page Sub Sub-Subsection Titles", "Card Item Title"],
    },
    {
      name: "SM",
      weight: "Regular",
      size: "14px",
      lineHeight: "20px",
      sampleCss: Css.sm.$,
      useCases: ["Input Label", "Input Text", "Commenter Name", "Comment Text", "Date Posted"],
    },
    {
      name: "XS",
      weight: "Semibold",
      size: "12px",
      lineHeight: "16px",
      sampleCss: Css.xsSb.$,
      useCases: ["Table Totals Row", "Table Row Item Title", "Breadcrumbs"],
    },
    {
      name: "XS",
      weight: "Regular",
      size: "12px",
      lineHeight: "16px",
      sampleCss: Css.xs.$,
      useCases: ["Table Row", "Table Column Labels", "Input Helper Text"],
    },
    {
      name: "2XS",
      weight: "Semibold",
      size: "10px",
      lineHeight: "14px",
      sampleCss: Css.xs2Sb.$,
      useCases: ["Tag Label", "Item Card Brand"],
    },
    {
      name: "2XS",
      weight: "Regular",
      size: "10px",
      lineHeight: "14px",
      sampleCss: Css.xs2.$,
      useCases: ["Item Card Meta Data"],
    },
  ];
}
