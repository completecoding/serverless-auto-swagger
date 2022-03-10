import { exec } from 'child_process';
import { GlobalConfig } from '@jest/types/build/Config';

export default async function setup(globalConfig: GlobalConfig) {
  process.stdout.write('generating swagger files in all test repos...');

  // could add some logic in here to decide whether to run the swagger generate or not
  // Only required when running the smoke tests. so ignote when running unit tests
  // could also set it to only generate swagger for a single repo if smoke testing one at a time.

  const command = './tests/scripts/generateSwaggerAllRepos.sh';

  await new Promise((resolve, reject) =>
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.log('error');
        resolve(1);
        return;
      }
      if (stderr) {
        console.log('stderr');
        resolve(1);
        return;
      }
      resolve(stdout);
    })
  );

  return;
}
