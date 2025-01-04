export const formatAlgorithmString = (algorithm: string): string => {
    switch (algorithm) {
        case "SoleCandidate":
            return "Sole Candidate";
        case "UniqueBox":
            return "Unique Box";
        case "UniqueRow":
            return "Unique Row";
        case "UniqueCol":
            return "Unique Column";
        case "NakedSet":
            return "Naked Set";
        case "HiddenSet":
            return "Hidden Set";
        default:
            return algorithm;
    }
}

// Converts [row, column] index format to single value between 0-81
export const twoToOneIndex = (arr: number[]): number => {
    return arr[0] * 9 + arr[1];
};

// Determines if two cells are in the same row, column or box
export const isSameHouse = (a: number, b: number): boolean => {
    // Same row
    if (Math.floor(a / 9) * 9 === Math.floor(b / 9) * 9) {
      return true;
    }

    // Same column
    if (a % 9 === b % 9) {
      return true;
    }

    // Same box
    if (
      Math.floor(a / 27) === Math.floor(b / 27) &&
      Math.floor((a % 9) / 3) === Math.floor((b % 9) / 3)
    ) {
      return true;
    }
    return false;
}
