import QueryString from "qs";
import { Request } from "express";

type CommonRequest = Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>;
export default CommonRequest;
