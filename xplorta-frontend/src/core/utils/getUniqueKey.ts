import { v4 as uuidV4 } from "uuid";

export default function getUniqueKey() {
  return uuidV4();
}
