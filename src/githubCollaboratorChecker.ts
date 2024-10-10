import axios from 'axios';
import ora, {Ora} from 'ora';

interface Repo {
  name: string;

  [key: string]: any;
}

export class GitHubCollaboratorChecker {
  private readonly spinner : Ora;
  private readonly username: string;
  private readonly token: string;

  constructor(username: string, token: string) {
    this.username = username;
    this.token = token;
    this.spinner = ora();
  }

  private async getRepositories(): Promise<Repo[]> {
    try {
      this.spinner.text = 'Fetching repositories...';
      const repos: Repo[] = [];
      const LIMIT = 100;
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await axios.get<Repo[]>(`https://api.github.com/user/repos`, {
          headers: { 'Authorization': `token ${this.token}` },
          params: {
            per_page: LIMIT,
            page: page,
            visibility: 'all',
          },
        });

        repos.push(...response.data);

        if (response.data.length < LIMIT) {
          hasNextPage = false;
        } else {
          page++;
        }
      }

      console.log(`Fetched ${repos.length} repositories.`);
      return repos;
    } catch (error) {
      throw error;
    }
  }

  private async hasCollaborators(repoName: string): Promise<boolean> {
    try {
      const response = await axios.get<any[]>(`https://api.github.com/repos/${this.username}/${repoName}/collaborators`, {
        headers: { 'Authorization': `token ${this.token}` },
        validateStatus: (status) => status < 500,
      });

      const collaborators: string[] = response.data?.map((collab) => collab.login);
      const hasCollab = collaborators.filter((collab) => collab !== this.username).length > 0;

      return response.status === 200 && hasCollab;
    } catch (error) {
      return false;
    }
  }

  public async getReposWithCollaborators(): Promise<string[]> {
    this.spinner.start("Checking repositories with collaborators...");
    try {
      const repos = await this.getRepositories();
      const reposWithCollaborators: string[] = [];

      for (const repo of repos) {
        this.spinner.text = `Checking ${repo.name}...`;
        const hasCollab = await this.hasCollaborators(repo.name);
        if (hasCollab) {
          reposWithCollaborators.push(repo.name);
        }
      }

      this.spinner.succeed('Finished checking repositories.');
      return reposWithCollaborators;
    } catch (error) {
      throw error;
    }
  }
}
