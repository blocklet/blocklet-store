import { CloudFrontRequest } from 'aws-lambda';

export type ViewRequestEvent = {
  Records: Array<{
    cf: {
      config: {
        readonly distributionDomainName: string;
        readonly distributionId: string;
        readonly eventType: 'origin-request' | 'origin-response' | 'viewer-request' | 'viewer-response';
        readonly requestId: string;
      };
      request: CloudFrontRequest;
    };
  }>;
};

export interface BlockletMeta {
  payment: {
    price: [{ address: string; value: number }];
    share: [];
  };
}
