import { Global } from "@emotion/react";
import DOMPurify from "dompurify";
import { ChangeEvent, createElement, useEffect, useRef, useState } from "react";
import { useId } from "react-aria";
import { Label } from "src/components/Label";
import { Css, Palette } from "src/Css";
import { maybeCall, noop } from "src/utils";
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
  onBlur?: () => void;
  /** Called when the component is in focus. */
  onFocus?: () => void;
  /** For rendering formatted text */
  readOnly?: boolean;
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
  const { mergeTags, label, value = "", onChange, onBlur = noop, onFocus = noop, readOnly } = props;
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
  const onBlurRef = useRef<RichTextFieldProps["onBlur"]>(onBlur);
  onBlurRef.current = onBlur;
  const onFocusRef = useRef<RichTextFieldProps["onFocus"]>(onFocus);
  onFocusRef.current = onFocus;

  const editorElement = useRef<HTMLElement>(null);
  const parentRef = useRef<HTMLElement>(null);
  const [showTrix, setShowTrix] = useState(false);

  useEffect(
    () => {
      if (readOnly || !editorElement.current) return;

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

      const trixBlur = () => maybeCall(onBlurRef.current);
      const trixFocus = () => maybeCall(onFocusRef.current);

      // We don't want to allow file attachment for now.  In addition to hiding the button, also disable drag-and-drop
      // https://github.com/basecamp/trix#storing-attached-files
      const preventDefault = (e: any) => e.preventDefault();
      window.addEventListener("trix-file-accept", preventDefault);

      const { addEventListener } = editorElement.current;
      addEventListener("trix-change", trixChange as any);
      addEventListener("trix-blur", trixBlur);
      addEventListener("trix-focus", trixFocus);

      return () => {
        if (editorElement.current) {
          const { removeEventListener } = editorElement.current;
          removeEventListener("trix-change", trixChange as any);
          removeEventListener("trix-blur", trixBlur);
          removeEventListener("trix-focus", trixFocus);
          window.removeEventListener("trix-file-accept", preventDefault);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [readOnly, editorElement.current, showTrix],
  );

  useEffect(() => {
    // If our value prop changes (without the change coming from us), reload it
    if (!readOnly && editor.current && value !== currentHtml.current) {
      editor.current.loadHTML(value || "");
    }
  }, [value, readOnly]);

  useEffect(() => {
    if (parentRef.current) {
      function onEditorInit() {
        editor.current = (editorElement.current as any).editor;
        if (mergeTags !== undefined) {
          attachTributeJs(mergeTags, editorElement.current!);
        }

        currentHtml.current = value;
        editor.current!.loadHTML(value || "");
      }

      parentRef.current.addEventListener("trix-initialize", onEditorInit);
      setShowTrix(true);

      return () => {
        if (parentRef.current) {
          parentRef.current.removeEventListener("trix-initialize", onEditorInit);
        }
      };
    }
  }, [parentRef]);

  const { placeholder, autoFocus } = props;

  if (!readOnly) {
    return (
      <div css={Css.w100.maxw("550px").$}>
        {/* TODO: Not sure what to pass to labelProps. */}
        {label && <Label labelProps={{}} label={label} />}
        <div css={{ ...Css.br4.bgWhite.$, ...trixCssOverrides }} ref={parentRef as any}>
          {/*
              Conditionally rendering the <trix-editor/> via `showTrix` is a real bummer to do, but seems necessary.
              In order to properly handle the `trix-initialize` event, then we have to add an event listener before
              the <trix-editor/> is mounted. This is because we can only attach the custom event listeners in a useEffect (after the component mounted).
              By conditionally rendering, and adding the event listener to the parent, we can ensure we have the event listener attached,
              then render the element, and the event will bubble up to the `parentRef` and then we can properly initialize.
              Again, its a bummer, but not sure of a better way to ensure order or operation execution.
          */}
          {showTrix ? (
            <>
              {/*
                "hidden" input element should to be in the DOM prior to the trix-editor element in order for initialize to fire properly
                https://github.com/basecamp/trix/issues/254#issuecomment-321814353
              */}
              <input type="hidden" id={`input-${id}`} value={value} />
              {createElement("trix-editor", {
                input: `input-${id}`,
                // Autofocus attribute is case sensitive since this is standard HTML
                ...(autoFocus ? { autofocus: true } : {}),
                ...(placeholder ? { placeholder } : {}),
                ref: editorElement,
              })}
            </>
          ) : (
            <></>
          )}
        </div>
        <Global styles={[tributeOverrides]} />
      </div>
    );
  } else {
    return (
      <div css={Css.w100.maxw("550px").$}>
        {label && <Label label={label} />}
        <div
          css={Css.mh("120px").bgWhite.sm.gray900.bn.p1.br4.bGray300.ba.$}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) || placeholder || "" }}
          data-readonly="true"
        ></div>
      </div>
    );
  }
}

function attachTributeJs(mergeTags: string[], editorElement: HTMLElement) {
  const values = mergeTags.map((value) => ({ value }));
  const tribute = new Tribute({
    trigger: "@",
    lookup: "value",
    /** Not using allowSpaces due to a bug: {@link https://github.com/zurb/tribute/issues/606}
     * This will prevent lookups that include a space. However, it can still tag a name with spaces in it. Just the autocomplete menu will disappear once the user types a space. */
    allowSpaces: false,
    /** {@link https://github.com/zurb/tribute#hide-menu-when-no-match-is-returned} */
    noMatchTemplate: () => `<span style:"visibility: hidden;"></span>`,
    // According to the Tribute Types, `original.value` should always be present.
    // However, we have received errors in DataDog for "Cannot read properties of undefined (reading 'original')", so we're adding some checks.
    selectTemplate: (item) =>
      item?.original?.value ? `<span style="color: ${Palette.LightBlue700};">@${item.original.value}</span>` : "",
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
  ...Css.relative.add({ wordBreak: "break-word" }).br4.bGray300.ba.$,
  // Put the toolbar on the bottom
  ...Css.df.fdcr.childGap1.$,
  // Some basic copy/paste from TextFieldBase
  "& trix-editor": Css.bgWhite.sm.gray900.bn.p1.$,
  // Highlight on focus
  "&:focus-within": Css.bLightBlue700.$,
  "& trix-toolbar": Css.m1.$,
  // Make the buttons closer to ours
  "& .trix-button:not(:first-of-type)": Css.bn.$,
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
