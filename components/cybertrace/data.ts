import csvRaw from "../../data/hacker_flow_full.csv?raw";
import { parseCsv } from "./utils";

export const loadHackerCsvData = () => parseCsv(csvRaw);

