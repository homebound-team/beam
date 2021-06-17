import { Global } from "@emotion/react";
import { ChangeEvent, createElement, useEffect, useRef } from "react";
import { useId } from "react-aria";
import { Label } from "src/components/Label";
import { Css, Palette } from "src/Css";
import { maybeCall } from "src/utils";
import Tribute from "tributejs";
import "tributejs/dist/tribute.css";
import "trix/dist/trix";
import "trix/dist/trix.css";

export interface RichTextFieldProps {
  /** The initial html value to show in the trix editor. */
  value: string | undefined;
  onChange: (html: string | undefined, text: string | undefined, mergeTags: string[]) => void;
  /**
   * A list of tags/names to show in a popup when the user `@`-s.
   *
   * Currently we don't support mergeTags being updated.
   */
  mergeTags?: string[];
  label?: string;
  autoFocus?: boolean;
  placeholder?: string;
  /** Called when the component loses focus */
  onBlur: () => void;
  /** Called when the component is in focus. */
  onFocus: () => void;
}

// There aren't types for trix, so add our own. For now `loadHTML` is all we call anyway.
type Editor = {
  loadHTML(html: string): void;
};

/**
 * Provides a simple rich text editor based on trix.
 *
 * See [trix]{@link https://github.com/basecamp/trix}.
 *
 * We also integrate [tributejs]{@link https://github.com/zurb/tribute} for @ mentions.
 */
