###################################################
#
# Base Image
#
###################################################

FROM ubuntu:22.04 as base

# Labels
LABEL org.opencontainers.image.source=https://github.com/OpenTOSCA/opentosca-vintner
LABEL org.opencontainers.image.description="OpenTOSCA Vintner (Base Image)"
LABEL org.opencontainers.image.licenses=Apache-2.0

# Working directory
WORKDIR /vintner

# Installation scripts
COPY --chmod=+x src/assets/scripts ./scripts

# Install utils
RUN ./scripts/install-utils.sh

# Configure git
RUN git config --global user.email vintner@opentosca.org
RUN git config --global user.name vintner

# Install Python
RUN ./scripts/install-python.sh

# Install OpenStack CLI
# TODO: do we need that?
RUN ./scripts/install-openstack.sh

# Install Ansible
# TODO: do we need that?
RUN ./scripts/install-ansible.sh

# Install Terraform
RUN ./scripts/install-terraform.sh

# Install GCP CLI
RUN ./scripts/install-gcloud.sh

# Install Unfurl
RUN ./scripts/install-unfurl.sh

# Install xOpera
RUN ./scripts/install-xopera.sh


###################################################
#
# Run Image
#
###################################################

FROM base as run

# Labels
LABEL org.opencontainers.image.source=https://github.com/OpenTOSCA/opentosca-vintner
LABEL org.opencontainers.image.description="OpenTOSCA Vintner"
LABEL org.opencontainers.image.licenses=Apache-2.0

# Install vintner
COPY ./dist/vintner-linux-x64 /bin/vintner
ENV OPENTOSCA_VINTNER_HOME_DIR=/vintner/data

# Copy examples
COPY ./examples ./examples

# Entrypoint
COPY --chmod=+x docker-entrypoint.sh .
ENTRYPOINT /vintner/docker-entrypoint.sh
