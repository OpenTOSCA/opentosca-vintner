FROM ubuntu:22.04

# Labels
LABEL org.opencontainers.image.source=https://github.com/OpenTOSCA/opentosca-vintner
LABEL org.opencontainers.image.description="OpenTOSCA Vintner"
LABEL org.opencontainers.image.licenses=Apache-2.0

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

# Install Python
RUN ./scripts/install-python.sh

# Install Ansible
RUN ./scripts/install-ansible.sh

# Install Terraform
RUN ./scripts/install-terraform.sh

# Install GCP CLI
RUN ./scripts/install-gcloud.sh

# Install Unfurl
RUN ./scripts/install-unfurl.sh

# Install xOpera
RUN ./scripts/install-xopera.sh

# Install vintner
COPY ./dist/vintner-linux-x64 /bin/vintner
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
