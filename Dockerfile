FROM node:18.15.0-bullseye as build
WORKDIR /app
COPY . .
RUN yarn --immutable
RUN yarn test
RUN yarn build
RUN yarn pkg --config .pkgrc.linux-x64.json build/cli/index.js


FROM ubuntu:22.04 as run

# Working directory
WORKDIR /vintner

# Install sudo
RUN apt-get update -y && apt-get install sudo -y

# Installation scripts
RUN mkdir ./scripts
COPY src/assets/scripts ./scripts

# Install wget
RUN ./scripts/install-wget.sh

# Install git
RUN ./scripts/install-git.sh
RUN git config --global user.email vintner@opentosca.org
RUN git config --global user.name vintner

# Install python
RUN ./scripts/install-python.sh

# Install Ansible
RUN ./scripts/install-ansible.sh

# Install Terraform
RUN ./scripts/install-terraform.sh
# TODO: authenticate in docker-entrypoint?

# Install GCP CLI
RUN ./scripts/install-gcloud.sh

# Install Unfurl
RUN ./scripts/install-unfurl.sh

# Install xOpera
RUN ./scripts/install-xopera.sh

# Install vintner
COPY --from=build /app/dist/vintner /bin/vintner
ENV OPENTOSCA_VINTNER_HOME_DIR=/vintner/data
RUN vintner setup init

# Configure Unfurl
RUN vintner orchestrators init unfurl --no-venv

# Configure xOpera
RUN vintner orchestrators init xopera --no-venv
RUN vintner orchestrators enable --orchestrator xopera

# Entrypoint
COPY docker-entrypoint.sh .
ENTRYPOINT /vintner/docker-entrypoint.sh
