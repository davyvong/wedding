import SecretLinkSent from 'components/secret-link-sent';

interface PageProps {
  searchParams: {
    to?: string;
  };
}

const Page = async ({ searchParams }: PageProps): Promise<JSX.Element> => {
  return <SecretLinkSent email={searchParams.to} />;
};

export default Page;
