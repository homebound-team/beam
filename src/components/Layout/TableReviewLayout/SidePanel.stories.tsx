import { Meta } from "@storybook/react-vite";
import { ReactNode, useState } from "react";
import { Css } from "src/Css";
import { RadioGroupField } from "src/inputs/RadioGroupField";
import { TextAreaField } from "src/inputs/TextAreaField";
import { TextField } from "src/inputs/TextField";
import { withBeamDecorator, zeroTo } from "src/utils/sb";
import { SidePanel } from "./SidePanel";

export default {
  component: SidePanel,
  decorators: [withBeamDecorator],
} satisfies Meta;

function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div css={Css.df.aic.jcc.hPx(700).$}>
      <div css={Css.wPx(450).hPx(650).ba.bcGray200.br4.oh.$}>{children}</div>
    </div>
  );
}

export function Basic() {
  return (
    <PanelShell>
      <SidePanel
        title="Towel / Robe Hook"
        primaryAction={{ label: "Accept", icon: "check", onClick: () => {} }}
        secondaryAction={{ label: "Reject", icon: "x", onClick: () => {} }}
        content={
          <div css={Css.p3.df.fdc.gap3.$}>
            <Field label="Placeholder type" value="BA-TR Towel / Robe Hook" />
            <Field label="Location" value="Primary Bath 205" />
            <Field label="Feature" value="XXX" />
            <Field label="Length" value="7.8125" />
            <Field label="Depth" value='2-5/8"' />
          </div>
        }
      />
    </PanelShell>
  );
}

export function WithScrollingContent() {
  return (
    <PanelShell>
      <SidePanel
        title="Towel / Robe Hook"
        primaryAction={{ label: "Accept", icon: "check", onClick: () => {} }}
        secondaryAction={{ label: "Reject", icon: "x", onClick: () => {} }}
        content={
          <div css={Css.p3.df.fdc.gap3.$}>
            {zeroTo(20).map((i) => (
              <Field key={i} label={`Field ${i + 1}`} value={`Value for field ${i + 1}`} />
            ))}
          </div>
        }
      />
    </PanelShell>
  );
}

export function WithoutFooter() {
  return (
    <PanelShell>
      <SidePanel
        title="Read Only Detail"
        content={
          <div css={Css.p3.df.fdc.gap3.$}>
            <Field label="Placeholder type" value="BA-TR Towel / Robe Hook" />
            <Field label="Location" value="Primary Bath 205" />
            <Field label="Feature" value="XXX" />
          </div>
        }
      />
    </PanelShell>
  );
}

export function WithLongTitle() {
  return (
    <PanelShell>
      <SidePanel
        title="A Very Long Placeholder Title That Might Need To Wrap Or Truncate"
        primaryAction={{ label: "Accept", icon: "check", onClick: () => {} }}
        secondaryAction={{ label: "Reject", icon: "x", onClick: () => {} }}
        content={<div css={Css.p3.$}>Content here</div>}
      />
    </PanelShell>
  );
}

export function WithFormInputs() {
  const [taskAllocation, setTaskAllocation] = useState<string | undefined>("install");
  const [qty, setQty] = useState<string | undefined>("");
  const [notes, setNotes] = useState<string | undefined>("");

  return (
    <PanelShell>
      <SidePanel
        title="Towel / Robe Hook"
        primaryAction={{ label: "Accept", icon: "check", onClick: () => {} }}
        secondaryAction={{ label: "Reject", icon: "x", onClick: () => {} }}
        content={
          <div css={Css.p3.df.fdc.gap3.$}>
            <Field label="Placeholder type" value="BA-TR Towel / Robe Hook" />
            <Field label="Location" value="Primary Bath 205" />
            <Field label="Feature" value="XXX" />
            <RadioGroupField
              label="Task allocation"
              value={taskAllocation}
              onChange={setTaskAllocation}
              options={[
                { label: "Install Interior Hardware", value: "install" },
                { label: "Rough Hardware", value: "rough" },
                { label: "Finish Carpentry", value: "finish" },
              ]}
            />
            <TextField label="Qty" value={qty} onChange={setQty} />
            <TextAreaField label="Notes" value={notes} onChange={setNotes} />
          </div>
        }
      />
    </PanelShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div css={Css.xs.gray500.mb1.$}>{label}</div>
      <div css={Css.sm.$}>{value}</div>
    </div>
  );
}
