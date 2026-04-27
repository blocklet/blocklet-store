import { Comments } from '../../components/comments';

export default function TabComments({
  did,
  blockletState,
}: {
  did: string;
  blockletState: {
    data?: {
      title: string;
      description: string;
      owner: {
        did: string;
      };
    };
  };
}) {
  return (
    <Comments
      displayConnectButton
      target={{
        id: did,
        title: blockletState.data?.title,
        desc: blockletState.data?.description,
        owner: blockletState.data?.owner.did,
      }}
    />
  );
}
