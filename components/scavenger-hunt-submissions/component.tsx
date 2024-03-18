import { ScavengerHuntTaskId } from 'components/scavenger-hunt/constants';
import { FC, ReactNode, useCallback } from 'react';

interface ScavengerHuntSubmissionsComponentProps {
  submissions: { tasks: { id: ScavengerHuntTaskId; uploadedAt: Date }[]; username: string }[];
}

const ScavengerHuntSubmissionsComponent: FC<ScavengerHuntSubmissionsComponentProps> = ({ submissions }) => {
  const renderTask = useCallback((username: string, task: { id: ScavengerHuntTaskId; uploadedAt: Date }): ReactNode => {
    const path = username + '/' + task.id;
    const url = new URL('https://scavenger.vivian-and-davy.com/' + path);
    return (
      <a key={path} href={url.href}>
        {url.href}
      </a>
    );
  }, []);

  const renderSubmission = useCallback(
    (submission: { tasks: { id: ScavengerHuntTaskId; uploadedAt: Date }[]; username: string }): ReactNode => (
      <div key={submission.username}>{submission.tasks.map(task => renderTask(submission.username, task))}</div>
    ),
    [renderTask],
  );

  return submissions.map(renderSubmission);
};

export default ScavengerHuntSubmissionsComponent;
