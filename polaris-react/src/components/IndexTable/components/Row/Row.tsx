import React, {useMemo, memo, useRef, useCallback} from 'react';

import {useToggle} from '../../../../utilities/use-toggle';
import {
  useIndexRow,
  SelectionType,
  useIndexSelectionChange,
} from '../../../../utilities/index-provider';
import {Checkbox} from '../Checkbox';
import {classNames, variationName} from '../../../../utilities/css';
import {RowContext, RowHoveredContext} from '../../../../utilities/index-table';
import type {Range} from '../../../../utilities/index-provider/types';
import styles from '../../IndexTable.scss';

type RowStatus = 'success' | 'subdued';
type TableRowElementType = HTMLTableRowElement & HTMLLIElement;

export interface RowProps {
  /**  */
  children: React.ReactNode;
  /** A unique identifier for the row */
  id: string;
  /** Whether the row is selected */
  selected?: boolean | 'indeterminate';
  /** The zero-indexed position of the row. Used for Shift key multi-selection */
  position: number;
  /** Whether the row should be subdued */
  subdued?: boolean;
  /** Whether the row should have a status */
  status?: RowStatus;
  /** Whether the row should be disabled */
  disabled?: boolean;
  /** A tuple array with the first and last index of the range of rows that the subheader describes. All rows in the range are selected when the subheader row is selected. */
  subHeaderRange?: Range;
  /** Callback fired when the row is clicked and contains a data-primary-link */
  onNavigation?(id: string): void;
  /** Callback fired when the row is clicked. Overrides the default click behaviour. */
  onClick?(): void;
}

export const Row = memo(function Row({
  children,
  selected,
  id,
  position,
  subdued,
  status,
  disabled,
  subHeaderRange,
  onNavigation,
  onClick,
}: RowProps) {
  const {selectable, selectMode, condensed} = useIndexRow();
  const onSelectionChange = useIndexSelectionChange();
  const {
    value: hovered,
    setTrue: setHoverIn,
    setFalse: setHoverOut,
  } = useToggle(false);

  const handleInteraction = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent) => {
      event.stopPropagation();
      let selectionType = SelectionType.Single;

      if (('key' in event && event.key !== ' ') || !onSelectionChange) return;

      if (event.nativeEvent.shiftKey) {
        selectionType = SelectionType.Multi;
      } else if (subHeaderRange) {
        selectionType = SelectionType.Range;
      }

      const selection: string | Range = subHeaderRange ?? id;
      onSelectionChange(selectionType, !selected, selection, position);
    },
    [id, onSelectionChange, selected, subHeaderRange, position],
  );

  const contextValue = useMemo(
    () => ({
      itemId: id,
      selected,
      position,
      onInteraction: handleInteraction,
      disabled,
    }),
    [id, selected, disabled, position, handleInteraction],
  );

  const primaryLinkElement = useRef<HTMLAnchorElement | null>(null);
  const isNavigating = useRef<boolean>(false);
  const tableRowRef = useRef<TableRowElementType | null>(null);

  const tableRowCallbackRef = useCallback((node: TableRowElementType) => {
    tableRowRef.current = node;

    const el = node?.querySelector('[data-primary-link]');

    if (el) {
      primaryLinkElement.current = el as HTMLAnchorElement;
    }
  }, []);

  const rowClassName = classNames(
    styles.TableRow,
    subHeaderRange && styles['TableRow-subheader'],
    selectable && condensed && styles.condensedRow,
    selected && styles['TableRow-selected'],
    subdued && styles['TableRow-subdued'],
    hovered && !condensed && styles['TableRow-hovered'],
    disabled && styles['TableRow-disabled'],
    status && styles[variationName('status', status)],
    !selectable &&
      !primaryLinkElement.current &&
      styles['TableRow-unclickable'],
  );

  let handleRowClick;

  if ((!disabled && selectable) || primaryLinkElement.current) {
    handleRowClick = (event: React.MouseEvent) => {
      if (!tableRowRef.current || isNavigating.current) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();

      if (onClick) {
        onClick();
        return;
      }

      if (primaryLinkElement.current && !selectMode) {
        isNavigating.current = true;
        const {ctrlKey, metaKey} = event.nativeEvent;

        if (onNavigation) {
          onNavigation(id);
        }

        if (
          (ctrlKey || metaKey) &&
          primaryLinkElement.current instanceof HTMLAnchorElement
        ) {
          isNavigating.current = false;
          window.open(primaryLinkElement.current.href, '_blank');
          return;
        }

        primaryLinkElement.current.dispatchEvent(
          new MouseEvent(event.type, event.nativeEvent),
        );
      } else {
        isNavigating.current = false;
        handleInteraction(event);
      }
    };
  }

  const RowWrapper = condensed ? 'li' : 'tr';
  const checkboxMarkup = selectable ? <Checkbox /> : null;

  return (
    <RowContext.Provider value={contextValue}>
      <RowHoveredContext.Provider value={hovered}>
        <RowWrapper
          key={id}
          className={rowClassName}
          onMouseEnter={setHoverIn}
          onMouseLeave={setHoverOut}
          onClick={handleRowClick}
          ref={tableRowCallbackRef}
        >
          {checkboxMarkup}
          {children}
        </RowWrapper>
      </RowHoveredContext.Provider>
    </RowContext.Provider>
  );
});
