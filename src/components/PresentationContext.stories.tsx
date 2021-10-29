import { useState } from "react";
import { InternalUser } from "src/components/Filters/testDomain";
import { PresentationProvider } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { DateField, MultiSelectField, NumberField, SelectField, TextAreaField, TextField } from "src/inputs";

export default {
  component: PresentationProvider,
  title: "components/PresentationProvider",
};

export function PresentationFieldProps() {
  return (
    <div>
      <div css={Css.pb2.mb2.bb.bGray300.$}>
        <h1 css={Css.xlEm.$}>Borderless</h1>
        <PresentationProvider fieldProps={{ borderless: true }}>
          <TestFields />
        </PresentationProvider>
      </div>

      <div css={Css.pb2.mb2.bb.bGray300.$}>
        <h1 css={Css.xlEm.$}>Compact</h1>
        <PresentationProvider fieldProps={{ compact: true }}>
          <TestFields />
        </PresentationProvider>
      </div>

      <div css={Css.pb2.mb2.bb.bGray300.$}>
        <h1 css={Css.xlEm.$}>Hidden Labels</h1>
        <PresentationProvider fieldProps={{ hideLabel: true }}>
          <TestFields />
        </PresentationProvider>
      </div>

      <div css={Css.pb2.mb2.bb.bGray300.$}>
        <h1 css={Css.xlEm.$}>Number Alignment Right</h1>
        <PresentationProvider fieldProps={{ numberAlignment: "right" }}>
          <TestFields />
        </PresentationProvider>
      </div>

      <div css={Css.pb2.mb2.bb.bGray300.$}>
        <h1 css={Css.xlEm.$}>Label Suffix</h1>
        <PresentationProvider fieldProps={{ labelSuffix: { required: "*", optional: "(optional)" } }}>
          <TestFields />
        </PresentationProvider>
      </div>

      <div css={Css.pb2.mb2.bb.bGray300.$}>
        <h1 css={Css.xlEm.$}>Small Font size</h1>
        <PresentationProvider fieldProps={{ typeScale: "xs", compact: true }}>
          <TestFields />
        </PresentationProvider>
      </div>
    </div>
  );
}

function TestFields() {
  const [name, setName] = useState<string | undefined>("Brandon");
  const [description, setDescription] = useState<string | undefined>("Initial Description");
  const [age, setAge] = useState<number | undefined>(35);
  const [birthday, setBirthday] = useState<Date | undefined>(new Date("01/29/86"));
  const [favSuperhero, setFavSuperhero] = useState<string | undefined>("1");
  const [top5Superheros, setTop5FavSuperheros] = useState<string[]>(["1", "2"]);

  return (
    <div css={Css.df.fdc.childGap1.$}>
      <TextField label="Name" value={name} onChange={setName} required />
      <TextAreaField label="Description" value={description} onChange={setDescription} required={false} />
      <NumberField label="Age" value={age} onChange={setAge} required />
      <DateField value={birthday} label="Birthday" onChange={setBirthday} required={false} />
      <SelectField
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        value={favSuperhero}
        onSelect={(v) => setFavSuperhero(v)}
        options={superheros}
        label="Favorite Superhero"
        required={false}
      />
      <MultiSelectField
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        values={top5Superheros}
        onSelect={(v) => setTop5FavSuperheros(v)}
        options={superheros}
        label="Top 5 Superheros"
        required
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
