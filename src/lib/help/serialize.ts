import { WithId } from "mongodb";
import { Flashcastr } from "../mongodb/flashcastr/types";

export function serializeDoc(doc: WithId<Flashcastr>) {
  return {
    ...doc,
    flash: {
      ...doc.flash,
      _id: doc.flash._id.toString(),
    },
    _id: doc._id?.toString(), // convert ObjectId to string
  };
}
