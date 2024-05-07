import CommonResponse from "../types/commonResponse.type.ts";

export default function handleError(res: CommonResponse, err: any, code = 400) {
  if (Deno.env.get("NODE_ENV")! !== "test") console.log(err);
  res.status(code).send({ message: null, error: err?.message || err });
}
