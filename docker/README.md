# COSMC Docker image

This directory provides a simple way to build and run COSMC in a standalone Docker image. It uses Docker and Docker Compose.

### Building the Docker image

1. Navigate to the `docker` directory in a terminal.
1. Run the following:
    ```sh
    docker-compose build cosmc
    ```

### Running the Docker image

1. Follow the instructions at https://github.com/arnoudbuzing/wolfram-engine-docker to activate a Wolfram Engine license and obtain a password file.
1. Save your password file on your local machine, e.g. at `~/wolfram/licensing/mathpass`.
1. Navigate to the `docker` directory in a terminal.
1. Run the following:
    ```sh
    WOLFRAM_LICENSING_DIR=~/wolfram/licensing docker-compose run cosmc
    ```
    This will launch a Docker container with the model code, use your password file to activate the Wolfram Engine, and run the Wolfram Engine.

    By default, this runs `model/model.wl`. Change the value of `command` in `docker-compose.yml` to run different Wolfram Language code or files from the repository.