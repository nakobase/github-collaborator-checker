import dotenv from 'dotenv';
import {GitHubCollaboratorChecker} from "./githubCollaboratorChecker.js";

dotenv.config();

const username = process.env.GITHUB_USERNAME as string;
const token = process.env.GITHUB_TOKEN as string;

if (!username || !token) {
  console.error('ERROR: Please set GITHUB_USERNAME and GITHUB_TOKEN in .env file');
  process.exit(1);
}

const checker = new GitHubCollaboratorChecker(username, token);

checker.getReposWithCollaborators().then((repos) => {
  if (repos.length === 0) {
    console.log('INFO: There are no repositories with collaborators.');
  } else {
    console.log('INFO: Repositories with collaborators:');
    repos.forEach((repo) => console.log(`- ${repo} - https://github.com/${username}/${repo}`));
  }
}).catch((error) => {
  console.error('ERROR: ', error);
});
