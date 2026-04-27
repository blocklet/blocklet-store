interface Window {
  blocklet?: {
    appUrl: string;
    prefix: string;
    version: string;
    preferences: {
      passportStakeCurrency: string;
      needReview: boolean;
      permissionMode: string;
      officialAccounts: { did: string }[];
    };
    componentMountPoints: {
      did: string;
      mountPoint: string;
      title: string;
      version: string;
    }[];
  };
}
