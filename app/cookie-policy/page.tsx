import MDX from 'components/mdx';

import Content from './content.mdx';

const Page = async (): Promise<JSX.Element> => (
  <MDX>
    <Content />
  </MDX>
);

export default Page;
