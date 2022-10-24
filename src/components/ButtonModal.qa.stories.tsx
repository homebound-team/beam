import { ButtonModal, ButtonModalProps } from "./ButtonModal";

export default {
  component: ButtonModal,
  title: "Design QA/ButtonModal",
};

export function ButtonModalForQa(props: ButtonModalProps) {
  const { storybookDefaultOpen, title, content } = props;
  return (
    <ButtonModal storybookDefaultOpen title="Modal title" content="Lorum Ipsum" trigger={{ label: "ButtonModal" }} />
  );
}
