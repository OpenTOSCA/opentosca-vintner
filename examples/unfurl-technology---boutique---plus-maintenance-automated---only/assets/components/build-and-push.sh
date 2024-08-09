#! /usr/bin/bash
set -e

# Tag
TAG=v6
if [ -z "${TAG}" ]; then
  echo "TAG not defined"
  exit 1
fi

# Registry
REGISTRY=milesstoetzner
if [ -z "${REGISTRY}" ]; then
  echo "REGISTRY not defined"
  exit 1
fi

# Checkout
docker build -t ${REGISTRY}/boutique-checkout:${TAG} src/checkoutservice
docker push ${REGISTRY}/boutique-checkout:${TAG}

# Cart
docker build -t ${REGISTRY}/boutique-cart:${TAG} src/cartservice/src
docker push ${REGISTRY}/boutique-cart:${TAG}

# Payment
docker build -t ${REGISTRY}/boutique-payment:${TAG} src/paymentservice
docker push ${REGISTRY}/boutique-payment:${TAG}

# Frontend
docker build -t ${REGISTRY}/boutique-frontend:${TAG} src/frontend
docker push ${REGISTRY}/boutique-frontend:${TAG}

# Recommendation
docker build -t ${REGISTRY}/boutique-recommendation:${TAG} src/recommendationservice
docker push ${REGISTRY}/boutique-recommendation:${TAG}

# Analytics
docker build -t ${REGISTRY}/boutique-analytics:${TAG} src/analyticalservice
docker push ${REGISTRY}/boutique-analytics:${TAG}
