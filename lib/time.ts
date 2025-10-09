export function nowUtc(): Date {
  return new Date();
}

export function isClosed(closingDateIso: string, referenceDate: Date = nowUtc()): boolean {
  const closingDate = new Date(closingDateIso);

  if (Number.isNaN(closingDate.getTime())) {
    throw new Error(`Invalid closing date supplied: ${closingDateIso}`);
  }

  return referenceDate.getTime() >= closingDate.getTime();
}
