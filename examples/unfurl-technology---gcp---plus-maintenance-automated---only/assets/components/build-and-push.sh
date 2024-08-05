#! /usr/bin/bash
set -e

# Checkout
docker build -t milesstoetzner/boutique-checkout:latest src/checkoutservice
docker push milesstoetzner/boutique-checkout:latest

# Cart
docker build -t milesstoetzner/boutique-cart:latest src/cartservice/src
docker push milesstoetzner/boutique-cart:latest

# Payment
docker build -t milesstoetzner/boutique-payment:latest src/paymentservice
docker push milesstoetzner/boutique-payment:latest

# Frontend
docker build -t milesstoetzner/boutique-frontend:latest src/frontend
docker push milesstoetzner/boutique-frontend:latest

# Recommendation
docker build -t milesstoetzner/boutique-recommendation:latest src/recommendationservice
docker push milesstoetzner/boutique-recommendation:latest

# Analytics
docker build -t milesstoetzner/boutique-analytics:latest src/analyticalservice
docker push milesstoetzner/boutique-analytics:latest