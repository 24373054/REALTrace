import csvRaw from "../../黑客攻击链路/hacker_flow_full.csv?raw";
import { parseCsv } from "./utils";

export const loadHackerCsvData = () => parseCsv(csvRaw);

