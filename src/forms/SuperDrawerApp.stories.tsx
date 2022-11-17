import { useFormState } from "@homebound/form-state";
import { Meta } from "@storybook/react";
import { useEffect } from "react";
import { Button, SuperDrawerContent, useSuperDrawer } from "src/components";
import { SuperDrawerHeader } from "src/components/SuperDrawer/components/SuperDrawerHeader";
import { Css } from "src/Css";
import { withBeamDecorator, withDimensions } from "src/utils/sb";
import { BoundDateField } from "./BoundDateField";
import { BoundNumberField } from "./BoundNumberField";
import { BoundTextField } from "./BoundTextField";
import { formConfig } from "./FormStateApp";
import { AuthorInput } from "./formStateDomain";

/**
 * Example app using Superdrawer and FormState.
 *
 * Key features:
 * - When attempting to close the drawer when the form is "dirty" a
 * confirmation message appears.
 * - When cancelling the close, the form values are untouched.
 * - When filling the form and successfully clicking "save", closing the form
 * does not show a confirmation message.
 */
export default { title: "Workspace/Forms/Super Drawer App", decorators: [withBeamDecorator, withDimensions()] } as Meta;

export function SuperDrawerApp() {
  const { openInDrawer } = useSuperDrawer();

  useEffect(openSuperDrawer, [openInDrawer]);

  function openSuperDrawer() {
    openInDrawer({
      content: <SuperDrawerForm />,
    });
  }

  return (
    <>
      <h1 css={Css.xl2.mb1.$}>SuperDrawer App</h1>
      <Button label="Open SuperDrawer" onClick={openSuperDrawer} />
    </>
  );
}

const initFormValue: AuthorInput = {};
function SuperDrawerForm() {
  const { closeDrawer, addCanCloseDrawerCheck } = useSuperDrawer();
  const formState = useFormState({ config: formConfig, init: initFormValue });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => addCanCloseDrawerCheck(() => !formState.dirty), []);

  return (
    <SuperDrawerContent
      actions={[
        { label: "Cancel", onClick: closeDrawer },
        {
          label: "Save",
          onClick: () => {
            formState.canSave();
            formState.commitChanges();
          },
        },
      ]}
    >
      <SuperDrawerHeader>
        <h1>Create Author</h1>
      </SuperDrawerHeader>
      <fieldset>
        <legend css={Css.xl.mb2.$}>Author</legend>
        <BoundTextField field={formState.firstName} />
        <BoundTextField field={formState.lastName} />
        <BoundDateField field={formState.birthday} />
        <BoundNumberField field={formState.heightInInches} />
      </fieldset>
    </SuperDrawerContent>
  );
}
