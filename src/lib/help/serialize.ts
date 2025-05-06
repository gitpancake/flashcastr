import { WithId } from "mongodb";
import { Flashcastr } from "../mongodb/flashcastr/types";
import { User, UserWithoutSigner } from "../mongodb/users/types";

export function serializeFlashcastr(doc: WithId<Flashcastr>) {
  return {
    ...doc,
    flash: {
      ...doc.flash,
      _id: doc.flash._id.toString(),
    },
    _id: doc._id?.toString(), // convert ObjectId to string
  };
}

export function serializeUser(doc: WithId<User | UserWithoutSigner>) {
  return {
    ...doc,
    _id: doc._id?.toString(), // convert ObjectId to string
  };
}
