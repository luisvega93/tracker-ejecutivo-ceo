import type { TrackerTask } from "@/lib/tracker/types";

function compareNullableNumber(left: number | null, right: number | null) {
  if (left === right) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return left - right;
}

function compareNullableString(left: string | null, right: string | null) {
  if (left === right) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return left.localeCompare(right);
}

export function sortTrackerTasks(tasks: TrackerTask[]) {
  return [...tasks].sort((left, right) => {
    const sourceRowOrder = compareNullableNumber(left.source_row, right.source_row);

    if (sourceRowOrder !== 0) {
      return sourceRowOrder;
    }

    const fechaOrder = compareNullableString(left.fecha_iso, right.fecha_iso);

    if (fechaOrder !== 0) {
      return fechaOrder;
    }

    return left.created_at.localeCompare(right.created_at);
  });
}
