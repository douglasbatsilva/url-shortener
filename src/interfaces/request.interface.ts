export interface IRequestUser {
  id: number;
}

interface IShortUrlParams {
  shortUrl: string;
}

export interface IRequest {
  ip: string;
  userAgent: string;
  hostname: string;
  params: IShortUrlParams;
  user: IRequestUser;
}
