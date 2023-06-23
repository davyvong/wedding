import SecretLinkSent from 'components/secret-link-sent';

const Page = async ({ searchParams }): Promise<JSX.Element> => {
  return <SecretLinkSent email={searchParams.to} />;
};

export default Page;
