import { CloudFrontHeaders } from 'aws-lambda';

export default class Headers {
  private headers: CloudFrontHeaders;

  constructor(headers: CloudFrontHeaders) {
    this.headers = headers;
  }

  get(key: string): string {
    return this.headers[key] && this.headers[key][0].value;
  }
}
