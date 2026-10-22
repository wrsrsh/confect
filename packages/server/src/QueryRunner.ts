import * as Ref from "@confect/core/Ref";
import { type GenericActionCtx } from "convex/server";
import { Context, Layer } from "effect";

const make =
  (runQuery: GenericActionCtx<any>["runQuery"]) =>
  <Query extends Ref.AnyQuery>(
    query: Query,
    ...args: Ref.OptionalArgs<Query>
  ) =>
    Ref.runWithCodec(
      query,
      (args[0] ?? {}) as Ref.Args<Query>,
      (functionReference, encodedArgs) =>
        runQuery(functionReference, encodedArgs),
    );

export const QueryRunner = Context.GenericTag<ReturnType<typeof make>>(
  "@confect/server/QueryRunner",
);
export type QueryRunner = typeof QueryRunner.Identifier;

export const layer = (runQuery: GenericActionCtx<any>["runQuery"]) =>
  Layer.succeed(QueryRunner, make(runQuery));
