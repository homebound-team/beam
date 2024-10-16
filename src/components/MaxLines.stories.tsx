import { useMemo, useState } from "react";
import { Button, Css } from "src";
import { MaxLines } from "src/components/MaxLines";

export default {
  component: MaxLines,
};

export function Text() {
  const shortContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  const longContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus a velit laoreet, ultricies lacus at, volutpat est. Vestibulum vel eleifend felis. In rhoncus elit id velit mattis, non dictum odio tincidunt.";
  const [content, setContent] = useState(longContent);
  const [width, setWidth] = useState(350);
  return (
    <div css={Css.df.fdc.gap2.aic.jcc.mtPx(200).$}>
      <div css={Css.df.aic.gap2.$}>
        <Button
          onClick={() => setContent((prev) => (prev === longContent ? shortContent : longContent))}
          label="Change content"
        />
        <Button onClick={() => setWidth((prev) => (prev === 350 ? 600 : 350))} label="Change width" />
      </div>
      <div css={Css.p1.ba.bcGray400.bshBasic.br8.wPx(width).$}>
        <MaxLines maxLines={3}>{content}</MaxLines>
      </div>
    </div>
  );
}

export function WithElements() {
  const longContent = useMemo(
    () => (
      <div css={Css.sm.$}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        <span css={Css.baseSb.$}>
          Vivamus a velit laoreet, ultricies lacus at, volutpat est.
          <span css={Css.blue600.$}>
            Vestibulum vel eleifend felis. In rhoncus elit id velit mattis, non dictum odio tincidunt.
          </span>
        </span>
      </div>
    ),
    [],
  );
  const shortContent = useMemo(
    () => (
      <span css={Css.blue600.$}>
        Vestibulum vel eleifend felis. In rhoncus elit id velit mattis, non dictum odio tincidunt.
      </span>
    ),
    [],
  );
  const [content, setContent] = useState(longContent);
  const [width, setWidth] = useState(350);
  return (
    <div css={Css.df.fdc.gap2.aic.jcc.mtPx(200).$}>
      <div css={Css.df.aic.gap2.$}>
        <Button
          onClick={() => setContent((prev) => (prev === longContent ? shortContent : longContent))}
          label="Change content"
        />
        <Button onClick={() => setWidth((prev) => (prev === 350 ? 600 : 350))} label="Change width" />
      </div>
      <div css={Css.p1.ba.bcGray400.bshBasic.br8.wPx(width).$}>
        <MaxLines maxLines={3}>{content}</MaxLines>
      </div>
    </div>
  );
}
