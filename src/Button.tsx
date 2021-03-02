/** @jsx jsx */
import { jsx } from '@emotion/react';
import { Tooltip } from '@material-ui/core';
import { ButtonHTMLAttributes, MouseEvent } from 'react';
import { Css, px } from './Css';
import { Icon, IconKey } from './Icon';
import { maybeTestId, useTestIds } from './utils';

type ButtonVariants = 'contained' | 'outlined' | 'rounded';

export interface ButtonProps {
  id?: string;
  icon?: IconKey;
  label?: string;
  onClick: ((e: MouseEvent<HTMLButtonElement>) => void) | string;
  isDestructive?: boolean;
  variant?: ButtonVariants;
  disabled?: boolean;
  disabledReason?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  selected?: boolean;
}

export function Button(props: ButtonProps) {
  const {
    id = maybeTestId(props) || 'button',
    variant,
    icon,
    label,
    isDestructive,
    onClick,
    disabledReason,
    disabled = disabledReason !== undefined,
    type = 'button',
    selected = false,
  } = props;
  const [testId] = useTestIds(id);

  if (!label && !icon) {
    console.warn('Button created without an icon or label. This is most likely a mistake and should be fixed.');
  }

  const sharedStyles = {
    ...baseStyles,
    ...(icon && !label ? Css.w(px(32)).px0.$ : {}),
    ...getButtonStyles(variant, isDestructive),
  };

  function LabelComponent() {
    return <span css={Css.if(!!icon).ml1.$}>{label}</span>;
  }

  // creates a button-styled link when onClick is an href string
  if (typeof onClick === 'string') {
    if (disabled) {
      throw new Error("ButtonV2 doesn't support href-based onClick & being disabled");
    }
    return (
      <a
        css={{ ...sharedStyles, ...Css.noUnderline.if(!label).db.tc.$ }}
        href={onClick}
        target="_blank"
        rel="noreferrer"
        {...{ ...testId }}
      >
        {icon && <Icon icon={icon} />}
        {label && <LabelComponent />}
      </a>
    );
  }

  const button = (
    // TODO: `selected` is intended for ButtonGroups, which we haven't built yet. Once built we should refactor how we apply "selected"
    <button
      {...{ onClick, disabled, type, ...testId }}
      className={selected ? 'selected' : ''}
      css={{ ...sharedStyles }}
    >
      {icon && <Icon icon={icon} xss={Css.h(px(12)).w(px(12)).$} />}
      {label && <LabelComponent />}
    </button>
  );

  if (disabledReason) {
    // We wrap the button in a span following the MUI recommendation:
    // https://material-ui.com/components/tooltips/#disabled-elements
    return (
      <Tooltip title={disabledReason}>
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
}

const baseStyles = Css.px2.py1.ba.bw2.br2.shadowNone.outline0.sansSerif.f12.ttu.cursorPointer.df.itemsCenter.$;

/** Returns styles for a button based on variant and isDestructive. Defaults to Text Button styles */
function getButtonStyles(variant?: ButtonVariants, isDestructive: boolean = false) {
  switch (variant) {
    case 'contained':
      return {
        ...Css.white.if(isDestructive).bRedDark.bgRedDark.else.bBlack.bgBlack.$,
        '&:hover, &.selected': Css.if(isDestructive).bRed.bgRed.else.bBlue.bgBlue.$,
        '&:focus': Css.if(isDestructive).bRed.bgRed.else.bBlue.bgBlue.$,
        '&:active': Css.if(isDestructive).bRedDark.bgRedDark.else.bBlack.bgBlack.$,
        '&:disabled': Css.grayVeryLight.bGray.bgGray.cursorNotAllowed.$,
      };
    case 'outlined':
      return {
        ...Css.bgHollow.bGray.if(isDestructive).redDark.else.primary.$,
        // Always change bg on hover. Only change text to black when it's not destructive
        '&:hover, &.selected': Css.bgGrayVeryLight.if(!isDestructive).black.$,
        '&:focus': Css.bgGrayVeryLight.if(!isDestructive).black.$,
        '&:active': Css.bgBlueLight.if(!isDestructive).black.$,
        '&:disabled': Css.bGrayVeryLight.gray.cursorNotAllowed.$,
      };
    case 'rounded':
      return {
        ...Css.br100.h(px(24)).w(px(24)).df.itemsCenter.justifyCenter.bgPrimary.bPrimary.white.$,
        // Always change bg on hover. Only change text to black when it's not destructive
        '&:hover, &.selected': Css.bgBlueBright.bBlueBright.$,
        '&:focus': Css.bgGrayVeryLight.if(!isDestructive).black.$,
        '&:active': Css.bgBlueLight.if(!isDestructive).black.$,
        '&:disabled': Css.bGrayVeryLight.gray.cursorNotAllowed.$,
      };
    default:
      return {
        ...Css.px1.bHollow.bgHollow.if(isDestructive).redDark.else.primary.$,
        // Always change bg on hover. Only change text to black when it's not destructive
        '&:hover, &.selected': Css.bgGrayVeryLight.if(!isDestructive).black.$,
        '&:focus': Css.bgGrayVeryLight.if(!isDestructive).black.$,
        '&:active': Css.bgBlueLight.if(!isDestructive).black.$,
        '&:disabled': Css.gray.cursorNotAllowed.$,
      };
  }
}
