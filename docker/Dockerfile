###################################################
#
# Base Image
#
###################################################

FROM ubuntu:22.04 AS base

# Labels
LABEL org.opencontainers.image.source=https://github.com/OpenTOSCA/opentosca-vintner
LABEL org.opencontainers.image.description="OpenTOSCA Vintner (Base Image)"
LABEL org.opencontainers.image.licenses=Apache-2.0

# Install utils
COPY --chmod=0755 src/assets/scripts/install-utils.sh ./scripts/
RUN ./scripts/install-utils.sh

# Configure git
RUN git config --global user.email vintner@opentosca.org
RUN git config --global user.name vintner

# Install Python
COPY --chmod=0755 src/assets/scripts/install-python.sh ./scripts/
RUN ./scripts/install-python.sh

# Install OpenStack CLI
COPY --chmod=0755 src/assets/scripts/install-openstack.sh ./scripts/
RUN ./scripts/install-openstack.sh

# Install Ansible
COPY --chmod=0755 src/assets/scripts/install-ansible.sh ./scripts/
RUN ./scripts/install-ansible.sh

# Install Terraform
COPY --chmod=0755 src/assets/scripts/install-terraform.sh ./scripts/
RUN ./scripts/install-terraform.sh

# Install GCP CLI
COPY --chmod=0755 src/assets/scripts/install-gcloud.sh ./scripts/
RUN ./scripts/install-gcloud.sh

# Install Unfurl
COPY --chmod=0755 src/assets/scripts/install-unfurl.sh ./scripts/
RUN ./scripts/install-unfurl.sh

# Install xOpera
COPY --chmod=0755 src/assets/scripts/install-xopera.sh ./scripts/
RUN ./scripts/install-xopera.sh

# Cleanup
RUN rm -rf ./scripts


###################################################
#
# Run Image
#
###################################################

FROM base AS run

# Labels
LABEL org.opencontainers.image.source=https://github.com/OpenTOSCA/opentosca-vintner
LABEL org.opencontainers.image.description="OpenTOSCA Vintner"
LABEL org.opencontainers.image.licenses=Apache-2.0

# Working directory
WORKDIR /vintner

# Install vintner
COPY ./dist/vintner-linux-x64 /bin/vintner
ENV OPENTOSCA_VINTNER_HOME_DIR=/vintner/data

# Copy examples
COPY ./examples ./examples

# Entrypoint
COPY --chmod=0755 docker/docker-entrypoint.sh .
SHELL ["/bin/bash", "-c"]
ENTRYPOINT /vintner/docker-entrypoint.sh
