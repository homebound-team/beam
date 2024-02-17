import { ButtonModal, ButtonModalProps } from "./ButtonModal";

export default {
  component: ButtonModal,
};

export function ButtonModalForQa(props: ButtonModalProps) {
  const { storybookDefaultOpen, title, content } = props;
  return (
    <ButtonModal storybookDefaultOpen title="Modal title" content="Lorum Ipsum" trigger={{ label: "ButtonModal" }} />
  );
}
