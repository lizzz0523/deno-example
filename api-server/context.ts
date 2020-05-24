import { ServerRequest, DB } from './deps.ts';

// handler传入的参数
export type Context = {
  req: ServerRequest,
  url: URL,
  db: DB,
};
// handler是一个async函数，所以这里返回的是一个Promise
export type Handler = (ctx: Context) => Promise<void>;