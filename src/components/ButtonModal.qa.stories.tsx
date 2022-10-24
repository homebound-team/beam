import { ButtonModal, WithContextualModalProps } from "./ButtonModal";

export default {
  component: ButtonModal,
  title: "Design QA/ButtonModal",
};

export function ButtonModalForQa(props: WithContextualModalProps) {
  const { defaultOpen, title, content } = props;
  return <ButtonModal defaultOpen title="Modal title" content="Lorum Ipsum" trigger={{ label: "ButtonModal" }} />;
}
