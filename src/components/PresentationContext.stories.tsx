import { useState } from "react";
import { InternalUser } from "src/components/Filters/testDomain";
import { PresentationProvider } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { DateField, MultiSelectField, NumberField, SelectField, TextAreaField, TextField } from "src/inputs";

export default {
  component: PresentationProvider,
};

export function PresentationFieldProps() {
  return (
    <div>
      <div css={Css.pb2.mb2.bb.bGray300.$}>
        <h1 css={Css.xlSb.$}>Borderless</h1>
        <PresentationProvider fieldProps={{ borderless: true }}>
          <TestFields />
        </PresentationProvider>
      </div>

      <div css={Css.pb2.mb2.bb.bGray300.$}>
        <h1 css={Css.xlSb.$}>Compact</h1>
        <PresentationProvider fieldProps={{ compact: true }}>
          <TestFields />
        </PresentationProvider>
      </div>

      <div css={Css.pb2.mb2.bb.bGray300.$}>
        <h1 css={Css.xlSb.$}>Hidden Labels</h1>
        <PresentationProvider fieldProps={{ labelStyle: "hidden" }}>
          <TestFields />
        </PresentationProvider>
      </div>

      <div css={Css.pb2.mb2.bb.bGray300.$}>
        <h1 css={Css.xlSb.$}>Number Alignment Right</h1>
        <PresentationProvider fieldProps={{ numberAlignment: "right" }}>
          <TestFields />
        </PresentationProvider>
      </div>

      <div css={Css.pb2.mb2.bb.bGray300.$}>
        <h1 css={Css.xlSb.$}>Label Suffix</h1>
        <PresentationProvider fieldProps={{ labelSuffix: { required: "*", optional: "(optional)" } }}>
          <TestFields />
        </PresentationProvider>
      </div>

      <div css={Css.pb2.mb2.bb.bGray300.$}>
        <h1 css={Css.xlSb.$}>Small Font size</h1>
        <PresentationProvider fieldProps={{ typeScale: "xs", compact: true }}>
          <TestFields />
        </PresentationProvider>
      </div>

      <div css={Css.pb2.mb2.bb.bGray300.$}>
        <h1 css={Css.xlSb.$}>visuallyDisabled=false</h1>
        <PresentationProvider fieldProps={{ visuallyDisabled: false }}>
          <TestFields disabled />
        </PresentationProvider>
      </div>
    </div>
  );
}

function TestFields({ disabled = false }: { disabled?: boolean }) {
  const [name, setName] = useState<string | undefined>("Brandon");
  const [description, setDescription] = useState<string | undefined>("Initial Description");
  const [age, setAge] = useState<number | undefined>(35);
  const [birthday, setBirthday] = useState<Date | undefined>(new Date("01/29/86"));
  const [favSuperhero, setFavSuperhero] = useState<string | undefined>("1");
  const [top5Superheros, setTop5FavSuperheros] = useState<string[]>(["1", "2"]);

  return (
    <div css={Css.df.fdc.gap1.$}>
      <TextField label="Name" value={name} onChange={setName} required disabled={disabled} />
      <TextAreaField
        label="Description"
        value={description}
        onChange={setDescription}
        required={false}
        disabled={disabled}
      />
      <NumberField label="Age" value={age} onChange={setAge} required disabled={disabled} />
      <DateField value={birthday} label="Birthday" onChange={setBirthday} required={false} disabled={disabled} />
      <SelectField
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        value={favSuperhero}
        onSelect={(v) => setFavSuperhero(v)}
        options={superheros}
        label="Favorite Superhero"
        required={false}
        disabled={disabled}
      />
      <MultiSelectField
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        values={top5Superheros}
        onSelect={(v) => setTop5FavSuperheros(v)}
        options={superheros}
        label="Top 5 Superheros"
        required
        disabled={disabled}
      />
    </div>
  );
}

const superheros: InternalUser[] = [
  { id: "1", name: "Iron Man", role: "Leader" },
  { id: "2", name: "Captain America", role: "Carries the cool shield" },
  { id: "3", name: "Thor", role: "Hammer thrower" },
  { id: "4", name: "Hulk", role: "The Muscle" },
  { id: "5", name: "Black Widow", role: "Being sneaky" },
  { id: "6", name: "Ant Man", role: "Helps Wasp" },
  { id: "7", name: "Wasp", role: "Does the small jobs" },
  { id: "8", name: "Black Panther", role: "Also being sneaky" },
  { id: "9", name: "Captain Marvel", role: "Does it all" },
  { id: "10", name: "Doctor Strange", role: "Doctor" },
];
