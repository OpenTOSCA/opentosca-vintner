#! /usr/bin/bash
set -e

TAG=v5


# Checkout
docker build -t milesstoetzner/boutique-checkout:${TAG} src/checkoutservice
docker push milesstoetzner/boutique-checkout:${TAG}

# Cart
docker build -t milesstoetzner/boutique-cart:${TAG} src/cartservice/src
docker push milesstoetzner/boutique-cart:${TAG}

# Payment
docker build -t milesstoetzner/boutique-payment:${TAG} src/paymentservice
docker push milesstoetzner/boutique-payment:${TAG}

# Frontend
docker build -t milesstoetzner/boutique-frontend:${TAG} src/frontend
docker push milesstoetzner/boutique-frontend:${TAG}

# Recommendation
docker build -t milesstoetzner/boutique-recommendation:${TAG} src/recommendationservice
docker push milesstoetzner/boutique-recommendation:${TAG}

# Analytics
docker build -t milesstoetzner/boutique-analytics:${TAG} src/analyticalservice
docker push milesstoetzner/boutique-analytics:${TAG}
