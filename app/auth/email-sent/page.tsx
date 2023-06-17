import RSVPEmailSent from 'components/rsvp-email-sent';

const Page = async ({ searchParams }): Promise<JSX.Element> => {
  return <RSVPEmailSent email={searchParams.email} />;
};

export default Page;
