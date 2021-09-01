import { defaultLabel } from "src/utils/defaultLabel";
import { defaultTestId } from "src/utils/defaultTestId";
import { TestIds } from "src/utils/useTestIds";

/**
 * Provides behavior common to most filters.
 *
 * Note that we don't export this outside of beam; downstream projects can still
 * implement their own filters using the `Filter` interface, but just to keep OO
 * coupling to a minimum, we treat this base class as an internal implementation
 * detail.
 */
export class BaseFilter<V, P extends { label?: string; defaultValue?: V }> {
  constructor(protected key: string, protected props: P) {}

  get label(): string {
    return this.props.label || defaultLabel(this.key);
  }

  get defaultValue() {
    return this.props.defaultValue;
  }

  protected testId(tid: TestIds): object {
    return tid[defaultTestId(this.label)];
  }
}
