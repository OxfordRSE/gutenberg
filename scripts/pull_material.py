import os
import git
import pathlib
import logging
import yaml

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# The base of the Gutenberg repository file tree
BASE_DIR = pathlib.Path(__file__).parent.parent

# Read the enviroment, or else use sensible defaults
env_yaml_template = os.getenv('YAML_TEMPLATE', 'config/oxford.yaml')
env_base_material_dir = os.getenv('MATERIAL_DIR', '.material')

# Fully-resolved absolute paths to the yaml template and material dir
yaml_template = pathlib.Path(BASE_DIR / env_yaml_template).resolve()
base_material_dir = pathlib.Path(BASE_DIR / env_base_material_dir).resolve()

assert yaml_template.is_file()
assert base_material_dir.is_relative_to(BASE_DIR)
base_material_dir.mkdir(parents=True, exist_ok=True)


def init_repos() -> None:
    """
    Initializes all repositories specified in the YAML configuration file.
    Reads the repository configurations, processes each repository by setting up
    the local directories, and ensuring they are up to date.
    """
    repos = read_repos()
    for key in repos:
        repo_path = repos[key]['path']
        repo_url = repos[key]['url']
        init_repo(repo_path, repo_url)


def read_repos() -> dict:
    """
    Reads the YAML configuration file to extract repository data.
    Returns:
        dict: A dictionary containing the repository configurations.
    """
    with yaml_template.open('r', encoding='utf8') as file:
        repos = yaml.safe_load(file).get('material')
    return repos


def init_repo(repo_dir: str, repo_url: str):
    """
    Initializes or updates a given repository.
    Checks if the repository already exists and is a Git repository. If not,
    it attempts to clone it. If it exists, it checks the remote URL and pulls the latest changes.

    Args:
        repo_dir (str): The directory relative to the base material directory to initialize the repository.
        repo_url (str): The URL of the remote repository.

    Raises:
        Exception: If the directory is not empty and not a valid Git repository.
    """
    material_dir = base_material_dir / repo_dir
    material_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        repo = git.Repo(material_dir)
        origin_url = repo.remotes['origin'].url
        if repo_url.lower().replace('/', '') != origin_url.lower().replace('/', ''):
            logging.error(f'Expected remote to be {repo_url}, but found {origin_url}')
            return
        logging.info(f'Found {origin_url} in {material_dir}. Pulling the latest changes.')
        repo.git.stash()
        repo.git.pull()
        logging.info('Update completed successfully.')
    except git.GitError:
        if any(material_dir.iterdir()):
            logging.error(f'Cannot clone because {material_dir} is not empty and not a Git repository.')
            return
        logging.info(f'Cloning {repo_url} into {material_dir}')
        repo = git.Repo.clone_from(repo_url, material_dir)
        logging.info('Cloning completed successfully.')


if __name__ == '__main__':
    init_repos()