export function RichTextField(props: RichTextFieldProps) {
  const { mergeTags, label, value = "", onChange, onBlur, onFocus } = props;
  const id = useId();

  // We get a reference to the Editor instance after trix-init fires
  const editor = useRef<Editor | undefined>(undefined);

  // Keep track of what we pass to onChange, so that we can make ourselves keep looking
  // like a controlled input, i.e. by only calling loadHTML if a new incoming `value` !== `currentHtml`,
  // otherwise we'll constantly call loadHTML and reset the user's cursor location.
  const currentHtml = useRef<string | undefined>(undefined);

  // Use a ref for onChange b/c so trixChange always has the latest
  const onChangeRef = useRef<RichTextFieldProps["onChange"]>(onChange);
  onChangeRef.current = onChange;

  useEffect(
    () => {
      const editorElement = document.getElementById(`editor-${id}`);
      if (!editorElement) {
        throw new Error("editorElement not found");
      }

      editor.current = (editorElement as any).editor;
      if (!editor.current) {
        throw new Error("editor not found");
      }
      if (mergeTags !== undefined) {
        attachTributeJs(mergeTags, editorElement!);
      }

      // We have a 2nd useEffect to call loadHTML when value changes, but
      // we do this here b/c we assume the 2nd useEffect's initial evaluation
      // "missed" having editor.current set b/c trix-initialize hadn't fired.
      currentHtml.current = value;
      editor.current.loadHTML(value || "");

      function trixChange(e: ChangeEvent) {
        const { textContent, innerHTML } = e.target;
        const onChange = onChangeRef.current;
        // If the user only types whitespace, treat that as undefined
        if ((textContent || "").trim() === "") {
          currentHtml.current = undefined;
          onChange && onChange(undefined, undefined, []);
        } else {
          currentHtml.current = innerHTML;
          const mentions = extractIdsFromMentions(mergeTags || [], textContent || "");
          onChange && onChange(innerHTML, textContent || undefined, mentions);
        }
      }

      // We don't want to allow file attachment for now.  In addition to hiding the button, also disable drag-and-drop
      // https://github.com/basecamp/trix#storing-attached-files
      const preventDefault = (e: any) => e.preventDefault();
      window.addEventListener("trix-file-accept", preventDefault);

      const trixBlur = () => maybeCall(onBlur);
      const trixFocus = () => maybeCall(onFocus);

      editorElement.addEventListener("trix-change", trixChange as any, false);
      editorElement.addEventListener("trix-blur", trixBlur as any, false);
      editorElement.addEventListener("trix-focus", trixFocus as any, false);

      return () => {
        editorElement.removeEventListener("trix-change", trixChange as any);
        editorElement.removeEventListener("trix-blur", trixBlur as any);
        editorElement.removeEventListener("trix-focus", trixFocus as any);
        window.removeEventListener("trix-file-accept", preventDefault);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    // If our value prop changes (without the change coming from us), reload it
    if (editor.current && value !== currentHtml.current) {
      editor.current.loadHTML(value || "");
    }
  }, [value]);

  const { placeholder, autoFocus } = props;

  return (
    <div css={Css.w100.maxw("550px").$}>
      {/* TODO: Not sure what to pass to labelProps. */}
      {label && <Label labelProps={{}} label={label} />}
      <div css={{...Css.br4.bgWhite.$, ...trixCssOverrides}}>
        {createElement("trix-editor", {
          id: `editor-${id}`,
          input: `input-${id}`,
          // Autofocus attribute is case sensitive since this is standard HTML
          ...(autoFocus ? { autofocus: true } : {}),
          ...(placeholder ? { placeholder } : {}),
        })}
        <input type="hidden" id={`input-${id}`} value={value} />
      </div>
      <Global styles={[tributeOverrides]} />
    </div>
  );
}

function attachTributeJs(mergeTags: string[], editorElement: HTMLElement) {
  const values = mergeTags.map((value) => ({ value }));
  const tribute = new Tribute({
    trigger: "@",
    lookup: "value",
    allowSpaces: true,
    /** {@link https://github.com/zurb/tribute#hide-menu-when-no-match-is-returned} */
    noMatchTemplate: () => `<span style:"visibility: hidden;"></span>`,
    selectTemplate: ({ original: { value } }) => `<span style="color: ${Palette.LightBlue700};">@${value}</span>`,
    values,
  });
  // In dev mode, this fails because jsdom doesn't support contentEditable. Note that
  // before create-react-app 4.x / a newer jsdom, the trix-initialize event wasn't
  // even fired during unit tests anyway.
  try {
    tribute.attach(editorElement!);
  } catch {}
}

const trixCssOverrides = {
  ...Css.relative.add({ wordBreak: "break-word" }).$,
  // Put the toolbar on the bottom
  ...Css.df.flexColumnReverse.childGap1.$,
  // Some basic copy/paste from TextFieldBase
  "& trix-editor": Css.bgWhite.sm.gray900.br4.bGray300.bn.p2.$,
  "& trix-toolbar": Css.m1.$,
  // Make the buttons closer to ours
  "& .trix-button:not(:first-child)": Css.bn.$,
  "& .trix-button-group": Css.bn.m0.$,
  "& .trix-button": Css.bgWhite.sm.$,
  // Height is hard-coded to 1.6 in trix, and the default width is wider than we want
  "& .trix-button--icon": Css.w("1.6em").p0.mxPx(4).bn.$,
  // icons are hard-coded svg's, so this is a simpler way to get lighter gray for now
  "& .trix-button--icon::before": Css.add("opacity", "0.3").$,
  // trix defaults to is active = blue bg - turn that off + make icon darker
  "& .trix-button.trix-active": Css.bgWhite.add("opacity", "0.7").$,
  // We don't support file attachment yet, so hide that control for now.
  "& .trix-button-group--file-tools": Css.dn.$,
  // Other things that are unused and we want to hide
  "& .trix-button--icon-heading-1": Css.dn.$,
  "& .trix-button--icon-code": Css.dn.$,
  "& .trix-button--icon-quote": Css.dn.$,
  "& .trix-button--icon-increase-nesting-level": Css.dn.$,
  "& .trix-button--icon-decrease-nesting-level": Css.dn.$,
  "& .trix-button-group--history-tools": Css.dn.$,
};

// Style the @ mention box
const tributeOverrides = {
  ".tribute-container": Css.add({ minWidth: "300px" }).$,
  ".tribute-container > ul": Css.sm.bgWhite.ba.br4.bLightBlue700.overflowHidden.$,
};

function extractIdsFromMentions(mergeTags: string[], content: string): string[] {
  return mergeTags.filter((tag) => content.includes(`@${tag}`));
}
