import { useParams } from 'react-router-dom';
import AuthorBlocklet from './author-blocklet';
import CategoryBlocklet from './category-blocklet';
import Comment from './comment';
import Dependence from './dependence';
import MetaDetail from './meta-detail';
import Readme from './readme';
import Screens from './screens';
import Version from './version';
import Extension from './extension';
import { IBlockletInfo, IBlocklet } from '../../../../../type';

export default function BlockletInfo({ data }: { data: IBlockletInfo & { blocklet: IBlocklet } }) {
  const { version } = useParams();
  return (
    <>
      <Screens blocklet={data.blocklet} />
      <Readme readme={data.readme} />
      <Comment meta={data.blocklet.meta} specificVersion={version} />
      <Version version={data.version} specificVersion={version} />
      <Dependence blocklets={data.deps} />
      <MetaDetail meta={data.blocklet.meta} />
      <Extension meta={data.blocklet.meta} extensions={data.extensions} />
      <AuthorBlocklet meta={data.blocklet.meta} blocklets={data.authorBlocklets} />
      <CategoryBlocklet meta={data.blocklet.meta} blocklets={data.categoriesBlocklets} />
    </>
  );
}
