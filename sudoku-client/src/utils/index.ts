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
